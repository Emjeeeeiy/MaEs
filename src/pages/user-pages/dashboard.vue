<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar class="w-full lg:w-64 border-r border-gray-200" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Sticky Topbar -->
      <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />

      <!-- Loading State -->
      <div v-if="loadingInvoices" class="flex-1 flex justify-center items-center">
        <LoadingAnimation />
      </div>

      <!-- Main Dashboard -->
      <main v-else class="p-4 sm:p-6 xl:p-10 max-w-7xl mx-auto w-full">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Invoice Table -->
          <section class="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-black">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Invoices</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full table-auto border-collapse text-sm">
                <thead>
                  <tr class="bg-gray-100 text-gray-600 text-left">
                    <th class="px-4 py-2">Amount</th>
                    <th class="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="invoice in invoices"
                    :key="invoice.id"
                    class="border-t hover:bg-gray-50 transition text-gray-700"
                  >
                    <td class="px-4 py-3 font-medium">
                      ₱{{ invoice.totalAmount?.toLocaleString() }}
                    </td>
                    <td
                      class="px-4 py-3 font-medium"
                      :class="getStatusClass(invoice.status)"
                    >
                      {{ invoice.status }}
                    </td>
                  </tr>
                  <tr v-if="invoices.length === 0">
                    <td colspan="2" class="px-4 py-3 text-center text-gray-400">
                      No invoices found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Right: Metric Cards -->
          <section class="space-y-6">
            <div class="bg-white border border-black rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-4">
              <div class="bg-green-100 text-green-600 p-3 rounded-full">
                <BanknotesIcon class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-gray-600 text-sm font-medium">Total Revenue</h3>
                <p class="text-2xl font-semibold text-green-600">
                  ₱{{ totalRevenue.toLocaleString() }}
                </p>
              </div>
            </div>

            <div class="bg-white border border-black rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-4">
              <div class="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                <DocumentTextIcon class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-gray-600 text-sm font-medium">Unpaid Claims</h3>
                <p class="text-2xl font-semibold text-yellow-600">
                  {{ unpaidClaims }}
                </p>
              </div>
            </div>

            <div class="bg-white border border-black rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-4">
              <div class="bg-red-100 text-red-600 p-3 rounded-full">
                <ExclamationCircleIcon class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-gray-600 text-sm font-medium">Unpaid Amount</h3>
                <p class="text-2xl font-semibold text-red-600">
                  ₱{{ unpaidTotalAmount.toLocaleString() }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <!-- Bottom Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-white border border-black rounded-xl p-4 shadow flex flex-col justify-center items-start space-y-1">
            <h3 class="text-gray-600 text-sm font-medium mb-1">Claim Summary</h3>
            <p class="text-base font-medium text-green-600">✔ Paid Claims: {{ paidClaims }}</p>
            <p class="text-base font-medium text-yellow-600">⌛ Unpaid Claims: {{ unpaidClaims }}</p>
          </div>

          <div class="bg-white border border-black rounded-xl p-4 shadow flex flex-col justify-center items-start">
            <h3 class="text-gray-600 text-sm font-medium mb-1">Overdue Count</h3>
            <p class="text-xl font-semibold text-red-600">
              {{ overdueCount }}
            </p>
          </div>
        </div>
      </main>
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
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/solid";

// Refs
const invoices = ref([]);
const totalRevenue = ref(0);
const paidClaims = ref(0);
const unpaidClaims = ref(0);
const overdueCount = ref(0);
const unpaidTotalAmount = ref(0);
const isLoggedIn = ref(false);
const loadingInvoices = ref(true);

const auth = getAuth();

// Load Tawk.to Chatbot
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

// Fetch invoices
const fetchInvoicesByEmail = async (email) => {
  loadingInvoices.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    invoices.value = docs;

    totalRevenue.value = 0;
    paidClaims.value = 0;
    unpaidClaims.value = 0;
    overdueCount.value = 0;
    unpaidTotalAmount.value = 0;

    const today = new Date();

    for (const invoice of docs) {
      const status = (invoice.status || "").toLowerCase();
      const amount = Number(invoice.totalAmount) || 0;

      const rawDate = invoice.date;
      const dueDate =
        rawDate?.toDate?.() || (typeof rawDate === "string" ? new Date(rawDate) : null);

      if (status === "paid") {
        totalRevenue.value += amount;
        paidClaims.value += 1;
      } else {
        unpaidClaims.value += 1;
        unpaidTotalAmount.value += amount;

        if (dueDate && dueDate < today) {
          overdueCount.value += 1;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching invoices:", error);
  } finally {
    loadingInvoices.value = false;
  }
};

// Status color class
const getStatusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "text-green-600";
    case "pending":
      return "text-yellow-600";
    case "overdue":
    case "not paid":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
};

// Init on mount
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email) {
      fetchInvoicesByEmail(user.email);
      isLoggedIn.value = true;
      loadTawkChatbot();

      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.visitor = {
        name: user.displayName || "User",
        email: user.email,
      };
    } else {
      isLoggedIn.value = false;
      removeTawkChatbot();
    }
  });
});
</script>
