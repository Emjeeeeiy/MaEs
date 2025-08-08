<template>
  <div class="flex h-screen overflow-hidden bg-[#1a1a1a] text-gray-100">
    <!-- Sidebar (fixed below Topbar) -->
    <aside class="w-64 shrink-0 bg-[#111] border-r border-gray-800 fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">
      <AdminSidebar />
    </aside>

    <!-- Main Content Wrapper (with padding for sidebar) -->
    <div class="flex flex-col flex-1 pl-64 min-w-0">
      <!-- Fixed Topbar -->
      <div class="fixed top-0 left-0 right-0 z-20 h-16 shadow-md bg-[#1a1a1a] border-b border-gray-800">
        <AdminTopbar />
      </div>

      <!-- Scrollable Content Area -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6 mt-16">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 items-center bg-[#222] p-4 rounded-md shadow border border-gray-800">
          <select
            v-model="filterStatus"
            class="px-2 py-1 border border-gray-700 rounded-md text-sm bg-[#1a1a1a] text-gray-200"
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
            class="px-2 py-1 border border-gray-700 rounded-md text-sm bg-[#1a1a1a] text-gray-200"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto bg-[#222] rounded shadow border border-gray-800">
          <table class="min-w-full text-sm text-left text-gray-300">
            <thead class="bg-[#1e1e1e] uppercase text-xs text-gray-400">
              <tr>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Services</th>
                <th class="px-4 py-2">Date</th>
                <th class="px-4 py-2">Notes</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2">Approved Date</th>
                <th class="px-4 py-2">Declined Date</th>
                <th class="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="border-t border-gray-700 hover:bg-[#2a2a2a]"
              >
                <td class="px-4 py-2">{{ appt.email }}</td>
                <td class="px-4 py-2">
                  {{ appt.services.map((s) => s.serviceName).join(', ') }}
                </td>
                <td class="px-4 py-2">{{ appt.date }}</td>
                <td class="px-4 py-2">{{ appt.notes }}</td>
                <td class="px-4 py-2">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      appt.status === 'Approved'
                        ? 'bg-green-600/20 text-green-400'
                        : appt.status === 'Pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    ]"
                  >
                    {{ appt.status }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <span v-if="appt.approvedAt">
                    {{ formatTimestamp(appt.approvedAt) }}
                  </span>
                  <span v-else class="text-gray-500 text-xs italic">—</span>
                </td>
                <td class="px-4 py-2">
                  <span v-if="appt.declinedAt">
                    {{ formatTimestamp(appt.declinedAt) }}
                  </span>
                  <span v-else class="text-gray-500 text-xs italic">—</span>
                </td>
                <td class="px-4 py-2 text-center space-x-2">
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Approved')"
                    class="text-green-400 hover:underline"
                  >
                    Approve
                  </button>
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Declined')"
                    class="text-red-400 hover:underline"
                  >
                    Decline
                  </button>
                  <button
                    @click="confirmDelete(appt.id)"
                    class="text-gray-400 hover:text-red-500 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredAppointments.length === 0">
                <td colspan="8" class="px-4 py-6 text-center text-gray-500 text-sm italic">
                  No appointments found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div class="relative z-10 bg-[#1a1a1a] text-gray-100 p-6 rounded-lg shadow-xl border border-gray-700 max-w-sm w-full space-y-4">
        <h2 class="text-lg font-semibold text-red-400">Confirm Deletion</h2>
        <p class="text-sm">Are you sure you want to delete this appointment? This action cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
          <button
            @click="deleteAppointment"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
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
    const statusOK =
      !filterStatus.value ||
      a.status.toLowerCase() === filterStatus.value.toLowerCase();

    const term = searchQuery.value.toLowerCase();
    const emailMatch = a.email.toLowerCase().includes(term);
    const svcMatch = a.services
      .map((s) => s.serviceName.toLowerCase())
      .join(' ')
      .includes(term);

    return statusOK && (emailMatch || svcMatch);
  });
});
</script>
