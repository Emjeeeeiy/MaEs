<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div
      class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200"
    >
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm"
      >
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main
        class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar"
      >
        <!-- 🔍 Search -->
        <div class="flex justify-between items-center mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by patient email"
            class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- 📑 Accounts Table -->
        <div
          class="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <table class="w-full text-left text-sm text-gray-700">
            <thead class="bg-gray-100 border-b border-gray-200 text-gray-600">
              <tr>
                <th class="px-6 py-3">Email</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(group, email) in groupedInvoices"
                :key="email"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-3 font-medium text-gray-800">{{ email }}</td>
                <td class="px-6 py-3 text-right">
                  <button
                    @click="openInvoiceList(email)"
                    class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow transition active:scale-95"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr
                v-if="Object.keys(groupedInvoices).length === 0"
                class="text-center text-gray-500"
              >
                <td colspan="2" class="px-6 py-4">
                  No matching accounts found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- ✅ Modal: List of Invoices -->
    <transition name="fade">
      <div
        v-if="selectedEmail"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div
          class="bg-white/95 w-full max-w-2xl p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn"
        >
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            Invoices – {{ selectedEmail }}
          </h2>
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
              class="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition"
            >
              <p class="text-sm text-gray-600">
                Invoice Date:
                <span class="font-medium text-gray-800">{{
                  formatDate(invoice.createdAt)
                }}</span>
              </p>
              <p class="text-sm text-gray-600">
                Status:
                <span
                  class="px-2 py-0.5 text-xs rounded-lg"
                  :class="{
                    'bg-green-100 text-green-700': invoice.status === 'paid',
                    'bg-yellow-100 text-yellow-700': invoice.status === 'pending',
                    'bg-red-100 text-red-700': invoice.status === 'unpaid',
                  }"
                >
                  {{ invoice.status || 'N/A' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ✅ Modal: Enter Results -->
    <transition name="fade">
      <div
        v-if="selectedInvoice"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div
          class="bg-white/95 w-full max-w-2xl p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn"
        >
          <h2 class="text-lg font-semibold text-gray-800 mb-5">Enter Results</h2>
          <button
            @click="selectedInvoice = null"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <div class="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            <div
              v-for="svc in selectedInvoice.services"
              :key="svc.serviceName"
              class="space-y-2"
            >
              <label class="block text-sm font-medium text-gray-700">{{
                svc.serviceName
              }}</label>
              <textarea
                v-model="results[selectedInvoice.id + '_' + svc.serviceName]"
                placeholder="Enter result for this service…"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="selectedInvoice = null"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              @click="submitResults(selectedInvoice)"
              class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow transition active:scale-95"
            >
              Save Results
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ✅ Success Modal -->
    <transition name="fade">
      <div
        v-if="successMessage"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div
          class="bg-white/95 w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn text-center"
        >
          <h3 class="text-lg font-semibold text-green-600 mb-2">
            Saved Successfully
          </h3>
          <p class="text-gray-700 mb-4">{{ successMessage }}</p>
          <div>
            <button
              @click="successMessage = ''"
              class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow transition active:scale-95"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import AdminSidebar from "@/components/admin_sidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";

const invoices = ref([]);
const searchQuery = ref("");
const selectedEmail = ref(null);
const selectedInvoice = ref(null);
const results = ref({});
const successMessage = ref("");

const fetchInvoices = async () => {
  const snap = await getDocs(
    query(collection(db, "invoices"), orderBy("createdAt", "desc"))
  );
  invoices.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

onMounted(fetchInvoices);

const groupedInvoices = computed(() => {
  const grouped = {};
  invoices.value.forEach((inv) => {
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
  if (!ts?.toDate) return "N/A";
  return ts.toDate().toISOString().split("T")[0];
};

const openInvoiceList = (email) => {
  selectedEmail.value = email;
};

const openResultModal = (invoice) => {
  selectedInvoice.value = invoice;
  invoice.services.forEach((svc) => {
    const key = invoice.id + "_" + svc.serviceName;
    results.value[key] = svc.result || "";
  });
};

const submitResults = async (invoice) => {
  const updatedServices = invoice.services.map((svc) => {
    const key = invoice.id + "_" + svc.serviceName;
    return { ...svc, result: results.value[key] || "" };
  });

  try {
    await updateDoc(doc(db, "invoices", invoice.id), {
      services: updatedServices,
    });
    invoice.services = updatedServices;
    selectedInvoice.value = null;
    successMessage.value = "Results saved successfully.";
  } catch (err) {
    successMessage.value = "Error saving results: " + err.message;
  }
};
</script>
