<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm">
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
        <h1 class="text-2xl font-bold text-gray-800">📑 User Invoices</h1>

        <!-- 🔍 Search User -->
        <div class="relative max-w-lg">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search user..."
            class="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            @input="showDropdown = true"
          />
          <ul
            v-if="filteredUsers.length && showDropdown"
            class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {{ user.username }} - {{ user.email }}
            </li>
          </ul>
        </div>

        <!-- 📋 Accounts Table -->
        <div
          v-if="!selectedUserEmail && !userSearchQuery && accountsTable.length"
          class="overflow-x-auto bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm"
        >
          <table class="w-full text-sm">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="px-4 py-3 text-left">Username</th>
                <th class="px-4 py-3 text-left">Email</th>
                <th class="px-4 py-3 text-left">Last Payment</th>
                <th class="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in accountsTable" :key="user.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">{{ user.username }}</td>
                <td class="px-4 py-3">{{ user.email }}</td>
                <td class="px-4 py-3">{{ user.lastPayment ? formatDate(user.lastPayment) : '—' }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="selectUser(user)"
                    class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 📂 Selected User Invoices -->
        <div v-if="selectedUserEmail" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 class="text-lg font-semibold text-gray-800">
              Invoices for {{ selectedUserName }}
            </h2>
            <button
              @click="clearSelectedUser"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium transition"
            >
              ← Back to User List
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoices..."
              class="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <select
              v-model="filterStatus"
              class="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <!-- Invoices Table -->
          <div class="overflow-x-auto bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left">Date</th>
                  <th class="px-4 py-3 text-left">Services</th>
                  <th class="px-4 py-3 text-left">Total</th>
                  <th class="px-4 py-3 text-left">Method</th>
                  <th class="px-4 py-3 text-left">Reference No.</th>
                  <th class="px-4 py-3 text-left">Receipt</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="invoice in sortedInvoices"
                  :key="invoice.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-3">{{ formatDate(invoice.createdAt) }}</td>
                  <td class="px-4 py-3">{{ invoice.services.map(s => s.serviceName).join(', ') }}</td>
                  <td class="px-4 py-3 font-medium">₱{{ invoice.totalAmount || 0 }}</td>
                  <td class="px-4 py-3">{{ invoice.paymentMethod || 'N/A' }}</td>
                  <td class="px-4 py-3">{{ invoice.referenceNumber || 'N/A' }}</td>
                  <td class="px-4 py-3">
                    <a
                      v-if="invoice.receiptImage"
                      :href="invoice.receiptImage"
                      target="_blank"
                      class="text-green-600 hover:underline"
                    >
                      View
                    </a>
                    <span v-else class="text-gray-400">No image</span>
                  </td>
                  <td class="px-4 py-3">{{ invoice.status }}</td>
                  <td class="px-4 py-3 text-center space-x-2">
                    <button
                      v-if="invoice.status === 'Pending'"
                      @click="openApproveModal(invoice.id)"
                      class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow transition"
                    >
                      Approve
                    </button>
                    <button
                      @click="deleteInvoice(invoice.id)"
                      class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="sortedInvoices.length === 0">
                  <td colspan="8" class="px-4 py-6 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ✅ Approve Modal -->
        <transition name="fade">
          <div
            v-if="showApproveModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <div
              class="bg-white/95 w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn"
            >
              <h3 class="text-lg font-semibold mb-2 text-gray-800">
                Approve Payment
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Set total amount and ID type to finalize the payment.
              </p>

              <input
                type="number"
                v-model.number="approveAmount"
                placeholder="Enter total amount"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-3 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />

              <select
                v-model="approveIdType"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-3 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="">None</option>
                <option value="Senior">Senior Citizen</option>
                <option value="PWD">Person with Disability</option>
              </select>

              <div class="flex justify-between items-center mb-4 text-sm">
                <span class="text-gray-600">Discounted Total:</span>
                <span class="font-semibold text-gray-800">₱{{ discountedAmount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-end gap-3">
                <button
                  @click="showApproveModal = false"
                  class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  @click="approveInvoice"
                  class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow transition"
                >
                  Confirm
                </button>
              </div>
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
