<template>
  <div class="flex h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <div class="w-64 h-screen sticky top-0 border-r border-gray-800 bg-[#1f1f1f] z-20">
      <AdminSidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col max-h-screen overflow-hidden">
      <div class="sticky top-0 z-10 bg-[#1f1f1f] border-b border-gray-800 shadow">
        <AdminTopbar />
      </div>

      <main class="flex-1 p-6 space-y-6 overflow-y-auto">
        <!-- Search Field -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by patient email"
          class="px-4 py-2 border border-gray-700 rounded-md w-full max-w-md text-sm bg-[#2a2a2a] text-white placeholder-gray-400"
        />

        <!-- Unique Patient Table -->
        <table class="w-full mt-4 text-sm border border-gray-700 bg-[#222] rounded shadow">
          <thead class="bg-[#333] text-gray-300">
            <tr>
              <th class="px-4 py-2 border border-gray-700 text-left">Email</th>
              <th class="px-4 py-2 border border-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(group, email) in groupedInvoices"
              :key="email"
              class="border-t border-gray-700 hover:bg-[#2a2a2a]"
            >
              <td class="px-4 py-2 border border-gray-700">{{ email }}</td>
              <td class="px-4 py-2 border border-gray-700 text-center">
                <button
                  @click="openModal(email)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="Object.keys(groupedInvoices).length === 0">
              <td colspan="2" class="text-center text-gray-400 py-4 italic">
                No matching accounts found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Modal -->
        <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative bg-[#1f1f1f] w-full max-w-3xl rounded-lg shadow p-6 z-10 max-h-[80vh] overflow-y-auto border border-gray-700">
            <h2 class="text-lg font-semibold mb-4 text-white">Results – {{ selectedEmail }}</h2>

            <div
              v-for="invoice in groupedInvoices[selectedEmail]"
              :key="invoice.id"
              class="mb-6 border-t border-gray-700 pt-4"
            >
              <p class="text-sm text-gray-400 mb-2">
                Invoice Date: {{ formatDate(invoice.createdAt) }}
              </p>
              <p class="text-sm text-gray-400 mb-2">
                <span class="font-medium text-gray-300">Status:</span>
                <span
                  :class="{
                    'text-green-400': invoice.status === 'Paid',
                    'text-yellow-400': invoice.status === 'Pending',
                    'text-red-400': invoice.status === 'Not Paid',
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
                <label class="block text-sm font-medium mb-1 text-gray-300">
                  {{ svc.serviceName }}
                </label>
                <textarea
                  v-model="results[invoice.id + '_' + svc.serviceName]"
                  class="w-full border border-gray-700 rounded-md px-3 py-2 text-sm bg-[#2a2a2a] text-white"
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
                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <!-- Success Modal -->
        <transition name="fade">
          <div v-if="successMessage" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="successMessage = ''"></div>
            <div class="relative bg-black max-w-sm w-[90%] p-6 rounded-xl shadow-lg text-center space-y-3 z-10">
              <svg class="w-10 h-10 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <h3 class="text-lg font-semibold text-green-400">Saved Successfully</h3>
              <p class="text-sm text-gray-300">{{ successMessage }}</p>
              <button @click="successMessage = ''" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                Okay
              </button>
            </div>
          </div>
        </transition>
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
const successMessage = ref('');

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
    successMessage.value = 'Results saved successfully.';
  } catch (err) {
    successMessage.value = 'Error saving results: ' + err.message;
  }
};
</script>

<style scoped>
textarea {
  resize: vertical;
  min-height: 80px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
