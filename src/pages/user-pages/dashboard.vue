<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar class="w-full lg:w-64 border-r border-gray-200" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Sticky Topbar -->
      <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />

      <main class="p-4 sm:p-6 xl:p-10 space-y-10 max-w-7xl mx-auto w-full">
        <!-- Dashboard Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Total Revenue -->
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4">
            <div class="bg-green-100 text-green-600 p-3 rounded-full">
              <BanknotesIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-gray-600 text-sm">Total Revenue</h3>
              <p class="text-2xl font-semibold text-green-600">
                ${{ totalRevenue.toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Pending Claims -->
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4">
            <div class="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <DocumentTextIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-gray-600 text-sm">Pending Claims</h3>
              <p class="text-2xl font-semibold text-yellow-500">
                {{ pendingClaims }}
              </p>
            </div>
          </div>

          <!-- Outstanding Payments -->
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4">
            <div class="bg-red-100 text-red-600 p-3 rounded-full">
              <ExclamationCircleIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-gray-600 text-sm">Outstanding Payments</h3>
              <p class="text-2xl font-semibold text-red-500">
                ${{ outstandingPayments.toLocaleString() }}
              </p>
            </div>
          </div>
        </section>

        <!-- Invoices Table -->
        <section class="bg-white rounded-lg shadow p-3 sm:p-4 overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Recent Invoices</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-600 text-left">
                  <th class="px-3 py-2">Invoice #</th>
                  <th class="px-3 py-2">Amount</th>
                  <th class="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in invoices"
                  :key="invoice.id"
                  class="border-t hover:bg-gray-50 transition text-gray-700"
                >
                  <td class="px-3 py-2 font-medium">{{ invoice.id }}</td>
                  <td class="px-3 py-2 font-medium">
                    ${{ invoice.totalAmount?.toLocaleString() }}
                  </td>
                  <td
                    class="px-3 py-2 font-medium"
                    :class="getStatusClass(invoice.status)"
                  >
                    {{ invoice.status }}
                  </td>
                </tr>
                <tr v-if="invoices.length === 0">
                  <td colspan="3" class="px-3 py-3 text-center text-gray-400">
                    No invoices found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/Topbar.vue";
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Heroicons
import {
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/solid";

// Refs
const totalRevenue = ref(0);
const pendingClaims = ref(0);
const outstandingPayments = ref(0);
const invoices = ref([]);

const auth = getAuth();

// Fetch invoices for current user and calculate totals
const fetchInvoicesByEmail = async (email) => {
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    invoices.value = docs;

    // Reset metrics
    totalRevenue.value = 0;
    pendingClaims.value = 0;
    outstandingPayments.value = 0;

    for (const invoice of docs) {
      const status = (invoice.status || "").toLowerCase();
      const amount = Number(invoice.totalAmount) || 0;

      if (status === "paid") {
        totalRevenue.value += amount;
      } else if (status === "pending") {
        pendingClaims.value += 1;
        outstandingPayments.value += amount; // Include pending here
      } else if (status === "overdue") {
        outstandingPayments.value += amount;
      }
    }
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }
};

// Watch auth state and fetch data
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email) {
      fetchInvoicesByEmail(user.email);
    }
  });
});

// Status color helper
const getStatusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "text-green-600";
    case "pending":
      return "text-yellow-600";
    case "overdue":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
};
</script>
