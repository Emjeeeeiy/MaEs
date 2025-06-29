<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <admin_sidebar class="w-64 border-r border-gray-200" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Admin Topbar -->
      <AdminTopbar />

      <!-- Main Section -->
      <div class="flex-1 p-6 overflow-y-auto">
        <h1 class="text-2xl font-semibold text-gray-800 mb-4">User Invoices</h1>

        <!-- Search Dropdown -->
        <div class="relative max-w-md mb-4">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search user..."
            class="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-800 placeholder-gray-500 focus:ring-green-400 focus:ring-1 focus:outline-none"
            @input="showDropdown = true"
          />
          <ul
            v-if="filteredUsers.length > 0 && showDropdown"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow max-h-44 overflow-auto text-sm"
          >
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
              @click="selectUser(user)"
            >
              {{ user.username }} - {{ user.email }}
            </li>
          </ul>
        </div>

        <!-- Invoice Table -->
        <div v-if="selectedUserEmail" class="bg-white border rounded-md shadow p-4">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-base font-medium text-gray-700">
              Invoices for <span class="font-semibold">{{ selectedUserName }}</span>
            </h2>
          </div>

          <!-- Filters -->
          <div class="flex flex-col md:flex-row gap-2 mb-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full md:w-1/2 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-500 focus:ring-green-400 focus:ring-1 focus:outline-none"
            />
            <select
              v-model="filterStatus"
              class="w-full md:w-1/4 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-green-400 focus:ring-1 focus:outline-none"
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <!-- Table -->
          <div>
            <table class="min-w-full text-sm text-left text-gray-700 border-t border-gray-200">
              <thead class="bg-gray-50 text-[11px] uppercase text-gray-600 border-b">
                <tr>
                  <th class="px-3 py-2">Date</th>
                  <th class="px-3 py-2">Services</th>
                  <th class="px-3 py-2">Total</th>
                  <th class="px-3 py-2">Method</th>
                  <th class="px-3 py-2">ID</th>
                  <th class="px-3 py-2">Status</th>
                  <th class="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in sortedInvoices"
                  :key="invoice.id"
                  class="border-b hover:bg-gray-50 text-xs"
                >
                  <td class="px-3 py-1.5 whitespace-nowrap">{{ formatDate(invoice.createdAt) }}</td>
                  <td class="px-3 py-1.5">{{ invoice.services.map((s) => s.serviceName).join(", ") }}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap">₱{{ invoice.totalAmount || 0 }}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap">{{ invoice.paymentMethod || "N/A" }}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap">{{ invoice.idType || "None" }}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap">
                    <span
                      class="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      :class="{
                        'bg-green-100 text-green-700 border-green-400': invoice.status === 'Paid',
                        'bg-yellow-100 text-yellow-700 border-yellow-400': invoice.status === 'Pending',
                        'bg-red-100 text-red-700 border-red-400': invoice.status === 'Not Paid',
                      }"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-3 py-1.5 text-center whitespace-nowrap">
                    <div class="flex gap-2 justify-center">
                      <button
                        v-if="invoice.status === 'Pending'"
                        @click="openApproveModal(invoice.id)"
                        class="bg-blue-600 text-white px-2 py-0.5 text-[11px] rounded hover:bg-blue-700"
                      >
                        Approve
                      </button>
                      <button
                        @click="deleteInvoice(invoice.id)"
                        class="bg-red-600 text-white px-2 py-0.5 text-[11px] rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="sortedInvoices.length === 0">
                  <td colspan="7" class="px-3 py-4 text-center text-gray-400 italic text-xs">
                    No invoices found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="bg-white text-gray-800 w-full max-w-sm p-6 rounded-xl shadow space-y-4">
        <h3 class="text-lg font-semibold text-gray-800">Set Invoice Details</h3>
        <p class="text-sm">Enter total amount and choose ID type.</p>

        <input
          type="number"
          v-model.number="approveAmount"
          placeholder="Enter total amount"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <select
          v-model="approveIdType"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">None</option>
          <option value="Senior">Senior Citizen</option>
          <option value="PWD">Person with Disability</option>
        </select>

        <div class="text-sm text-gray-700 mt-2">
          <span class="font-medium">Discounted Total:</span>
          ₱{{ discountedAmount.toFixed(2) }}
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="showApproveModal = false"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            @click="approveInvoice"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import admin_sidebar from '@/components/admin_sidebar.vue';
import AdminTopbar from '@/components/AdminTopbar.vue';

const users = ref([]);
const invoices = ref([]);
const selectedUserName = ref('');
const selectedUserEmail = ref('');
const userSearchQuery = ref('');
const filterStatus = ref('');
const searchQuery = ref('');
const showDropdown = ref(false);

const showApproveModal = ref(false);
const invoiceToApproveId = ref(null);
const approveAmount = ref(0);
const approveIdType = ref('');

const discountedAmount = computed(() => {
  const amount = approveAmount.value || 0;
  const hasDiscount = approveIdType.value === 'Senior' || approveIdType.value === 'PWD';
  return hasDiscount ? amount * 0.8 : amount;
});

const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  users.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const selectUser = async (user) => {
  selectedUserName.value = user.username;
  selectedUserEmail.value = user.email;
  userSearchQuery.value = `${user.username} - ${user.email}`;
  showDropdown.value = false;

  const q = query(collection(db, 'invoices'), where('email', '==', user.email));
  const snapshot = await getDocs(q);
  invoices.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const openApproveModal = (id) => {
  invoiceToApproveId.value = id;
  showApproveModal.value = true;
  approveAmount.value = 0;
  approveIdType.value = '';
};

const approveInvoice = async () => {
  const ref = doc(db, 'invoices', invoiceToApproveId.value);
  await updateDoc(ref, {
    status: 'Paid',
    totalAmount: discountedAmount.value,
    idType: approveIdType.value,
  });

  invoices.value = invoices.value.map((inv) =>
    inv.id === invoiceToApproveId.value
      ? {
          ...inv,
          status: 'Paid',
          totalAmount: discountedAmount.value,
          idType: approveIdType.value,
        }
      : inv
  );

  showApproveModal.value = false;
};

const deleteInvoice = async (id) => {
  await deleteDoc(doc(db, 'invoices', id));
  invoices.value = invoices.value.filter((inv) => inv.id !== id);
};

const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase();
  return users.value.filter(
    (u) =>
      u.role !== 'admin' &&
      (u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  );
});

const filteredInvoices = computed(() =>
  invoices.value.filter((inv) => {
    const statusMatch =
      !filterStatus.value || inv.status?.toLowerCase() === filterStatus.value.toLowerCase();
    const searchMatch =
      !searchQuery.value || JSON.stringify(inv).toLowerCase().includes(searchQuery.value.toLowerCase());
    return statusMatch && searchMatch;
  })
);

const statusPriority = { Pending: 1, 'Not Paid': 2, Paid: 3 };
const sortedInvoices = computed(() =>
  [...filteredInvoices.value].sort(
    (a, b) => (statusPriority[a.status] || 4) - (statusPriority[b.status] || 4)
  )
);

const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A';
  return ts.toDate().toISOString().split('T')[0];
};

onMounted(fetchUsers);
</script>
