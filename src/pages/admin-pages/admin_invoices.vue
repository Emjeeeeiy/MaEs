<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <admin_sidebar class="w-64 border-r border-gray-200 shadow-md" />

    <!-- Main content -->
    <div class="flex-1 p-6 space-y-6 max-w-full w-full">
      <!-- Header -->
      <header class="mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-1">Invoices Management</h2>
        <p class="text-gray-500">Select a user to view their invoices</p>
      </header>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Users Table -->
        <section class="col-span-1">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Users</h3>

          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Search by name or email"
            class="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
          />

          <div class="overflow-auto border rounded shadow bg-white">
            <table class="min-w-full text-sm text-left text-gray-700">
              <thead class="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Email</th>
                  <th class="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  @click="fetchInvoicesForUser(user.email, user.username)"
                  class="hover:bg-green-50 cursor-pointer border-t"
                >
                  <td class="px-4 py-2 font-medium text-green-700">{{ user.username }}</td>
                  <td class="px-4 py-2">{{ user.email }}</td>
                  <td class="px-4 py-2 capitalize">{{ user.role }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Invoices Table -->
        <section class="col-span-1 lg:col-span-2 space-y-4">
          <div v-if="selectedUserEmail">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Invoices for {{ selectedUserName }}</h3>

            <!-- Filters -->
            <div class="flex flex-col md:flex-row gap-4 mb-4">
              <div class="flex flex-col">
                <label class="text-sm text-gray-600 mb-1">Filter by Status:</label>
                <select
                  v-model="filterStatus"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div class="flex flex-col w-full md:w-64">
                <label class="text-sm text-gray-600 mb-1">Search Invoice:</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Enter keyword"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
            </div>

            <!-- Invoice Table -->
            <div class="overflow-auto rounded shadow border border-gray-200 bg-white">
              <table class="min-w-full text-sm text-left text-gray-700">
                <thead class="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th class="px-6 py-3">Date</th>
                    <th class="px-6 py-3">Services</th>
                    <th class="px-6 py-3">Total (₱)</th>
                    <th class="px-6 py-3">Payment Method</th>
                    <th class="px-6 py-3">Status</th>
                    <th class="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="invoice in filteredInvoices"
                    :key="invoice.id"
                    class="bg-white border-b hover:bg-gray-50"
                  >
                    <td class="px-6 py-4">{{ formattedDate(invoice.createdAt) }}</td>
                    <td class="px-6 py-4">
                      {{ invoice.services.map(s => s.serviceName).join(', ') }}
                    </td>
                    <td class="px-6 py-4">₱{{ invoice.totalAmount }}</td>
                    <td class="px-6 py-4">{{ invoice.paymentMethod || 'N/A' }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="text-xs font-semibold px-2 py-1 rounded-full"
                        :class="{
                          'bg-green-100 text-green-700': invoice.status === 'Paid',
                          'bg-yellow-100 text-yellow-700': invoice.status === 'Pending',
                        }"
                      >
                        {{ invoice.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <button
                        v-if="invoice.status === 'Pending'"
                        @click="approveInvoice(invoice)"
                        :disabled="approvingInvoiceId === invoice.id"
                        class="text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 text-xs font-semibold px-3 py-1 rounded"
                      >
                        {{ approvingInvoiceId === invoice.id ? 'Approving...' : 'Approve' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="text-gray-400 italic">
            <p>Select a user to view their invoices.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import admin_sidebar from '@/components/admin_sidebar.vue';

const users = ref([]);
const invoices = ref([]);
const selectedUserEmail = ref(null);
const selectedUserName = ref('');
const filterStatus = ref('');
const searchQuery = ref('');
const userSearchQuery = ref('');
const approvingInvoiceId = ref(null);

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
    (!searchQuery.value || JSON.stringify(invoice).toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

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

const approveInvoice = async (invoice) => {
  approvingInvoiceId.value = invoice.id;

  try {
    const invoiceRef = doc(db, 'invoices', invoice.id);
    await updateDoc(invoiceRef, { status: 'Paid' });

    const idx = invoices.value.findIndex(inv => inv.id === invoice.id);
    if (idx !== -1) invoices.value[idx].status = 'Paid';

    alert(`Invoice approved successfully.`);
  } catch (error) {
    console.error('Error approving invoice:', error);
    alert('Failed to approve invoice.');
  } finally {
    approvingInvoiceId.value = null;
  }
};

onMounted(fetchUsers);
</script>
