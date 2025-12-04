<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- Sidebar -->
      <aside>
        <AdminSidebar />
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-3 sm:p-5 lg:p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ClipboardListIcon class="w-5 h-5 text-green-600" /> User Invoices
          </h1>
        </div>

        <!-- User Search -->
        <div class="relative max-w-md">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search user..."
            class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
            @input="showDropdown = true"
          />
          <ul
            v-if="userSearchQuery && filteredUsers.length && showDropdown"
            class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-md max-h-52 overflow-y-auto"
          >
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <User2Icon class="w-4 h-4 text-gray-500" />
              <span>{{ user.username }} - {{ user.email }}</span>
            </li>
          </ul>
        </div>

        <!-- Accounts Table -->
        <div
          v-if="!selectedUserEmail && !userSearchQuery && accountsTable.length"
          class="overflow-x-auto bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm"
        >
          <table class="w-full text-sm">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="px-3 py-2 text-left">Username</th>
                <th class="px-3 py-2 text-left">Email</th>
                <th class="px-3 py-2 text-left">Last Payment</th>
                <th class="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in accountsTable" :key="user.id" class="hover:bg-gray-50">
                <td class="px-3 py-2">{{ user.username }}</td>
                <td class="px-3 py-2">{{ user.email }}</td>
                <td class="px-3 py-2">{{ user.lastPayment ? formatDate(user.lastPayment) : '—' }}</td>
                <td class="px-3 py-2 text-center">
                  <button
                    @click="selectUser(user)"
                    class="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex items-center gap-1 justify-center"
                  >
                    <EyeIcon class="w-3 h-3" /> View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Selected User -->
        <div v-if="selectedUserEmail" class="space-y-4 sm:space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 class="text-lg font-semibold flex items-center gap-1">
              <User2Icon class="w-4 h-4 text-green-600" /> {{ selectedUserName }}
            </h2>
            <button
              @click="clearSelectedUser"
              class="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm flex items-center gap-1"
            >
              <ArrowLeftIcon class="w-4 h-4" /> Back
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoices..."
              class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
            <select
              v-model="filterStatus"
              class="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <!-- Invoices Table -->
          <div class="overflow-x-auto bg-white/80 border border-gray-200 rounded-2xl shadow-sm">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="px-2 py-2 text-left">Date</th>
                  <th class="px-2 py-2 text-left">Services</th>
                  <th class="px-2 py-2 text-left">Total</th>
                  <th class="px-2 py-2 text-left">Method</th>
                  <th class="px-2 py-2 text-left">Reference</th>
                  <th class="px-2 py-2 text-left">Receipt</th>
                  <th class="px-2 py-2 text-left">Status</th>
                  <th class="px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="invoice in sortedInvoices" :key="invoice.id" class="hover:bg-gray-50">
                  <td class="px-2 py-1">{{ formatDate(invoice.createdAt) }}</td>
                  <td class="px-2 py-1">{{ invoice.services.map(s => s.serviceName).join(', ') }}</td>
                  <td class="px-2 py-1">₱{{ invoice.totalAmount }}</td>
                  <td class="px-2 py-1">{{ invoice.paymentMethod || 'N/A' }}</td>
                  <td class="px-2 py-1">{{ invoice.referenceNumber || 'N/A' }}</td>
                  <td class="px-2 py-1">
                    <button
                      v-if="invoice.receiptBase64"
                      @click="openReceiptModal(invoice.receiptBase64)"
                      class="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1"
                    >
                      <EyeIcon class="w-3 h-3" /> View
                    </button>
                    <span v-else class="text-gray-400">No receipt</span>
                  </td>
                  <td class="px-2 py-1">{{ invoice.status }}</td>
                  <td class="px-2 py-1 text-center flex flex-wrap justify-center gap-1">
                    <button
                      v-if="invoice.status === 'Pending'"
                      @click="openApproveModal(invoice.id)"
                      class="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1"
                    >
                      <CheckIcon class="w-3 h-3" /> Approve
                    </button>
                    <button
                      @click="deleteInvoice(invoice.id)"
                      class="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1"
                    >
                      <TrashIcon class="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="!sortedInvoices.length">
                  <td colspan="8" class="text-center py-6 text-gray-500 text-sm">No invoices found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Approve Modal -->
        <transition name="fade">
          <div v-if="showApproveModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-md shadow-xl space-y-3">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <CheckIcon class="w-5 h-5 text-green-600" /> Approve Payment
              </h3>

              <input
                type="number"
                v-model.number="approveAmount"
                placeholder="Total amount"
                class="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <select v-model="approveIdType" class="w-full border rounded-xl px-3 py-2 text-sm">
                <option value="">None</option>
                <option value="Senior">Senior Citizen</option>
                <option value="PWD">PWD</option>
              </select>

              <div class="flex justify-between font-medium">
                <span>Discounted Total:</span>
                <span>₱{{ discountedAmount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-end gap-2">
                <button @click="showApproveModal = false" class="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
                <button @click="approveInvoice" class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1">
                  <CheckIcon class="w-4 h-4" /> Confirm
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Receipt Modal -->
        <transition name="fade">
          <div v-if="showReceiptModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div class="bg-white p-4 sm:p-5 rounded-2xl max-w-2xl relative">
              <button @click="closeReceiptModal" class="absolute top-2 right-2 bg-gray-200 px-3 py-1 rounded">✕</button>
              <img :src="currentReceiptUrl" class="max-h-[70vh] mx-auto rounded" />
            </div>
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/admintopbar.vue'
import { User2Icon, ClipboardListIcon, EyeIcon, CheckIcon, TrashIcon, ArrowLeftIcon } from 'lucide-vue-next'

/* STATE */
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
const currentReceiptUrl = ref('')
const userLastPayments = ref({})

/* COMPUTED */
const discountedAmount = computed(() => approveIdType.value ? approveAmount.value * 0.8 : approveAmount.value)
const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase().trim()
  if (!q) return []
  return users.value.filter(u => u.role !== 'admin' &&
    (u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)))
})
const accountsTable = computed(() =>
  users.value.filter(u => u.role !== 'admin')
    .map(u => ({ ...u, lastPayment: userLastPayments.value[u.email] || null }))
)
const filteredInvoices = computed(() =>
  invoices.value.filter(inv => {
    const statusOk = !filterStatus.value || inv.status === filterStatus.value
    const textOk = !searchQuery.value || JSON.stringify(inv).toLowerCase().includes(searchQuery.value.toLowerCase())
    return statusOk && textOk
  })
)
const statusPriority = { Pending: 1, 'Not Paid': 2, Paid: 3 }
const sortedInvoices = computed(() =>
  [...filteredInvoices.value].sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99))
)
const formatDate = ts => ts?.toDate ? ts.toDate().toISOString().split('T')[0] : 'N/A'

/* FETCH USERS */
const fetchUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
/* FETCH LAST PAYMENTS */
const fetchLastPayments = async () => {
  const snap = await getDocs(collection(db, 'invoices'))
  const latest = {}
  snap.docs.forEach(d => {
    const data = d.data()
    if (data.email && data.createdAt?.toDate) {
      const dt = data.createdAt.toDate()
      if (!latest[data.email] || latest[data.email] < dt) latest[data.email] = dt
    }
  })
  userLastPayments.value = latest
}

/* SELECT USER */
const selectUser = async user => {
  selectedUserName.value = user.username
  selectedUserEmail.value = user.email
  userSearchQuery.value = `${user.username} - ${user.email}`
  showDropdown.value = false
  const snap = await getDocs(query(collection(db, 'invoices'), where('email', '==', user.email)))
  invoices.value = snap.docs.map(d => ({ id: d.id, ...d.data(), receiptBase64: d.data().receiptBase64 || null }))
}
const clearSelectedUser = () => {
  selectedUserName.value = ''
  selectedUserEmail.value = ''
  userSearchQuery.value = ''
  searchQuery.value = ''
  filterStatus.value = ''
  invoices.value = []
}

/* APPROVE */
const openApproveModal = id => {
  invoiceToApproveId.value = id
  approveAmount.value = 0
  approveIdType.value = ''
  showApproveModal.value = true
}
const approveInvoice = async () => {
  const invoiceId = invoiceToApproveId.value
  const ref = doc(db, 'invoices', invoiceId)
  const approvedAt = Timestamp.now()
  const invoice = invoices.value.find(i => i.id === invoiceId)
  await updateDoc(ref, {
    status: 'Paid',
    totalAmount: discountedAmount.value,
    idType: approveIdType.value,
    approvedAt
  })
  await addDoc(collection(db, 'notifications'), {
    userEmail: invoice.email,
    type: 'invoice-approved',
    message: `Your payment for ${invoice.services.map(s => s.serviceName).join(', ')} has been approved.`,
    timestamp: approvedAt,
    read: false
  })
  invoice.status = 'Paid'
  invoice.totalAmount = discountedAmount.value
  invoice.idType = approveIdType.value
  invoice.approvedAt = approvedAt
  showApproveModal.value = false
}

/* RECEIPT MODAL */
const openReceiptModal = url => {
  currentReceiptUrl.value = url
  showReceiptModal.value = true
}
const closeReceiptModal = () => {
  showReceiptModal.value = false
  currentReceiptUrl.value = ''
}

/* DELETE */
const deleteInvoice = async id => {
  await deleteDoc(doc(db, 'invoices', id))
  invoices.value = invoices.value.filter(inv => inv.id !== id)
}

/* ON MOUNT */
onMounted(async () => {
  await fetchUsers()
  await fetchLastPayments()
})
</script>
