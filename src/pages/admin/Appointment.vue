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
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30">
              {{ filteredAppointments.length }} Request{{ filteredAppointments.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Review, approve, or cancel upcoming schedules and bookings from clients.</p>
        </div>
        <div class="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] p-2 px-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
          <div class="flex flex-col">
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Value</span>
            <span class="text-base font-black text-teal-600 dark:text-teal-400">₱{{ totalQueueValue }}</span>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:border-gray-800"></div>
          <button @click="fetchData" class="p-2 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg text-gray-400 transition" title="Refresh Data">
            <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- Search & Filters Toolbar Context -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-4 shadow-2xs mb-6">
        <div class="flex flex-col sm:flex-row gap-3 w-full">
          
          <!-- Filter Dropdown -->
          <div class="relative w-full sm:w-48 shrink-0">
            <select
              v-model="filterStatus"
              class="w-full appearance-none pl-3 pr-8 py-2.5 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
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
              placeholder="Search by client name, email, or services..."
              class="w-full pl-10 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
            />
            <SearchIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

        </div>
      </div>

      <!-- Modernized Ledger Table -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-[#1f1f1f]/50 border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium">
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Client Details</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Requested Services</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Total Amount</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Appt Date</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Timeline</th>
                <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
              <tr
                v-for="appt in filteredAppointments"
                :key="appt.id"
                class="hover:bg-gray-50/40 dark:hover:bg-[#222]/10 transition group"
              >
                <!-- Client Details Block -->
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 dark:text-white">{{ getUserName(appt.email) }}</span>
                    <span class="text-[10px] text-gray-400 font-mono">{{ appt.email }}</span>
                  </div>
                </td>
                
                <!-- Services Map Chips -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1.5 max-w-xs">
                    <div 
                      v-for="s in appt.services" 
                      :key="s.serviceName"
                      class="flex flex-col px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-200/40 dark:border-gray-800/40"
                    >
                      <span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">{{ s.serviceName }}</span>
                      <span v-if="s.specialInstructions" class="text-[8px] text-amber-500 font-medium">Note: {{ s.specialInstructions }}</span>
                    </div>
                  </div>
                </td>

                <!-- Total Amount -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-black text-gray-900 dark:text-white">₱{{ calculateTotal(appt.services) }}</span>
                </td>
                
                <!-- Appointment Date -->
                <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <CalendarIcon class="w-3.5 h-3.5 text-gray-400" />
                    {{ appt.date }}
                  </div>
                </td>
                
                <!-- Enhanced Status Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full font-black tracking-wide uppercase border"
                    :class="{
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30': appt.status === 'Pending',
                      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30': appt.status === 'Approved',
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30': appt.status === 'Declined'
                    }"
                  >
                    <div :class="['w-1.5 h-1.5 rounded-full mr-1.5', 
                      appt.status === 'Pending' ? 'bg-amber-400' : 
                      appt.status === 'Approved' ? 'bg-emerald-400' : 'bg-rose-400']"></div>
                    {{ appt.status }}
                  </span>
                </td>
                
                <!-- Unified Timeline Activity -->
                <td class="px-6 py-4 whitespace-nowrap text-gray-400 dark:text-gray-500 font-mono text-[10px]">
                  <div v-if="appt.status === 'Approved' && appt.approvedAt" class="flex items-center gap-1.5 text-emerald-600/80 dark:text-emerald-400/80">
                    <CheckIcon class="w-3 h-3" /> Approved: {{ formatTimeOnly(appt.approvedAt) }}
                  </div>
                  <div v-else-if="appt.status === 'Declined' && appt.declinedAt" class="flex items-center gap-1.5 text-rose-600/80 dark:text-rose-400/80">
                    <XIcon class="w-3 h-3" /> Declined: {{ formatTimeOnly(appt.declinedAt) }}
                  </div>
                  <div v-else class="flex items-center gap-1.5 opacity-60">
                    <ClockIcon class="w-3 h-3" /> Sent: {{ formatTimeOnly(appt.createdAt) }}
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 text-right pr-8 whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <template v-if="appt.status === 'Pending'">
                      <button
                        @click="updateStatus(appt.id, 'Approved')"
                        title="Approve Appointment"
                        class="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition shadow-sm"
                      >
                        <CheckIcon class="w-4 h-4" />
                      </button>
                      <button
                        @click="updateStatus(appt.id, 'Declined')"
                        title="Decline Appointment"
                        class="p-2 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition shadow-sm"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </template>

                    <button
                      @click="confirmDelete(appt.id)"
                      title="Purge Record"
                      class="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Trash2Icon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredAppointments.length === 0">
                <td colspan="7" class="text-center py-20 text-gray-400 bg-gray-50/20 dark:bg-transparent">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <div class="p-4 bg-gray-100 dark:bg-[#1f1f1f] rounded-3xl border border-gray-200/50 dark:border-gray-800/50">
                      <InboxIcon class="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900 dark:text-white">No appointments found</p>
                      <p class="text-xs text-gray-500">There are currently no queued appointments in the system.</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Modal -->
      <transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
          @click="showDeleteModal = false"
        >
          <div 
            class="bg-white dark:bg-[#1a1a1a] w-full max-w-md p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl relative animate-fadeIn"
            @click.stop
          >
            <div class="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div class="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                <AlertTriangleIcon class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-lg font-black tracking-tight">Purge Appointment?</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">This action is permanent.</p>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Are you sure you want to delete this appointment? This operation will permanently remove this booking from the system and cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-6 py-3 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition"
              >
                Abort
              </button>
              <button
                @click="deleteAppointment"
                class="px-6 py-3 rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-600/20"
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
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  Check as CheckIcon, 
  X as XIcon, 
  Trash2 as Trash2Icon, 
  AlertTriangle as AlertTriangleIcon,
  ChevronDown as ChevronDownIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  RefreshCw as RefreshCwIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

const appointments = ref([])
const users = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const showDeleteModal = ref(false)
const pendingDeleteId = ref(null)
const loading = ref(false)
const { success: notifySuccess, error: notifyError } = useNotifications()

const fetchData = async () => {
  loading.value = true
  try {
    const usersSnap = await getDocs(collection(db, 'users'))
    users.value = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    
    const apptCol = collection(db, 'appointments')
    onSnapshot(apptCol, (snap) => {
      appointments.value = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0
          const timeB = b.createdAt?.seconds || 0
          return timeB - timeA
        })
      loading.value = false
    })
  } catch (err) {
    console.error('Fetch error:', err)
    loading.value = false
  }
}

onMounted(fetchData)

const formatTimeOnly = (ts) => {
  if (!ts?.toDate) return '—'
  const d = ts.toDate()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getUserName = (email) => {
  if (!email) return 'Guest'
  const user = users.value.find(u => u.email?.toLowerCase() === email.toLowerCase())
  return user ? (user.username || user.displayName || 'Unnamed User') : email.split('@')[0]
}

const calculateTotal = (services) => {
  if (!services) return 0
  return services.reduce((acc, s) => acc + (s.amount || 0), 0)
}

const totalQueueValue = computed(() => {
  return filteredAppointments.value.reduce((acc, appt) => acc + calculateTotal(appt.services), 0)
})

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
    const emailMatch = a.email?.toLowerCase().includes(term)
    const nameMatch = getUserName(a.email).toLowerCase().includes(term)
    const svcMatch = a.services?.map(s => s.serviceName.toLowerCase()).join(' ').includes(term)
    return statusOK && (emailMatch || nameMatch || svcMatch)
  })
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>