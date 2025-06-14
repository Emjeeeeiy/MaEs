<template>
  <div class="flex min-h-screen bg-gray-100">
    <admin_sidebar class="w-64 border-r border-gray-200" />

    <div class="flex-1 p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">User Invoices</h1>

      <!-- User Search -->
      <div class="mb-4 max-w-md">
        <input
          v-model="userSearchQuery"
          type="text"
          placeholder="Search users..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-green-400 focus:ring-2"
        />
      </div>

      <!-- User Table -->
      <div class="bg-white shadow rounded-lg overflow-x-auto border">
        <table class="min-w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-100 text-xs text-gray-600 uppercase">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-4 py-2 font-medium">{{ user.username }}</td>
              <td class="px-4 py-2">{{ user.email }}</td>
              <td class="px-4 py-2 capitalize">{{ user.role }}</td>
              <td class="px-4 py-2">
                <button
                  class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  @click="openModal(user)"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="text-center text-gray-500 italic py-4">
                No matching users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Invoice Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="bg-white w-full max-w-5xl p-6 rounded-xl shadow relative">
          <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-lg" @click="closeModal">✕</button>

          <h2 class="text-xl font-bold text-gray-800 mb-2">
            Invoices for {{ selectedUserName }}
          </h2>

          <!-- Delete All Button -->
          <div class="mt-6 mb-4">
            <button
              @click="confirmDelete = true"
              class="bg-red-600 text-white px-4 py-1 text-sm rounded hover:bg-red-700"
            >
              Delete All Invoices
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-green-400 focus:ring-2"
            />
            <select
              v-model="filterStatus"
              class="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-green-400 focus:ring-2"
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <!-- Invoice Table -->
          <div class="overflow-x-auto border rounded max-h-[400px] overflow-y-auto">
            <table class="min-w-full text-sm text-left text-gray-700">
              <thead class="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th class="px-4 py-2">Date</th>
                  <th class="px-4 py-2">Services</th>
                  <th class="px-4 py-2">Total</th>
                  <th class="px-4 py-2">Method</th>
                  <th class="px-4 py-2">Status</th>
                  <th class="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in filteredInvoices"
                  :key="invoice.id"
                  class="border-t hover:bg-gray-50"
                >
                  <td class="px-4 py-2">{{ formatDate(invoice.createdAt) }}</td>
                  <td class="px-4 py-2">
                    {{ invoice.services.map(s => s.serviceName).join(', ') }}
                  </td>
                  <td class="px-4 py-2">₱{{ invoice.totalAmount }}</td>
                  <td class="px-4 py-2">{{ invoice.paymentMethod || 'N/A' }}</td>
                  <td class="px-4 py-2">
                    <span
                      class="text-xs font-bold px-2 py-1 rounded-full border"
                      :class="{
                        'bg-green-100 text-green-700 border-green-400': invoice.status === 'Paid',
                        'bg-yellow-100 text-yellow-700 border-yellow-400': invoice.status === 'Pending',
                        'bg-red-100 text-red-700 border-red-400': invoice.status === 'Not Paid',
                      }"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-4 py-2 flex justify-center gap-2">
                    <button
                      v-if="invoice.status === 'Pending'"
                      @click="approveInvoice(invoice.id)"
                      class="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                    >
                      Approve
                    </button>
                    <button
                      @click="deleteInvoice(invoice.id)"
                      class="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredInvoices.length === 0">
                  <td colspan="6" class="px-4 py-4 text-center text-gray-400 italic">
                    No invoices found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div v-if="confirmDelete" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl shadow max-w-md w-full text-center space-y-4">
          <h3 class="text-lg font-semibold text-red-600">Confirm Deletion</h3>
          <p class="text-gray-700">Are you sure you want to delete <strong>all invoices</strong> for {{ selectedUserEmail }}?</p>
          <div class="flex justify-center gap-4 mt-4">
            <button @click="performDeleteAll" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Yes, Delete</button>
            <button @click="confirmDelete = false" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccess" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl shadow max-w-sm w-full text-center">
          <h3 class="text-green-600 text-lg font-semibold mb-2">All invoices deleted</h3>
          <p class="text-gray-700 mb-4">The user’s invoices were successfully deleted.</p>
          <button @click="showSuccess = false" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">OK</button>
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

const users = ref([]);
const invoices = ref([]);
const selectedUserName = ref('');
const selectedUserEmail = ref('');
const showModal = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');
const confirmDelete = ref(false);
const showSuccess = ref(false);
const userSearchQuery = ref('');

const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  users.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const openModal = async (user) => {
  selectedUserName.value = user.username;
  selectedUserEmail.value = user.email;
  showModal.value = true;

  const q = query(collection(db, 'invoices'), where('email', '==', user.email));
  const snapshot = await getDocs(q);
  invoices.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const closeModal = () => {
  showModal.value = false;
  invoices.value = [];
  filterStatus.value = '';
  searchQuery.value = '';
};

const approveInvoice = async (invoiceId) => {
  const invoiceRef = doc(db, 'invoices', invoiceId);
  await updateDoc(invoiceRef, { status: 'Paid' });
  invoices.value = invoices.value.map((inv) =>
    inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
  );
};

const deleteInvoice = async (invoiceId) => {
  await deleteDoc(doc(db, 'invoices', invoiceId));
  invoices.value = invoices.value.filter((inv) => inv.id !== invoiceId);
};

const performDeleteAll = async () => {
  confirmDelete.value = false;
  const q = query(collection(db, 'invoices'), where('email', '==', selectedUserEmail.value));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  invoices.value = [];
  showSuccess.value = true;
};

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    const matchesRole = u.role !== 'admin';
    const matchesSearch =
      !userSearchQuery.value ||
      u.username?.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.value.toLowerCase());
    return matchesRole && matchesSearch;
  })
);

const filteredInvoices = computed(() =>
  invoices.value.filter((inv) => {
    const statusMatch = !filterStatus.value || inv.status?.toLowerCase() === filterStatus.value.toLowerCase();
    const searchMatch = !searchQuery.value || JSON.stringify(inv).toLowerCase().includes(searchQuery.value.toLowerCase());
    return statusMatch && searchMatch;
  })
);

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return 'N/A';
  return timestamp.toDate().toISOString().split('T')[0];
};

onMounted(fetchUsers);
</script>
