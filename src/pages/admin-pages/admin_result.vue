<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- Sidebar -->
    <aside class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-screen pt-16 overflow-y-auto shadow-sm custom-scrollbar">
      <AdminSidebar />
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Topbar -->
      <div class="fixed top-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200 md:left-64 md:right-0 w-full h-16 flex items-center px-6">
        <AdminTopbar />
      </div>

      <!-- Scrollable content -->
      <main class="flex-1 pt-16 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
        <!-- Search -->
        <div class="mb-4 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by patient email"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <!-- Accounts Table -->
        <div class="overflow-x-auto bg-white rounded-lg shadow border border-gray-300">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-200 text-gray-800 text-xs font-bold uppercase">
              <tr>
                <th class="px-4 py-2 border-b border-gray-300">Email</th>
                <th class="px-4 py-2 border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(group, email) in groupedInvoices" :key="email" class="hover:bg-gray-50">
                <td class="px-4 py-2">{{ email }}</td>
                <td class="px-4 py-2">
                  <button
                    @click="openInvoiceList(email)"
                    class="px-3 py-1 border border-blue-500 text-blue-600 rounded text-xs hover:bg-blue-50 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr v-if="Object.keys(groupedInvoices).length === 0">
                <td colspan="2" class="text-center px-4 py-4 text-gray-500">No matching accounts found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal: List of Invoices -->
        <transition name="fade">
          <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div class="bg-white/95 w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
              <h2 class="text-lg font-semibold mb-4">Invoices – {{ selectedEmail }}</h2>
              <button
                @click="selectedEmail = null"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <div
                  v-for="invoice in groupedInvoices[selectedEmail]"
                  :key="invoice.id"
                  @click="openResultModal(invoice)"
                  class="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                >
                  <p class="text-sm">Invoice Date: {{ formatDate(invoice.createdAt) }}</p>
                  <p class="text-sm">
                    <span>Status:</span>
                    <span class="font-medium">{{ invoice.status || 'N/A' }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Modal: Enter Results -->
        <transition name="fade">
          <div v-if="selectedInvoice" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div class="bg-white/95 w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
              <h2 class="text-lg font-semibold mb-4">Enter Results</h2>
              <button
                @click="selectedInvoice = null"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <div
                  v-for="svc in selectedInvoice.services"
                  :key="svc.serviceName"
                  class="flex flex-col"
                >
                  <label class="text-sm font-medium mb-1">{{ svc.serviceName }}</label>
                  <textarea
                    v-model="results[selectedInvoice.id + '_' + svc.serviceName]"
                    placeholder="Enter result for this service…"
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical min-h-[80px]"
                  />
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-4">
                <button
                  @click="selectedInvoice = null"
                  class="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  @click="submitResults(selectedInvoice)"
                  class="px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-50"
                >
                  Save Results
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Success Modal -->
        <transition name="fade">
          <div v-if="successMessage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div class="bg-white/95 w-full max-w-sm p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
              <h3 class="text-lg font-semibold mb-2">Saved Successfully</h3>
              <p class="text-sm text-gray-700 mb-4">{{ successMessage }}</p>
              <div class="flex justify-end">
                <button
                  @click="successMessage = ''"
                  class="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
                >
                  Okay
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
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminSidebar from '@/components/admin_sidebar.vue';
import AdminTopbar from '@/components/AdminTopbar.vue';

const invoices = ref([]);
const searchQuery = ref('');
const selectedEmail = ref(null);
const selectedInvoice = ref(null);
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

const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A';
  return ts.toDate().toISOString().split('T')[0];
};

const openInvoiceList = (email) => {
  selectedEmail.value = email;
};

const openResultModal = (invoice) => {
  selectedInvoice.value = invoice;
  invoice.services.forEach(svc => {
    const key = invoice.id + '_' + svc.serviceName;
    results.value[key] = svc.result || '';
  });
};

const submitResults = async (invoice) => {
  const updatedServices = invoice.services.map(svc => {
    const key = invoice.id + '_' + svc.serviceName;
    return { ...svc, result: results.value[key] || '' };
  });

  try {
    await updateDoc(doc(db, 'invoices', invoice.id), { services: updatedServices });
    invoice.services = updatedServices;
    selectedInvoice.value = null;
    successMessage.value = 'Results saved successfully.';
  } catch (err) {
    successMessage.value = 'Error saving results: ' + err.message;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
