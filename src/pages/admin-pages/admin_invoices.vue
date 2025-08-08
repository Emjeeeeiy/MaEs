<template>
  <div class="flex h-screen overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#111] text-gray-200">
    <aside class="w-64 shrink-0 bg-[#1a1a1a] border-r border-gray-800 shadow-lg fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">
      <admin_sidebar />
    </aside>

    <div class="flex flex-col flex-1 pl-64 min-w-0">
      <div class="fixed top-0 left-0 right-0 z-20 h-16 shadow-md bg-[#1a1a1a] border-b border-gray-800">
        <AdminTopbar />
      </div>

      <div class="flex-1 p-6 overflow-y-auto space-y-6 animate-fade-in">
        <h1 class="text-2xl font-bold text-green-400 mb-4 tracking-wide">User Invoices</h1>

        <div class="relative max-w-md">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search user..."
            class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:ring-green-500 focus:ring-2 focus:outline-none shadow"
            @input="showDropdown = true"
          />
          <ul
            v-if="filteredUsers.length && showDropdown"
            class="absolute z-10 w-full mt-1 bg-[#222] border border-gray-700 rounded-md shadow-lg max-h-44 overflow-auto text-sm animate-fade-in"
          >
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              class="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer text-gray-200 transition"
              @click="selectUser(user)"
            >
              {{ user.username }} - {{ user.email }}
            </li>
          </ul>
        </div>

        <div
          v-if="!selectedUserEmail && !userSearchQuery && accountsTable.length"
          class="bg-[#222] border border-gray-700 rounded-xl shadow-md overflow-x-auto"
        >
          <table class="min-w-full text-sm text-left">
            <thead class="bg-green-900 text-green-300 uppercase text-[11px] font-semibold">
              <tr>
                <th class="px-4 py-2">Username</th>
                <th class="px-4 py-2">Email</th>
                <th class="px-4 py-2 whitespace-nowrap">Last Payment</th>
                <th class="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in accountsTable"
                :key="user.id"
                class="border-t border-gray-700 hover:bg-[#2b2b2b] even:bg-[#1f1f1f] text-xs transition"
              >
                <td class="px-4 py-2 whitespace-nowrap">{{ user.username }}</td>
                <td class="px-4 py-2 whitespace-nowrap">{{ user.email }}</td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ user.lastPayment ? formatDate(user.lastPayment) : '—' }}
                </td>
                <td class="px-4 py-2 text-center">
                  <button
                    @click="selectUser(user)"
                    class="bg-green-700 text-white px-3 py-1 rounded-md text-[11px] hover:bg-green-600 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="selectedUserEmail"
          class="bg-[#222] border border-gray-700 rounded-xl shadow-md p-4 space-y-4 animate-fade-in"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-base font-semibold text-green-300">
              Invoices for <span class="font-medium">{{ selectedUserName }}</span>
            </h2>
            <button
              @click="clearSelectedUser"
              class="text-xs bg-gray-700 text-gray-200 px-3 py-1 rounded hover:bg-gray-600 transition"
            >
              ← Back to User List
            </button>
          </div>

          <div class="flex flex-col md:flex-row gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full md:w-1/2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:ring-green-500 focus:ring-2 focus:outline-none"
            />
            <select
              v-model="filterStatus"
              class="w-full md:w-1/4 px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-sm text-gray-200 focus:ring-green-500 focus:ring-2 focus:outline-none"
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <table class="min-w-full text-sm border-t border-gray-600">
            <thead class="bg-green-900 text-green-300 text-[11px] uppercase">
              <tr>
                <th class="px-3 py-2">Date</th>
                <th class="px-3 py-2">Services</th>
                <th class="px-3 py-2">Total</th>
                <th class="px-3 py-2">Method</th>
                <th class="px-3 py-2">Reference No.</th>
                <th class="px-3 py-2">Receipt</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in sortedInvoices"
                :key="invoice.id"
                class="border-b border-gray-700 hover:bg-[#2b2b2b] text-xs transition"
              >
                <td class="px-3 py-1.5 whitespace-nowrap">{{ formatDate(invoice.createdAt) }}</td>
                <td class="px-3 py-1.5">{{ invoice.services.map((s) => s.serviceName).join(', ') }}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">₱{{ invoice.totalAmount || 0 }}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">{{ invoice.paymentMethod || 'N/A' }}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">{{ invoice.referenceNumber || 'N/A' }}</td>
                <td class="px-3 py-1.5 whitespace-nowrap">
                  <a
                    v-if="invoice.receiptImage"
                    :href="invoice.receiptImage"
                    target="_blank"
                    class="text-green-400 underline text-xs hover:text-green-300"
                  >
                    View
                  </a>
                  <span v-else class="text-gray-500 italic text-xs">No image</span>
                </td>
                <td class="px-3 py-1.5 whitespace-nowrap">
                  <span
                    class="text-[10px] font-medium px-2 py-0.5 rounded-full border shadow"
                    :class="{
                      'bg-green-900 text-green-300 border-green-600': invoice.status === 'Paid',
                      'bg-yellow-900 text-yellow-300 border-yellow-600': invoice.status === 'Pending',
                      'bg-red-900 text-red-300 border-red-600': invoice.status === 'Not Paid'
                    }"
                  >
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-3 py-1.5 text-center">
                  <div class="flex gap-2 justify-center">
                    <button
                      v-if="invoice.status === 'Pending'"
                      @click="openApproveModal(invoice.id)"
                      class="bg-blue-700 text-white px-2 py-0.5 text-[11px] rounded hover:bg-blue-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      @click="deleteInvoice(invoice.id)"
                      class="bg-red-700 text-white px-2 py-0.5 text-[11px] rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="sortedInvoices.length === 0">
                <td colspan="8" class="px-3 py-4 text-center text-gray-500 italic text-xs">
                  No invoices found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ✅ Approve modal -->
        <div
          v-if="showApproveModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div class="bg-[#1a1a1a] text-gray-200 w-full max-w-sm p-6 rounded-xl shadow-2xl border border-gray-600 animate-fade-in">
            <h3 class="text-lg font-semibold">Approve Payment</h3>
            <p class="text-sm mb-2">Set amount and ID type to finalize.</p>

            <input
              type="number"
              v-model.number="approveAmount"
              placeholder="Enter total amount"
              class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-sm text-gray-200 focus:ring-green-500 focus:ring-2 focus:outline-none"
            />

            <select
              v-model="approveIdType"
              class="w-full mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-sm text-gray-200 focus:ring-green-500 focus:ring-2 focus:outline-none"
            >
              <option value="">None</option>
              <option value="Senior">Senior Citizen</option>
              <option value="PWD">Person with Disability</option>
            </select>

            <div class="text-sm mt-4">
              <span class="font-medium">Discounted Total:</span>
              ₱{{ discountedAmount.toFixed(2) }}
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button
                @click="showApproveModal = false"
                class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                @click="approveInvoice"
                class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 text-sm shadow"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  addDoc,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage'
import { db } from '@/firebase'

import admin_sidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'

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

const receiptPreviewUrl = ref('')
const showReceiptModal = ref(false)

const discountedAmount = computed(() => {
  const amount = approveAmount.value || 0
  const eligible =
    approveIdType.value === 'Senior' || approveIdType.value === 'PWD'
  return eligible ? amount * 0.8 : amount
})

const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.role !== 'admin' &&
      (u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  )
})

const accountsTable = computed(() =>
  [...users.value]
    .filter((u) => u.role !== 'admin')
    .map((u) => ({
      ...u,
      lastPayment: userLastPayments.value[u.email] || null
    }))
    .sort((a, b) => {
      if (a.lastPayment && b.lastPayment) return b.lastPayment - a.lastPayment
      if (a.lastPayment) return -1
      if (b.lastPayment) return 1
      return 0
    })
)

const filteredInvoices = computed(() =>
  invoices.value.filter((inv) => {
    const statusOk =
      !filterStatus.value ||
      inv.status?.toLowerCase() === filterStatus.value.toLowerCase()
    const textOk =
      !searchQuery.value ||
      JSON.stringify(inv).toLowerCase().includes(searchQuery.value.toLowerCase())
    return statusOk && textOk
  })
)

const statusPriority = { Pending: 1, 'Not Paid': 2, Paid: 3 }
const sortedInvoices = computed(() =>
  [...filteredInvoices.value].sort(
    (a, b) => (statusPriority[a.status] || 4) - (statusPriority[b.status] || 4)
  )
)

const formatDate = (ts) => {
  if (!ts) return 'N/A'
  if (ts.toDate) ts = ts.toDate()
  return ts instanceof Date ? ts.toISOString().split('T')[0] : 'N/A'
}

const fetchUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  users.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const fetchLastPayments = async () => {
  const snap = await getDocs(collection(db, 'invoices'))
  const latest = {}
  snap.docs.forEach((d) => {
    const data = d.data()
    if (!data.email || !data.createdAt?.toDate) return
    const date = data.createdAt.toDate()
    if (!latest[data.email] || latest[data.email] < date) latest[data.email] = date
  })
  userLastPayments.value = latest
}

const selectUser = async (user) => {
  selectedUserName.value = user.username
  selectedUserEmail.value = user.email
  userSearchQuery.value = `${user.username} - ${user.email}`
  showDropdown.value = false

  const qInv = query(collection(db, 'invoices'), where('email', '==', user.email))
  const snap = await getDocs(qInv)
  invoices.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const clearSelectedUser = () => {
  selectedUserName.value = ''
  selectedUserEmail.value = ''
  userSearchQuery.value = ''
  searchQuery.value = ''
  filterStatus.value = ''
  invoices.value = []
}

const openApproveModal = (id) => {
  invoiceToApproveId.value = id
  approveAmount.value = 0
  approveIdType.value = ''
  showApproveModal.value = true
}

const approveInvoice = async () => {
  const invoiceId = invoiceToApproveId.value
  const ref = doc(db, 'invoices', invoiceId)
  const approvedAt = Timestamp.now()

  const invoice = invoices.value.find((i) => i.id === invoiceId)

  // ✅ Update invoice status
  await updateDoc(ref, {
    status: 'Paid',
    totalAmount: discountedAmount.value,
    idType: approveIdType.value,
    approvedAt
  })

  // ✅ Add notification
  await addDoc(collection(db, 'notifications'), {
    userEmail: invoice.email,
    type: 'invoice-approved',
    message: `Your payment for ${invoice.services?.map(s => s.serviceName).join(', ') || 'a service'} has been approved.`,
    timestamp: approvedAt,
    read: false
  })

  // ✅ Reflect changes in UI
  invoices.value = invoices.value.map((inv) =>
    inv.id === invoiceId
      ? {
          ...inv,
          status: 'Paid',
          totalAmount: discountedAmount.value,
          idType: approveIdType.value,
          approvedAt
        }
      : inv
  )

  showApproveModal.value = false
}

const deleteInvoice = async (id) => {
  await deleteDoc(doc(db, 'invoices', id))
  invoices.value = invoices.value.filter((inv) => inv.id !== id)
}

const viewReceipt = async (referenceNumber) => {
  if (!referenceNumber) return alert('No reference number found.')

  try {
    const storage = getStorage()
    const receiptRef = storageRef(storage, `gcash-receipts/${referenceNumber}.jpg`)
    const url = await getDownloadURL(receiptRef)
    receiptPreviewUrl.value = url
    showReceiptModal.value = true
  } catch (err) {
    console.error('Error fetching receipt:', err)
    alert('Receipt not found.')
  }
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  receiptPreviewUrl.value = ''
}

onMounted(async () => {
  await fetchUsers()
  await fetchLastPayments()
})
</script>

