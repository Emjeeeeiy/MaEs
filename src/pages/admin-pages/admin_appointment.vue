<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
    <!-- ✅ Sidebar -->
    <aside
      class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-screen pt-16 overflow-y-auto shadow-sm custom-scrollbar"
    >
      <AdminSidebar />
    </aside>

    <!-- ✅ Main Content Wrapper -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- ✅ Topbar -->
      <div
        class="fixed top-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-6 md:left-64 md:right-0 w-full"
      >
        <AdminTopbar />
      </div>

      <!-- ✅ Scrollable Content -->
      <main class="flex-1 pt-16 p-6 overflow-y-auto custom-scrollbar">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <select
            v-model="filterStatus"
            class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by email or service"
            class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
          />
        </div>

        <!-- Appointments Table -->
        <div class="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
              <tr>
                <th class="px-4 py-2 border-b border-gray-300">Email</th>
                <th class="px-4 py-2 border-b border-gray-300">Services</th>
                <th class="px-4 py-2 border-b border-gray-300">Date</th>
                <th class="px-4 py-2 border-b border-gray-300">Notes</th>
                <th class="px-4 py-2 border-b border-gray-300">Status</th>
                <th class="px-4 py-2 border-b border-gray-300">Approved Date</th>
                <th class="px-4 py-2 border-b border-gray-300">Declined Date</th>
                <th class="px-4 py-2 border-b border-gray-300">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ appt.email }}</td>
                <td class="px-4 py-2">
                  {{ appt.services.map((s) => s.serviceName).join(', ') }}
                </td>
                <td class="px-4 py-2">{{ appt.date }}</td>
                <td class="px-4 py-2">{{ appt.notes }}</td>
                <td class="px-4 py-2 capitalize">{{ appt.status }}</td>
                <td class="px-4 py-2">
                  <span v-if="appt.approvedAt">{{ formatTimestamp(appt.approvedAt) }}</span>
                  <span v-else>—</span>
                </td>
                <td class="px-4 py-2">
                  <span v-if="appt.declinedAt">{{ formatTimestamp(appt.declinedAt) }}</span>
                  <span v-else>—</span>
                </td>
                <td class="px-4 py-2 flex gap-2 flex-wrap">
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Approved')"
                    class="px-2 py-1 border border-green-500 text-green-600 rounded text-xs hover:bg-green-50 transition"
                  >
                    Approve
                  </button>
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Declined')"
                    class="px-2 py-1 border border-red-500 text-red-600 rounded text-xs hover:bg-red-50 transition"
                  >
                    Decline
                  </button>
                  <button
                    @click="confirmDelete(appt.id)"
                    class="px-2 py-1 border border-gray-400 text-gray-700 rounded text-xs hover:bg-gray-100 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredAppointments.length === 0">
                <td colspan="8" class="text-center px-4 py-4 text-gray-500">
                  No appointments found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      >
        <div class="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-200 shadow-lg">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Confirm Deletion</h2>
          <p class="text-gray-600 mb-4">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              @click="deleteAppointment"
              class="px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminSidebar from '@/components/admin_sidebar.vue';
import AdminTopbar from '@/components/AdminTopbar.vue';

const appointments = ref([]);
const filterStatus = ref('');
const searchQuery = ref('');
const showDeleteModal = ref(false);
const pendingDeleteId = ref(null);

onMounted(() => {
  const apptCol = collection(db, 'appointments');
  onSnapshot(apptCol, (snap) => {
    appointments.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  });
});

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const updateStatus = async (id, newStatus) => {
  try {
    const updateData = { status: newStatus };
    if (newStatus === 'Approved') {
      updateData.approvedAt = serverTimestamp();
      updateData.declinedAt = null;
    } else if (newStatus === 'Declined') {
      updateData.declinedAt = serverTimestamp();
      updateData.approvedAt = null;
    }
    await updateDoc(doc(db, 'appointments', id), updateData);
  } catch (err) {
    console.error('Failed to update status:', err.message);
  }
};

const confirmDelete = (id) => {
  pendingDeleteId.value = id;
  showDeleteModal.value = true;
};

const deleteAppointment = async () => {
  try {
    await deleteDoc(doc(db, 'appointments', pendingDeleteId.value));
    showDeleteModal.value = false;
  } catch (err) {
    console.error('Failed to delete:', err.message);
  }
};

const filteredAppointments = computed(() => {
  return appointments.value.filter((a) => {
    const statusOK = !filterStatus.value || a.status.toLowerCase() === filterStatus.value.toLowerCase();
    const term = searchQuery.value.toLowerCase();
    const emailMatch = a.email.toLowerCase().includes(term);
    const svcMatch = a.services.map((s) => s.serviceName.toLowerCase()).join(' ').includes(term);
    return statusOK && (emailMatch || svcMatch);
  });
});
</script>
