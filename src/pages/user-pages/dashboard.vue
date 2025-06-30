<template>
  <div class="flex flex-col sm:flex-row min-h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar (no longer hidden here) -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col max-h-screen">
      <Topbar />

      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div v-if="loadingInvoices" class="flex justify-center items-center h-60">
          <LoadingAnimation />
        </div>

        <div v-else class="space-y-6">
          <!-- METRICS CARDS -->
          <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Total Not Paid -->
            <div class="bg-white border border-gray-300 shadow-sm rounded-lg p-4 flex items-center gap-4">
              <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
              <div class="text-center flex-1">
                <h3 class="text-sm text-gray-600 mb-1">Total Not Paid</h3>
                <p class="text-2xl font-semibold text-red-700">₱{{ unpaidTotalAmount.toFixed(2) }}</p>
              </div>
            </div>

            <!-- Unpaid Claims -->
            <div class="bg-white border border-gray-300 shadow-sm rounded-lg p-4 flex items-center gap-4">
              <ClockIcon class="w-8 h-8 text-yellow-500" />
              <div class="text-center flex-1">
                <h3 class="text-sm text-gray-600 mb-1">Unpaid Claims</h3>
                <p class="text-2xl font-semibold text-yellow-600">{{ unpaidClaims }}</p>
              </div>
            </div>

            <!-- Paid Claims -->
            <div class="bg-white border border-gray-300 shadow-sm rounded-lg p-4 flex items-center gap-4">
              <BanknotesIcon class="w-8 h-8 text-green-600" />
              <div class="text-center flex-1">
                <h3 class="text-sm text-gray-600 mb-1">Paid Claims</h3>
                <p class="text-2xl font-semibold text-green-700">{{ paidClaims }}</p>
              </div>
            </div>
          </section>

          <!-- RECENT INVOICES -->
          <section class="bg-white border border-gray-300 shadow-sm rounded-xl p-4">
            <div class="flex items-center gap-2 mb-4">
              <DocumentTextIcon class="w-6 h-6 text-blue-600" />
              <h2 class="text-lg sm:text-xl font-semibold text-gray-700">Recent Invoices</h2>
            </div>

            <!-- Responsive Table Wrapper -->
            <div class="overflow-x-auto">
              <!-- Desktop Table -->
              <table class="hidden sm:table w-full text-sm divide-y divide-gray-200">
                <thead class="bg-gray-100 text-gray-700">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium">Service(s)</th>
                    <th class="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                    </td>
                    <td class="px-4 py-3">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                          invoice.status?.toLowerCase() === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status?.toLowerCase() === 'not paid'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        ]"
                      >
                        {{ invoice.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="invoices.length === 0">
                    <td colspan="2" class="text-center py-4 text-gray-500">No invoices found.</td>
                  </tr>
                </tbody>
              </table>

              <!-- Mobile Cards -->
              <div class="space-y-4 sm:hidden">
                <div
                  v-for="invoice in invoices"
                  :key="invoice.id"
                  class="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                >
                  <div class="mb-2">
                    <p class="text-xs text-gray-500">Service(s)</p>
                    <p class="font-medium text-gray-700">
                      {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Status</p>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        invoice.status?.toLowerCase() === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status?.toLowerCase() === 'not paid'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      ]"
                    >
                      {{ invoice.status }}
                    </span>
                  </div>
                </div>

                <div v-if="invoices.length === 0" class="text-center text-gray-500 py-4">
                  No invoices found.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/Topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";

import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/solid";

const invoices = ref([]);
const paidClaims = ref(0);
const unpaidClaims = ref(0);
const overdueCount = ref(0);
const unpaidTotalAmount = ref(0);
const loadingInvoices = ref(true);

const auth = getAuth();

const fetchInvoicesByEmail = async (email) => {
  loadingInvoices.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort invoices by status
    docs.sort((a, b) => {
      const order = (status) => {
        if (!status) return 3;
        const s = status.toLowerCase();
        if (s === "not paid") return 0;
        if (s === "pending") return 1;
        if (s === "paid") return 2;
        return 3;
      };
      return order(a.status) - order(b.status);
    });

    invoices.value = docs;

    // Metrics calculation
    paidClaims.value = 0;
    unpaidClaims.value = 0;
    overdueCount.value = 0;
    unpaidTotalAmount.value = 0;

    const today = new Date();
    for (const invoice of docs) {
      const status = (invoice.status || "").toLowerCase();
      const amount = Number(invoice.totalAmount) || 0;
      const rawDate = invoice.date;
      const dueDate = rawDate?.toDate?.() || (typeof rawDate === "string" ? new Date(rawDate) : null);

      if (status === "paid") {
        paidClaims.value += 1;
      } else {
        unpaidClaims.value += 1;
        unpaidTotalAmount.value += amount;
        if (dueDate && dueDate < today) {
          overdueCount.value += 1;
        }
      }
    }
  } catch (err) {
    console.error("Error fetching invoices:", err);
  } finally {
    loadingInvoices.value = false;
  }
};

const loadTawkChatbot = () => {
  if (!window.Tawk_API) {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    (function () {
      const s1 = document.createElement("script"),
        s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = "https://embed.tawk.to/682390baa582f719105b0cc6/1ir5eqmhl";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s0.parentNode.insertBefore(s1, s0);
    })();
  }
};

const removeTawkChatbot = () => {
  const script = document.querySelector(
    'script[src="https://embed.tawk.to/682390baa582f719105b0cc6/1ir5eqmhl"]'
  );
  if (script) script.remove();
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email) {
      fetchInvoicesByEmail(user.email);
      loadTawkChatbot();
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.visitor = {
        name: user.displayName || "User",
        email: user.email,
      };
    } else {
      removeTawkChatbot();
    }
  });
});
</script>
