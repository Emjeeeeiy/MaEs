<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r bg-white" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <Topbar />

      <main class="flex-1 p-6 space-y-6 overflow-y-auto">
        <h2 class="text-2xl font-semibold">Appointment Management</h2>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 items-center bg-white p-4 rounded-md shadow border">
          <select
            v-model="filterStatus"
            class="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by email or department"
            class="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
          />
        </div>

        <!-- Appointments Table -->
        <div class="overflow-x-auto bg-white rounded shadow border">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead class="bg-gray-100 uppercase text-xs text-gray-600">
              <tr>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2">Department</th>
                <th class="px-4 py-2">Date</th>
                <th class="px-4 py-2">Notes</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ appt.email }}</td>
                <td class="px-4 py-2">{{ appt.department }}</td>
                <td class="px-4 py-2">{{ appt.date }}</td>
                <td class="px-4 py-2">{{ appt.notes }}</td>
                <td class="px-4 py-2 capitalize">{{ appt.status }}</td>
                <td class="px-4 py-2 space-x-2">
                  <button
                    @click="updateStatus(appt.id, 'approved')"
                    class="text-green-600 hover:underline"
                  >
                    Approve
                  </button>
                  <button
                    @click="updateStatus(appt.id, 'declined')"
                    class="text-red-600 hover:underline"
                  >
                    Decline
                  </button>
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
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminSidebar from '@/components/admin_sidebar.vue';
import Topbar from '@/components/Topbar.vue';

const appointments = ref([]);
const filterStatus = ref('');
const searchQuery = ref('');

onMounted(() => {
  const apptRef = collection(db, 'appointments');
  onSnapshot(apptRef, (snap) => {
    appointments.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });
});

const updateStatus = async (id, newStatus) => {
  try {
    await updateDoc(doc(db, 'appointments', id), { status: newStatus });
  } catch (error) {
    alert('Failed to update status: ' + error.message);
  }
};

const filteredAppointments = computed(() => {
  return appointments.value.filter((appt) => {
    const statusMatch =
      !filterStatus.value || appt.status.toLowerCase() === filterStatus.value.toLowerCase();
    const search = searchQuery.value.toLowerCase();
    const searchMatch =
      appt.email.toLowerCase().includes(search) ||
      appt.department.toLowerCase().includes(search);
    return statusMatch && searchMatch;
  });
});
</script>
