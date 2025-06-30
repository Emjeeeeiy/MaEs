<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-gray-100">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r border-gray-800 bg-[#111]" />

    <!-- Main -->
    <div class="flex-1 flex flex-col h-screen">
      <AdminTopbar />

      <main class="flex-1 p-6 space-y-6 overflow-y-auto">
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
                    @click="deleteAppointment(appt.id)"
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
    alert('Failed to update status: ' + err.message);
  }
};

const deleteAppointment = async (id) => {
  if (confirm('Are you sure you want to delete this appointment?')) {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
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
