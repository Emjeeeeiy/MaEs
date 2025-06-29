<template>
  <div class="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar -->
    <div class="w-64 h-screen sticky top-0 border-r bg-white z-20">
      <AdminSidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col max-h-screen overflow-hidden">
      <div class="sticky top-0 z-10 bg-white border-b border-gray-300 shadow-sm">
        <AdminTopbar />
      </div>

      <main class="flex-1 p-6 space-y-6 overflow-y-auto">
        <h1 class="text-xl font-bold text-green-700">Input Patient Results</h1>

        <!-- Search Field -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by patient email"
          class="px-4 py-2 border rounded-md w-full max-w-md text-sm"
        />

        <!-- Unique Patient Table -->
        <table class="w-full mt-4 text-sm border border-gray-300 bg-white rounded shadow">
          <thead class="bg-gray-200">
            <tr>
              <th class="px-4 py-2 border text-left">Email</th>
              <th class="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(group, email) in groupedInvoices"
              :key="email"
              class="text-left"
            >
              <td class="px-4 py-2 border">{{ email }}</td>
              <td class="px-4 py-2 border text-center">
                <button
                  @click="openModal(email)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="Object.keys(groupedInvoices).length === 0">
              <td colspan="2" class="text-center text-gray-500 py-4 italic">No matching accounts found.</td>
            </tr>
          </tbody>
        </table>

        <!-- Modal for Services per User -->
        <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div class="relative bg-white w-full max-w-3xl rounded-lg shadow p-6 z-10 max-h-[80vh] overflow-y-auto">
            <h2 class="text-lg font-semibold mb-4 text-gray-800">
              Results – {{ selectedEmail }}
            </h2>

            <div
              v-for="invoice in groupedInvoices[selectedEmail]"
              :key="invoice.id"
              class="mb-6 border-t pt-4"
            >
              <p class="text-sm text-gray-500 mb-2">Invoice Date: {{ formatDate(invoice.createdAt) }}</p>

              <!-- Status Display -->
              <p class="text-sm text-gray-600 mb-2">
                <span class="font-medium">Status:</span>
                <span
                  :class="{
                    'text-green-600': invoice.status === 'Paid',
                    'text-yellow-600': invoice.status === 'Pending',
                    'text-red-600': invoice.status === 'Not Paid',
                  }"
                >
                  {{ invoice.status || 'N/A' }}
                </span>
              </p>

              <div
                v-for="svc in invoice.services"
                :key="svc.serviceName"
                class="mb-4"
              >
                <label class="block text-sm font-medium mb-1 text-gray-700">
                  {{ svc.serviceName }}
                </label>
                <textarea
                  v-model="results[invoice.id + '_' + svc.serviceName]"
                  class="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Enter result for this service…"
                />
              </div>
              <button
                @click="submitResults(invoice)"
                class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Save Results
              </button>
            </div>

            <div class="text-right mt-6">
              <button
                @click="selectedEmail = null"
                class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';
import AdminSidebar from '@/components/admin_sidebar.vue';
import AdminTopbar from '@/components/AdminTopbar.vue';

const invoices = ref([]);
const searchQuery = ref('');
const selectedEmail = ref(null);
const results = ref({});

const fetchInvoices = async () => {
  const snap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
  invoices.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

onMounted(fetchInvoices);

const groupedInvoices = computed(() => {
  const grouped = {};
  invoices.value.forEach(inv => {
    if (!inv.email) return;
    const email = inv.email.toLowerCase();
    if (!grouped[email]) grouped[email] = [];
    grouped[email].push(inv);
  });

  const filtered = {};
  const search = searchQuery.value.toLowerCase();
  Object.entries(grouped).forEach(([email, data]) => {
    if (email.includes(search)) filtered[email] = data;
  });

  return filtered;
});

const openModal = (email) => {
  selectedEmail.value = email;
  groupedInvoices.value[email].forEach(inv => {
    inv.services.forEach(svc => {
      const key = inv.id + '_' + svc.serviceName;
      results.value[key] = svc.result || '';
    });
  });
};

const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A';
  return ts.toDate().toISOString().split('T')[0];
};

const submitResults = async (invoice) => {
  const updatedServices = invoice.services.map(svc => {
    const key = invoice.id + '_' + svc.serviceName;
    return { ...svc, result: results.value[key] || '' };
  });

  try {
    await updateDoc(doc(db, 'invoices', invoice.id), {
      services: updatedServices
    });
    invoice.services = updatedServices;
    alert('Results saved for this invoice.');
  } catch (err) {
    alert('Error saving results: ' + err.message);
  }
};
</script>

<style scoped>
textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
