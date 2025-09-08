<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
    <!-- ✅ Sidebar -->
    <aside
      class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-screen pt-16 overflow-y-auto shadow-sm custom-scrollbar"
    >
      <AdminSidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- ✅ Fixed Topbar -->
      <div
        class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-6"
      >
        <AdminTopbar />
      </div>

      <!-- Scrollable Content -->
      <main class="flex-1 pt-16 p-6 overflow-y-auto custom-scrollbar md:ml-64">
        <h1 class="text-2xl font-bold mb-4">User Invoices</h1>

        <!-- Search User -->
        <div class="relative w-full max-w-md mb-4">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search user..."
            @input="showDropdown = true"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ul
            v-if="filteredUsers.length && showDropdown"
            class="absolute w-full bg-white border border-gray-300 rounded mt-1 z-20 max-h-60 overflow-y-auto custom-scrollbar"
          >
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ user.username }} - {{ user.email }}
            </li>
          </ul>
        </div>

        <!-- Accounts Table -->
        <div
          v-if="!selectedUserEmail && !userSearchQuery && accountsTable.length"
          class="overflow-x-auto bg-white rounded shadow-sm border border-gray-300"
        >
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-200 text-gray-800 text-xs font-bold uppercase">
              <tr>
                <th class="px-4 py-2 border-b border-gray-300">Username</th>
                <th class="px-4 py-2 border-b border-gray-300">Email</th>
                <th class="px-4 py-2 border-b border-gray-300">Last Payment</th>
                <th class="px-4 py-2 border-b border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in accountsTable" :key="user.id" class="hover:bg-gray-50">
                <td class="px-4 py-2">{{ user.username }}</td>
                <td class="px-4 py-2">{{ user.email }}</td>
                <td class="px-4 py-2">{{ user.lastPayment ? formatDate(user.lastPayment) : '—' }}</td>
                <td class="px-4 py-2">
                  <button
                    @click="selectUser(user)"
                    class="px-2 py-1 border border-gray-400 text-xs rounded hover:bg-gray-100 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Selected User Invoices -->
        <div v-if="selectedUserEmail">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Invoices for {{ selectedUserName }}</h2>
            <button
              @click="clearSelectedUser"
              class="px-2 py-1 border border-gray-400 rounded text-sm hover:bg-gray-100"
            >
              Back to User List
            </button>
          </div>

          <!-- Filters -->
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoices..."
              class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              v-model="filterStatus"
              class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <!-- Invoices Table -->
          <div class="overflow-x-auto bg-white rounded shadow-sm border border-gray-300">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-gray-200 text-gray-800 text-xs font-bold uppercase">
                <tr>
                  <th class="px-4 py-2 border-b border-gray-300">Date</th>
                  <th class="px-4 py-2 border-b border-gray-300">Services</th>
                  <th class="px-4 py-2 border-b border-gray-300">Total</th>
                  <th class="px-4 py-2 border-b border-gray-300">Method</th>
                  <th class="px-4 py-2 border-b border-gray-300">Reference No.</th>
                  <th class="px-4 py-2 border-b border-gray-300">Receipt</th>
                  <th class="px-4 py-2 border-b border-gray-300">Status</th>
                  <th class="px-4 py-2 border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in sortedInvoices" :key="invoice.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2">{{ formatDate(invoice.createdAt) }}</td>
                  <td class="px-4 py-2">{{ invoice.services.map(s => s.serviceName).join(', ') }}</td>
                  <td class="px-4 py-2">₱{{ invoice.totalAmount || 0 }}</td>
                  <td class="px-4 py-2">{{ invoice.paymentMethod || 'N/A' }}</td>
                  <td class="px-4 py-2">{{ invoice.referenceNumber || 'N/A' }}</td>
                  <td class="px-4 py-2">
                    <a
                      v-if="invoice.receiptImage"
                      :href="invoice.receiptImage"
                      target="_blank"
                      class="text-blue-600 underline"
                    >View</a>
                    <span v-else>No image</span>
                  </td>
                  <td class="px-4 py-2">{{ invoice.status }}</td>
                  <td class="px-4 py-2 flex gap-2 flex-wrap">
                    <button
                      v-if="invoice.status === 'Pending'"
                      @click="openApproveModal(invoice.id)"
                      class="px-2 py-1 border border-green-500 text-green-600 rounded text-xs hover:bg-green-50 transition"
                    >Approve</button>
                    <button
                      @click="deleteInvoice(invoice.id)"
                      class="px-2 py-1 border border-red-500 text-red-600 rounded text-xs hover:bg-red-50 transition"
                    >Delete</button>
                  </td>
                </tr>
                <tr v-if="sortedInvoices.length === 0">
                  <td colspan="8" class="text-center px-4 py-4 text-gray-500">No invoices found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Approve Modal -->
        <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h3 class="text-lg font-semibold">Approve Payment</h3>
            <p class="text-sm text-gray-600">Set total amount and ID type to finalize the payment.</p>

            <input
              type="number"
              v-model.number="approveAmount"
              placeholder="Enter total amount"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              v-model="approveIdType"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              <option value="Senior">Senior Citizen</option>
              <option value="PWD">Person with Disability</option>
            </select>

            <div class="flex justify-between items-center">
              <span class="font-semibold">Discounted Total:</span>
              <span class="text-green-600 font-bold">₱{{ discountedAmount.toFixed(2) }}</span>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button
                @click="showApproveModal = false"
                class="px-4 py-2 border rounded hover:bg-gray-100"
              >Cancel</button>
              <button
                @click="approveInvoice"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >Confirm</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc, Timestamp, addDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { db } from '@/firebase'

import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'

/* --- State and Functions same as your original code --- */
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
const userLastPayments = ref({})

const discountedAmount = computed(() => {
  const amount = approveAmount.value || 0
  return approveIdType.value === 'Senior' || approveIdType.value === 'PWD' ? amount * 0.8 : amount
})

const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase()
  return users.value.filter(
    u => u.role !== 'admin' &&
    (u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  )
})

const accountsTable = computed(() =>
  [...users.value].filter(u => u.role !== 'admin').map(u => ({ ...u, lastPayment: userLastPayments.value[u.email] || null }))
)

const filteredInvoices = computed(() =>
  invoices.value.filter(inv => {
    const statusOk = !filterStatus.value || inv.status?.toLowerCase() === filterStatus.value.toLowerCase()
    const textOk = !searchQuery.value || JSON.stringify(inv).toLowerCase().includes(searchQuery.value.toLowerCase())
    return statusOk && textOk
  })
)

const statusPriority = { Pending: 1, 'Not Paid': 2, Paid: 3 }
const sortedInvoices = computed(() =>
  [...filteredInvoices.value].sort((a, b) => (statusPriority[a.status] || 4) - (statusPriority[b.status] || 4))
)

const formatDate = ts => ts?.toDate ? ts.toDate().toISOString().split('T')[0] : 'N/A'

const fetchUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const fetchLastPayments = async () => {
  const snap = await getDocs(collection(db, 'invoices'))
  const latest = {}
  snap.docs.forEach(d => {
    const data = d.data()
    if (!data.email || !data.createdAt?.toDate) return
    const date = data.createdAt.toDate()
    if (!latest[data.email] || latest[data.email] < date) latest[data.email] = date
  })
  userLastPayments.value = latest
}

const selectUser = async user => {
  selectedUserName.value = user.username
  selectedUserEmail.value = user.email
  userSearchQuery.value = `${user.username} - ${user.email}`
  showDropdown.value = false
  const snap = await getDocs(query(collection(db, 'invoices'), where('email', '==', user.email)))
  invoices.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const clearSelectedUser = () => {
  selectedUserName.value = ''
  selectedUserEmail.value = ''
  userSearchQuery.value = ''
  searchQuery.value = ''
  filterStatus.value = ''
  invoices.value = []
}

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

  await updateDoc(ref, { status: 'Paid', totalAmount: discountedAmount.value, idType: approveIdType.value, approvedAt })
  await addDoc(collection(db, 'notifications'), {
    userEmail: invoice.email,
    type: 'invoice-approved',
    message: `Your payment for ${invoice.services?.map(s => s.serviceName).join(', ') || 'a service'} has been approved.`,
    timestamp: approvedAt,
    read: false
  })

  invoices.value = invoices.value.map(inv =>
    inv.id === invoiceId ? { ...inv, status: 'Paid', totalAmount: discountedAmount.value, idType: approveIdType.value, approvedAt } : inv
  )

  showApproveModal.value = false
}

const deleteInvoice = async id => {
  await deleteDoc(doc(db, 'invoices', id))
  invoices.value = invoices.value.filter(inv => inv.id !== id)
}

onMounted(async () => {
  await fetchUsers()
  await fetchLastPayments()
})
</script>
