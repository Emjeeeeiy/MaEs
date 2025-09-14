<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm"
      >
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main
        class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar"
      >
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <select
            v-model="filterStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white shadow-sm"
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
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none w-full sm:w-64 shadow-sm"
          />
        </div>

        <!-- Appointments Table -->
        <div class="overflow-x-auto bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead class="bg-gray-100/70 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 font-medium">Email</th>
                <th class="px-4 py-3 font-medium">Services</th>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Notes</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Approved Date</th>
                <th class="px-4 py-3 font-medium">Declined Date</th>
                <th class="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td class="px-4 py-3">{{ appt.email }}</td>
                <td class="px-4 py-3">{{ appt.services.map((s) => s.serviceName).join(', ') }}</td>
                <td class="px-4 py-3">{{ appt.date }}</td>
                <td class="px-4 py-3">{{ appt.notes }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs rounded-lg font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-700': appt.status === 'Pending',
                      'bg-green-100 text-green-700': appt.status === 'Approved',
                      'bg-red-100 text-red-700': appt.status === 'Declined'
                    }"
                  >
                    {{ appt.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="appt.approvedAt">{{ formatTimestamp(appt.approvedAt) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="appt.declinedAt">{{ formatTimestamp(appt.declinedAt) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-center space-x-2">
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Approved')"
                    class="px-3 py-1 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition"
                  >
                    Approve
                  </button>
                  <button
                    v-if="appt.status === 'Pending'"
                    @click="updateStatus(appt.id, 'Declined')"
                    class="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
                  >
                    Decline
                  </button>
                  <button
                    @click="confirmDelete(appt.id)"
                    class="px-3 py-1 text-xs rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredAppointments.length === 0">
                <td colspan="8" class="px-4 py-6 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- ✅ Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white/95 w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
          <p class="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm transition"
            >
              Cancel
            </button>
            <button
              @click="deleteAppointment"
              class="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
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
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'

const appointments = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const showDeleteModal = ref(false)
const pendingDeleteId = ref(null)

onMounted(() => {
  const apptCol = collection(db, 'appointments')
  onSnapshot(apptCol, (snap) => {
    appointments.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
  })
})

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return (
    d.toLocaleDateString() +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
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
  return appointments.value.filter((a) => {
    const statusOK =
      !filterStatus.value ||
      a.status.toLowerCase() === filterStatus.value.toLowerCase()
    const term = searchQuery.value.toLowerCase()
    const emailMatch = a.email.toLowerCase().includes(term)
    const svcMatch = a.services
      .map((s) => s.serviceName.toLowerCase())
      .join(' ')
      .includes(term)
    return statusOK && (emailMatch || svcMatch)
  })
})
</script>
