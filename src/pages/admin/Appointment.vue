<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Section Header with Meta Counters -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Appointments Queue
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 border border-gray-200/40 dark:border-gray-800/40">
              {{ filteredAppointments.length }} Request{{ filteredAppointments.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Suriin, aprubahan, o kanselahin ang mga parating na schedule at bookings mula sa mga kliyente.</p>
        </div>
      </header>

      <!-- Search & Filters Toolbar Context -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-4 shadow-2xs mb-6">
        <div class="flex flex-col sm:flex-row gap-3 w-full">
          
          <!-- Filter Dropdown -->
          <div class="relative w-full sm:w-48 shrink-0">
            <select
              v-model="filterStatus"
              class="w-full appearance-none pl-3 pr-8 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Queue</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <!-- Dynamic Text Search -->
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter by email or requested services..."
              class="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
            />
            <SearchIcon class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

        </div>
      </div>

      <!-- Modernized Ledger Ledger Table -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium">
                <th class="px-4 py-3.5 font-medium">Client Info</th>
                <th class="px-4 py-3.5 font-medium">Requested Services</th>
                <th class="px-4 py-3.5 font-medium">Appt Date</th>
                <th class="px-4 py-3.5 font-medium">Status</th>
                <th class="px-4 py-3.5 font-medium">Timeline Activity</th>
                <th class="px-4 py-3.5 font-medium">Internal Notes / Memo</th>
                <th class="px-4 py-3.5 font-medium text-right pr-6">Management Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="hover:bg-gray-50/40 dark:hover:bg-[#222]/10 transition"
              >
                <!-- Email/User Block -->
                <td class="px-4 py-4 font-medium text-gray-900 dark:text-white">{{ appt.email }}</td>
                
                <!-- Services Map Chips -->
                <td class="px-4 py-4">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span 
                      v-for="s in appt.services" 
                      :key="s.serviceName"
                      class="inline-block px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#222] border border-gray-200/40 dark:border-gray-800/40 text-[11px] text-gray-600 dark:text-gray-400"
                    >
                      {{ s.serviceName }}
                    </span>
                  </div>
                </td>
                
                <!-- Appointment Date -->
                <td class="px-4 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                  {{ appt.date }}
                </td>
                
                <!-- Enhanced Clean Badge Status -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-[10px] rounded-md font-semibold tracking-wide uppercase"
                    :class="{
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30': appt.status === 'Pending',
                      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30': appt.status === 'Approved',
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30': appt.status === 'Declined'
                    }"
                  >
                    {{ appt.status }}
                  </span>
                </td>
                
                <!-- Unified Log Activity Column -->
                <td class="px-4 py-4 whitespace-nowrap text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                  <div v-if="appt.status === 'Approved' && appt.approvedAt" class="flex items-center gap-1 text-emerald-600/80 dark:text-emerald-400/80">
                    <CheckIcon class="w-3 h-3" /> Approved: {{ formatTimestamp(appt.approvedAt) }}
                  </div>
                  <div v-else-if="appt.status === 'Declined' && appt.declinedAt" class="flex items-center gap-1 text-rose-600/80 dark:text-rose-400/80">
                    <XIcon class="w-3 h-3" /> Declined: {{ formatTimestamp(appt.declinedAt) }}
                  </div>
                  <span v-else class="text-gray-300 dark:text-gray-600">Waiting for review...</span>
                </td>

                <!-- Notes Payload Memo -->
                <td class="px-4 py-4 text-gray-400 dark:text-gray-500 max-w-xs truncate" :title="appt.notes">
                  {{ appt.notes || '—' }}
                </td>
                
                <!-- Inline Minimalist Actions Grid -->
                <td class="px-4 py-4 text-right pr-6 whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-1.5">
                    
                    <template v-if="appt.status === 'Pending'">
                      <button
                        @click="updateStatus(appt.id, 'Approved')"
                        title="Approve Appointment"
                        class="p-1.5 rounded-md border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition"
                      >
                        <CheckIcon class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click="updateStatus(appt.id, 'Declined')"
                        title="Decline Appointment"
                        class="p-1.5 rounded-md border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition"
                      >
                        <XIcon class="w-3.5 h-3.5" />
                      </button>
                    </template>

                    <button
                      @click="confirmDelete(appt.id)"
                      title="Purge Record"
                      class="p-1.5 rounded-md border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Trash2Icon class="w-3.5 h-3.5" />
                    </button>

                  </div>
                </td>
              </tr>

              <!-- Nested Table Empty State Wrapper -->
              <tr v-if="filteredAppointments.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-400 bg-gray-50/20 dark:bg-transparent">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <InboxIcon class="w-5 h-5 text-gray-300" />
                    <span>No client appointments logged inside this matrix.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= CONFIRM ELIMINATION MODAL COMPONENT ================= -->
      <transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
          @click="showDeleteModal = false"
        >
          <div 
            class="bg-white dark:bg-[#1a1a1a] w-full max-w-sm p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative animate-fadeIn"
            @click.stop
          >
            <div class="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
              <AlertTriangleIcon class="w-4 h-4" />
              <h3 class="text-sm font-semibold">Confirm Appointment Purge</h3>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              Sigurado ka bang nais mong burahin ang appointment na ito? Ang operasyong ito ay permanenteng aalisin ang booking na ito sa system at hindi na maaaring ibalik.
            </p>
            
            <div class="flex justify-end gap-2">
              <button
                @click="showDeleteModal = false"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition"
              >
                Abort
              </button>
              <button
                @click="deleteAppointment"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                Yes, Discard Schedule
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  Check as CheckIcon, 
  X as XIcon, 
  Trash2 as Trash2Icon, 
  AlertTriangle as AlertTriangleIcon,
  ChevronDown as ChevronDownIcon,
  Search as SearchIcon,
  Inbox as InboxIcon
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

const appointments = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const showDeleteModal = ref(false)
const pendingDeleteId = ref(null)
const { success: notifySuccess, error: notifyError } = useNotifications()

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
    const appt = appointments.value.find(a => a.id === id)
    if (!appt) return

    if (newStatus === 'Approved') {
      updateData.approvedAt = serverTimestamp()
      updateData.declinedAt = null
    } else if (newStatus === 'Declined') {
      updateData.declinedAt = serverTimestamp()
      updateData.approvedAt = null
    }
    await updateDoc(doc(db, 'appointments', id), updateData)

    // Send Notification
    await addDoc(collection(db, 'notifications'), {
      userEmail: appt.email,
      type: `appointment-${newStatus.toLowerCase()}`,
      message: `Your appointment on ${appt.date} has been ${newStatus.toLowerCase()}.`,
      createdAt: serverTimestamp(),
      read: false
    })

    notifySuccess(`Appointment ${newStatus.toLowerCase()} successfully!`)
  } catch (err) {
    console.error('Failed to update status:', err.message)
    notifyError('Failed to update appointment status.')
  }
}

const confirmDelete = (id) => {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

const deleteAppointment = async () => {
  try {
    await deleteDoc(doc(db, 'appointments', pendingDeleteId.value))
    notifySuccess('Appointment deleted successfully!')
    showDeleteModal.value = false
  } catch (err) {
    console.error('Failed to delete:', err.message)
    notifyError('Failed to delete appointment.')
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
