<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <admin_sidebar class="w-64 border-r border-gray-200 shadow-md" />

    <!-- Main content -->
    <div class="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <header>
        <h2 class="text-3xl font-bold text-gray-800 mb-1">Invoices Management</h2>
        <p class="text-gray-500">Click on a user to view their invoices</p>
      </header>

      <!-- User Search -->
      <div class="max-w-lg">
        <input
          v-model="userSearchQuery"
          type="text"
          placeholder="Search by name or email"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>

      <!-- User Cards -->
      <section>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Users</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            @click="fetchInvoicesForUser(user.email, user.username)"
            class="cursor-pointer border border-gray-200 bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <h4 class="text-lg font-bold text-green-700">{{ user.username }}</h4>
            <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
            <span class="text-xs inline-block mt-1 px-2 py-1 bg-green-100 text-green-600 rounded">
              Role: {{ user.role }}
            </span>
          </div>
        </div>
      </section>

      <!-- Invoices Section -->
      <section v-if="selectedUserEmail" class="space-y-4">
        <h3 class="text-2xl font-bold text-gray-800">Invoices for {{ selectedUserName }}</h3>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <label class="block text-sm text-gray-600">Filter by Status:</label>
            <select
              v-model="filterStatus"
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div class="w-full md:w-64">
            <label class="block text-sm text-gray-600">Search Invoice ID:</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Enter Invoice ID"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>
        </div>

        <!-- Invoices -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            class="bg-white border border-gray-200 p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h4 class="text-lg font-semibold text-gray-800">Invoice #{{ invoice.id }}</h4>
            <p class="text-sm text-gray-600 mt-1"><strong>Date:</strong> {{ formattedDate(invoice.createdAt) }}</p>
            <p class="text-sm text-gray-600"><strong>Services:</strong> {{ invoice.services.map(s => s.serviceName).join(', ') }}</p>
            <p class="text-sm text-gray-600"><strong>Total:</strong> ₱{{ invoice.totalAmount }}</p>
            <span
              class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-green-100 text-green-700': invoice.status === 'Paid',
                'bg-yellow-100 text-yellow-700': invoice.status === 'Pending',
              }"
            >
              {{ invoice.status }}
            </span>
          </div>
        </div>
      </section>

      <!-- No user selected -->
      <div v-else class="text-gray-400 italic">
        <p>Select a user to view their invoices.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import admin_sidebar from '@/components/admin_sidebar.vue';

// State
const users = ref([]);
const invoices = ref([]);
const selectedUserEmail = ref(null);
const selectedUserName = ref('');
const filterStatus = ref('');
const searchQuery = ref('');
const userSearchQuery = ref('');

// Computed
const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.role !== 'admin' &&
    (
      user.username?.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.value.toLowerCase())
    )
  );
});

const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice =>
    (!filterStatus.value || invoice.status === filterStatus.value) &&
    (!searchQuery.value || invoice.id.includes(searchQuery.value))
  );
});

// Functions
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchInvoicesForUser = async (email, username) => {
  selectedUserEmail.value = email;
  selectedUserName.value = username;

  try {
    const q = query(collection(db, 'invoices'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    invoices.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (invoices.value.length === 0) {
      alert(`No invoices found for ${username}.`);
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
};

const formattedDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  const date = timestamp.toDate();
  return date.toISOString().split('T')[0];
};

// Lifecycle
onMounted(fetchUsers);
</script>
