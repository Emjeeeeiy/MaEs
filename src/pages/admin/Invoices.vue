<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardListIcon class="w-5 h-5 text-gray-400" /> 
            <span>User Invoices</span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Suriin, aprubahan, at pamahalaan ang mga invoice at resibo ng bawat kliyente.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <template v-if="!selectedUserEmail && !userSearchQuery">
          <section class="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-xs overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
              <h2 class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Client Directory</h2>
              <span class="text-[11px] bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded-md text-gray-500">{{ accountsTable.length }} total</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium text-left">
                    <th class="px-5 py-3 font-medium">Username</th>
                    <th class="px-5 py-3 font-medium">Email Address</th>
                    <th class="px-5 py-3 font-medium">Last Payment</th>
                    <th class="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                  <tr v-for="user in accountsTable" :key="user.id" class="hover:bg-gray-50/50 dark:hover:bg-[#222]/30 transition">
                    <td class="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{{ user.username }}</td>
                    <td class="px-5 py-3.5 text-gray-500 dark:text-gray-400">{{ user.email }}</td>
                    <td class="px-5 py-3.5 text-gray-400 dark:text-gray-500">{{ user.lastPayment ? formatDate(user.lastPayment) : '—' }}</td>
                    <td class="px-5 py-3.5 text-right">
                      <button
                        @click="selectUser(user)"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] hover:text-gray-900 dark:hover:text-white transition font-medium"
                      >
                        <EyeIcon class="w-3 h-3" /> 
                        <span>View Records</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-xs relative">
            <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <SearchIcon class="w-4 h-4 text-gray-400" />
              Quick Search
            </h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">Maghanap ng mabilis sa pamamagitan ng pag-type ng username o email ng kliyente sa ibaba.</p>
            
            <div class="relative">
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="Type user identifier..."
                class="w-full pl-3 pr-8 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                @input="showDropdown = true"
              />
              <SearchIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              
              <ul
                v-if="userSearchQuery && filteredUsers.length && showDropdown"
                class="absolute z-20 w-full mt-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50"
              >
                <li
                  v-for="user in filteredUsers"
                  :key="user.id"
                  @click="selectUser(user)"
                  class="px-3 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-[#222]/50 cursor-pointer flex items-center gap-2.5 transition text-gray-700 dark:text-gray-300"
                >
                  <User2Icon class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div class="truncate">
                    <span class="font-medium text-gray-900 dark:text-white block">{{ user.username }}</span>
                    <span class="text-[10px] text-gray-400 block">{{ user.email }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </template>


        <template v-else>
          <section class="lg:col-span-3 space-y-5">
            
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-4 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 text-gray-500">
                  <User2Icon class="w-4 h-4" />
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 uppercase font-medium tracking-wider block">Selected Profile</span>
                  <h2 class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedUserName || 'Filtered Search Results' }}</h2>
                </div>
              </div>
              <button
                @click="clearSelectedUser"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] transition"
              >
                <ArrowLeftIcon class="w-3.5 h-3.5" /> 
                <span>Back to Directory</span>
              </button>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Filter invoices by data or services..."
                  class="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition shadow-xs"
                />
                <SearchIcon class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div class="relative w-full sm:w-48">
                <select
                  v-model="filterStatus"
                  class="w-full appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition shadow-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Not Paid">Not Paid</option>
                  <option value="Flagged">Flagged</option>
                </select>
                <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium text-left">
                      <th class="px-4 py-3 font-medium">Date Issued</th>
                      <th class="px-4 py-3 font-medium">Availed Services</th>
                      <th class="px-4 py-3 font-medium">Total Gross</th>
                      <th class="px-4 py-3 font-medium">Method</th>
                      <th class="px-4 py-3 font-medium">Reference ID</th>
                      <th class="px-4 py-3 font-medium">Attachment</th>
                      <th class="px-4 py-3 font-medium">Status Ledger</th>
                      <th class="px-4 py-3 text-center font-medium">Controls</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                    <tr v-for="invoice in sortedInvoices" :key="invoice.id" class="hover:bg-gray-50/50 dark:hover:bg-[#222]/30 transition">
                      <td class="px-4 py-3.5 whitespace-nowrap text-gray-400 dark:text-gray-500">{{ formatDate(invoice.createdAt) }}</td>
                      <td class="px-4 py-3.5 max-w-xs truncate font-medium text-gray-900 dark:text-white" :title="invoice.services.map(s => s.serviceName).join(', ')">
                        {{ invoice.services.map(s => s.serviceName).join(', ') }}
                      </td>
                      <td class="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">₱{{ invoice.totalAmount }}</td>
                      <td class="px-4 py-3.5 whitespace-nowrap"><span class="text-gray-500 dark:text-gray-400">{{ invoice.paymentMethod || 'N/A' }}</span></td>
                      <td class="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-gray-400">{{ invoice.referenceNumber || 'N/A' }}</td>
                      
                      <td class="px-4 py-3.5 whitespace-nowrap">
                        <button
                          v-if="invoice.receiptBase64"
                          @click="openReceiptModal(invoice.receiptBase64)"
                          class="inline-flex items-center gap-1 px-2 py-0.5 border border-blue-100 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 transition text-[11px]"
                        >
                          <FileTextIcon class="w-3 h-3" /> 
                          <span>View Doc</span>
                        </button>
                        <span v-else class="text-gray-400/70 italic text-[11px]">None</span>
                      </td>
                      
                      <td class="px-4 py-3.5 whitespace-nowrap">
                        <span
                          v-if="invoice.status?.toLowerCase() === 'flagged'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/10 dark:text-red-400 dark:border-red-900/20 rounded-md font-medium text-[11px]"
                        >
                          <AlertTriangleIcon class="w-2.5 h-2.5" /> Flagged
                        </span>
                        <span 
                          v-else
                          :class="{
                            'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/20': invoice.status?.toLowerCase() === 'paid',
                            'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/10 dark:text-amber-400 dark:border-amber-900/20': invoice.status?.toLowerCase() === 'pending',
                            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700': invoice.status?.toLowerCase() === 'not paid'
                          }"
                          class="inline-flex items-center px-2 py-0.5 border rounded-md font-medium text-[11px]"
                        >
                          {{ invoice.status }}
                        </span>
                      </td>
                      
                      <td class="px-4 py-3.5 text-center whitespace-nowrap">
                        <div class="flex items-center justify-center gap-1">
                          <button
                            v-if="invoice.status?.toLowerCase() === 'pending'"
                            @click="handleApprove(invoice)"
                            class="inline-flex items-center gap-1 px-2.5 py-1 border border-emerald-100 dark:border-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition"
                          >
                            <CheckIcon class="w-3 h-3" /> Approve
                          </button>
                          <button
                            @click="deleteInvoice(invoice.id)"
                            class="inline-flex items-center gap-1 px-2 py-1 border border-transparent rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                          >
                            <Trash2Icon class="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    <tr v-if="!sortedInvoices.length">
                      <td colspan="8" class="text-center py-12 text-gray-400 bg-gray-50/20 dark:bg-transparent">
                        <div class="flex flex-col items-center justify-center gap-2">
                          <InboxIcon class="w-5 h-5 text-gray-300" />
                          <span>No transaction history found matching the filters.</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </template>

      </div>

      <transition name="fade">
        <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-xs" @click="showApproveModal = false"></div>
          
          <div class="bg-white dark:bg-[#1a1a1a] w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 space-y-4">
            <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <CheckIcon class="w-4 h-4 text-emerald-500" />
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Approve Invoice Payment</h3>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Total Verified Amount</label>
                <input
                  type="number"
                  v-model.number="approveAmount"
                  placeholder="0.00"
                  class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>

              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Subsidy / Discount Tier</label>
                <div class="relative">
                  <select 
                    v-model="approveIdType" 
                    class="w-full appearance-none px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                  >
                    <option value="">No Discount Applied</option>
                    <option value="Senior">Senior Citizen (SC)</option>
                    <option value="PWD">Persons With Disability (PWD)</option>
                  </select>
                  <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center px-3 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-400">
              <span>Adjusted Net Total:</span>
              <span class="text-sm font-bold">₱{{ discountedAmount.toFixed(2) }}</span>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button 
                @click="showApproveModal = false" 
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition"
              >
                Cancel
              </button>
              <button
                @click="approveInvoice"
                class="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-xs font-medium transition flex items-center gap-1"
              >
                <CheckIcon class="w-3.5 h-3.5" /> Confirm Approval
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="showReceiptModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs" @click="closeReceiptModal"></div>
          
          <div class="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl relative z-10 w-full max-w-2xl">
            <button 
              @click="closeReceiptModal" 
              class="absolute top-4 right-4 p-1 rounded-md bg-white/80 dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 shadow-xs transition"
            >
              <XIcon class="w-4 h-4" />
            </button>
            <div class="bg-gray-50 dark:bg-[#121212] rounded-lg overflow-hidden flex items-center justify-center">
              <img :src="`data:image/jpeg;base64,${currentReceiptBase64}`" class="max-h-[75vh] object-contain w-full" />
            </div>
          </div>
        </div>
      </transition>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  User2 as User2Icon, 
  ClipboardList as ClipboardListIcon, 
  Eye as EyeIcon, 
  Check as CheckIcon, 
  Trash as TrashIcon, 
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  FileText as FileTextIcon,
  AlertTriangle as AlertTriangleIcon,
  Inbox as InboxIcon,
  X as XIcon
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

const users = ref([])
const invoices = ref([])
const selectedUserName = ref('')
const selectedUserEmail = ref('')
const userSearchQuery = ref('')
const filterStatus = ref('')
const searchQuery = ref('')
const showDropdown = ref(false)
const showApproveModal = ref(false)
const invoiceToApproveId = ref(null)
const approveAmount = ref(0)
const approveIdType = ref('')
const showReceiptModal = ref(false)
const currentReceiptBase64 = ref('')
const userLastPayments = ref({})
const { success: notifySuccess, error: notifyError } = useNotifications()

const discountedAmount = computed(() =>
  approveIdType.value ? approveAmount.value * 0.8 : approveAmount.value
)

// ================= USERS =================
const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase().trim()
  if (!q) return []
  return users.value.filter(u =>
    u.role !== 'admin' &&
    (u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q))
  )
})

const accountsTable = computed(() =>
  users.value
    .filter(u => u.role !== 'admin')
    .map(u => ({ ...u, lastPayment: userLastPayments.value[u.email] || null }))
)

// ================= INVOICES =================
const filteredInvoices = computed(() =>
  invoices.value.filter(inv => {
    const statusOk =
      !filterStatus.value ||
      inv.status?.toLowerCase() === filterStatus.value.toLowerCase()
    const textOk =
      !searchQuery.value ||
      JSON.stringify(inv)
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
    return statusOk && textOk
  })
)

const statusPriority = { pending: 1, 'not paid': 2, paid: 3, flagged: 0 }
const sortedInvoices = computed(() =>
  [...filteredInvoices.value].sort(
    (a, b) =>
      (statusPriority[a.status?.toLowerCase()] || 99) -
      (statusPriority[b.status?.toLowerCase()] || 99)
  )
)

const formatDate = ts =>
  ts?.toDate ? ts.toDate().toISOString().split('T')[0] : 'N/A'

// ================= FIREBASE FETCH =================
const fetchUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const fetchLastPayments = async () => {
  const snap = await getDocs(collection(db, 'invoices'))
  const latest = {}
  snap.docs.forEach(d => {
    const data = d.data()
    if (data.email && data.createdAt?.toDate) {
      const dt = data.createdAt.toDate()
      if (!latest[data.email] || latest[data.email] < dt)
        latest[data.email] = dt
    }
  })
  userLastPayments.value = latest
}

const selectUser = async user => {
  selectedUserName.value = user.username
  selectedUserEmail.value = user.email
  userSearchQuery.value = `${user.username} - ${user.email}`
  showDropdown.value = false

  const snap = await getDocs(
    query(collection(db, 'invoices'), where('email', '==', user.email))
  )

  invoices.value = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    receiptBase64: d.data().receiptBase64 || null,
    status: d.data().status || 'Pending'
  }))
}

const clearSelectedUser = () => {
  selectedUserName.value = ''
  selectedUserEmail.value = ''
  userSearchQuery.value = ''
  searchQuery.value = ''
  filterStatus.value = ''
  invoices.value = []
}

// ================= APPROVE LOGIC =================

// ✅ MAIN APPROVE HANDLER
const handleApprove = async invoice => {
  const method = invoice.paymentMethod?.toLowerCase()

  if (method === 'gcash') {
    // 👉 DIRECT APPROVE (NO MODAL)
    await approveDirect(invoice)
  } else {
    // 👉 CASH → OPEN MODAL
    openApproveModal(invoice.id, invoice.totalAmount)
  }
}

// ✅ OPEN MODAL FOR CASH
const openApproveModal = (id, total) => {
  invoiceToApproveId.value = id
  approveAmount.value = total
  approveIdType.value = ''
  showApproveModal.value = true
}

// ✅ DIRECT APPROVE FOR GCASH
const approveDirect = async invoice => {
  try {
    const refDoc = doc(db, 'invoices', invoice.id)
    const approvedAt = Timestamp.now()

    await updateDoc(refDoc, {
      status: 'Paid',
      approvedAt
    })

    await addDoc(collection(db, 'notifications'), {
      userEmail: invoice.email,
      type: 'invoice-approved',
      message: `Your payment for ${invoice.services
        .map(s => s.serviceName)
        .join(', ')} has been approved.`,
      createdAt: approvedAt,
      read: false
    })

    notifySuccess('Invoice approved successfully!')
    invoice.status = 'Paid'
    invoice.approvedAt = approvedAt
  } catch (error) {
    notifyError('Error approving invoice: ' + error.message)
  }
}

// ✅ APPROVE FROM MODAL (CASH)
const approveInvoice = async () => {
  try {
    const invoiceId = invoiceToApproveId.value
    const refDoc = doc(db, 'invoices', invoiceId)
    const approvedAt = Timestamp.now()
    const invoice = invoices.value.find(i => i.id === invoiceId)

    await updateDoc(refDoc, {
      status: 'Paid',
      totalAmount: discountedAmount.value,
      idType: approveIdType.value,
      approvedAt
    })

    await addDoc(collection(db, 'notifications'), {
      userEmail: invoice.email,
      type: 'invoice-approved',
      message: `Your payment for ${invoice.services
        .map(s => s.serviceName)
        .join(', ')} has been approved.`,
      createdAt: approvedAt,
      read: false
    })

    notifySuccess('Invoice approved and updated!')
    invoice.status = 'Paid'
    invoice.totalAmount = discountedAmount.value
    invoice.idType = approveIdType.value
    invoice.approvedAt = approvedAt

    showApproveModal.value = false
  } catch (error) {
    notifyError('Error approving invoice: ' + error.message)
  }
}

// ================= RECEIPT =================
const openReceiptModal = base64 => {
  currentReceiptBase64.value = base64
  showReceiptModal.value = true
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  currentReceiptBase64.value = ''
}

// ================= DELETE =================
const deleteInvoice = async id => {
  if (!confirm('Are you sure you want to delete this invoice?')) return
  try {
    await deleteDoc(doc(db, 'invoices', id))
    notifySuccess('Invoice deleted successfully!')
    invoices.value = invoices.value.filter(inv => inv.id !== id)
  } catch (error) {
    notifyError('Error deleting invoice: ' + error.message)
  }
}

// ================= INIT =================
onMounted(async () => {
  await fetchUsers()
  await fetchLastPayments()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
