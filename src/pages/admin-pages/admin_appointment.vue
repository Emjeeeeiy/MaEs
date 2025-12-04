<template>
  <div class="flex flex-col min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
    <!-- Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-14">
      <!-- Sidebar -->
      <aside>
        <AdminSidebar />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 overflow-y-auto h-[calc(100vh-3.5rem)] custom-scrollbar">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              v-model="filterStatus"
              class="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-green-500 focus:outline-none bg-white shadow-sm"
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
              class="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-green-500 focus:outline-none w-full sm:w-64 shadow-sm"
            />
          </div>
        </div>

        <!-- Appointments Table -->
        <div class="overflow-x-auto bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
          <table class="min-w-full text-xs sm:text-sm text-left text-gray-700">
            <thead class="bg-gray-100/70 border-b border-gray-200">
              <tr>
                <th class="px-3 py-2 font-medium">Email</th>
                <th class="px-3 py-2 font-medium">Services</th>
                <th class="px-3 py-2 font-medium">Date</th>
                <th class="px-3 py-2 font-medium">Notes</th>
                <th class="px-3 py-2 font-medium">Status</th>
                <th class="px-3 py-2 font-medium">Approved</th>
                <th class="px-3 py-2 font-medium">Declined</th>
                <th class="px-3 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td class="px-3 py-2">{{ appt.email }}</td>
                <td class="px-3 py-2">{{ appt.services.map(s => s.serviceName).join(', ') }}</td>
                <td class="px-3 py-2">{{ appt.date }}</td>
                <td class="px-3 py-2">{{ appt.notes }}</td>
                <td class="px-3 py-2">
                  <span
                    class="px-2 py-1 text-[0.65rem] sm:text-xs rounded-lg font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-700': appt.status === 'Pending',
                      'bg-green-100 text-green-700': appt.status === 'Approved',
                      'bg-red-100 text-red-700': appt.status === 'Declined'
                    }"
                  >
                    {{ appt.status }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <span v-if="appt.approvedAt">{{ formatTimestamp(appt.approvedAt) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-3 py-2">
                  <span v-if="appt.declinedAt">{{ formatTimestamp(appt.declinedAt) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-3 py-2 text-center flex justify-center gap-1 sm:gap-2">
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Approved')"
                    class="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition"
                  >
                    <CheckIcon class="w-3 h-3" /> Approve
                  </button>
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Declined')"
                    class="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
                  >
                    <XIcon class="w-3 h-3" /> Decline
                  </button>
                  <button
                    @click="confirmDelete(appt.id)"
                    class="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm transition"
                  >
                    <Trash2Icon class="w-3 h-3" /> Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredAppointments.length === 0">
                <td colspan="8" class="px-3 py-6 text-center text-gray-500 text-xs sm:text-sm">
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white/95 w-full max-w-md p-4 sm:p-6 rounded-xl border border-gray-200 shadow-xl relative animate-fadeIn">
          <h2 class="text-sm sm:text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <AlertTriangleIcon class="w-4 h-4 text-red-600" /> Confirm Deletion
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-4">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-2 sm:gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm transition"
            >
              Cancel
            </button>
            <button
              @click="deleteAppointment"
              class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
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
import { ref, onMounted, computed } from 'vue'
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/admintopbar.vue'
import { CheckIcon, XIcon, Trash2Icon, AlertTriangleIcon } from 'lucide-vue-next'

const appointments = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const showDeleteModal = ref(false)
const pendingDeleteId = ref(null)

onMounted(() => {
  const apptCol = collection(db, 'appointments')
  onSnapshot(apptCol, (snap) => {
    appointments.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
  })
})

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const updateStatus = async (id, newStatus) => {
  try {
    const updateData = { status: newStatus }
    if (newStatus === 'Approved') {
      updateData.approvedAt = serverTimestamp()
      updateData.declinedAt = null
    } else if (newStatus === 'Declined') {
      updateData.declinedAt = serverTimestamp()
      updateData.approvedAt = null
    }
    await updateDoc(doc(db, 'appointments', id), updateData)
  } catch (err) {
    console.error('Failed to update status:', err.message)
  }
}

const confirmDelete = (id) => {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

const deleteAppointment = async () => {
  try {
    await deleteDoc(doc(db, 'appointments', pendingDeleteId.value))
    showDeleteModal.value = false
  } catch (err) {
    console.error('Failed to delete:', err.message)
  }
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(a => {
    const statusOK = !filterStatus.value || a.status.toLowerCase() === filterStatus.value.toLowerCase()
    const term = searchQuery.value.toLowerCase()
    const emailMatch = a.email.toLowerCase().includes(term)
    const svcMatch = a.services.map(s => s.serviceName.toLowerCase()).join(' ').includes(term)
    return statusOK && (emailMatch || svcMatch)
  })
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
