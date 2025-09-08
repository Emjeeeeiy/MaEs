<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden">
    <!-- Topbar -->
    <div class="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <Topbar @toggleSidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @closeSidebar="isMobileSidebarOpen = false"
      />

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12">
        <!-- Loading -->
        <div v-if="loadingInvoices" class="flex justify-center items-center h-60">
          <LoadingAnimation />
        </div>

        <!-- Dashboard -->
        <div v-else class="space-y-12 animate-fadeIn">
          <!-- Section: Overview -->
          <section>
            <h2 class="text-lg font-semibold text-gray-700 mb-5">Overview</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Total Not Paid -->
              <div
                class="bg-gradient-to-r from-red-100 to-red-50 border border-red-200 rounded-2xl p-6 shadow hover:shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center gap-4"
              >
                <AlertTriangle class="w-10 h-10 text-red-600 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-red-700 mb-1">Total Not Paid</h3>
                  <p class="text-3xl font-bold text-red-800">
                    ₱{{ unpaidTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>

              <!-- Unpaid Claims -->
              <div
                class="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow hover:shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center gap-4"
              >
                <Clock class="w-10 h-10 text-yellow-500 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-yellow-600 mb-1">Unpaid Claims</h3>
                  <p class="text-3xl font-bold text-yellow-700">{{ unpaidClaims }}</p>
                </div>
              </div>

              <!-- Paid Claims -->
              <div
                class="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl p-6 shadow hover:shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center gap-4"
              >
                <Wallet class="w-10 h-10 text-green-600 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-green-600 mb-1">Paid Claims</h3>
                  <p class="text-3xl font-bold text-green-700">{{ paidClaims }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Recent Invoices -->
          <section>
            <div class="flex justify-between items-center mb-5">
              <div class="flex items-center gap-2">
                <FileText class="w-6 h-6 text-blue-600" />
                <h2 class="text-lg font-semibold text-gray-700">Recent Invoices</h2>
              </div>
              <button
                class="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                @click="goToInvoices"
              >
                View All
              </button>
            </div>

            <div class="overflow-x-auto">
              <!-- Desktop Table -->
              <table
                class="hidden sm:table w-full text-sm border border-gray-200 rounded-xl overflow-hidden shadow"
              >
                <thead class="bg-gray-100 text-gray-700">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold">Service(s)</th>
                    <th class="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr
                    v-for="invoice in invoices"
                    :key="invoice.id"
                    class="hover:bg-gray-50 cursor-pointer transition duration-200"
                    @click="goToInvoices"
                  >
                    <td class="px-4 py-3 text-left">
                      {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                    </td>
                    <td class="px-4 py-3 text-left">
                      <span
                        :class="[
                          'inline-block px-3 py-1 rounded-full text-xs font-semibold',
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
                  class="border border-gray-200 rounded-xl p-4 shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition"
                  @click="goToInvoices"
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
                        'inline-block px-3 py-1 rounded-full text-xs font-semibold',
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
import Topbar from "@/components/topbar.vue";
import Sidebar from "@/components/sidebar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FileText, AlertTriangle, Clock, Wallet } from "lucide-vue-next";

const invoices = ref([]);
const paidClaims = ref(0);
const unpaidClaims = ref(0);
const overdueCount = ref(0);
const unpaidTotalAmount = ref(0);
const loadingInvoices = ref(true);
const isMobileSidebarOpen = ref(false);

const router = useRouter();
const auth = getAuth();

const fetchInvoicesByEmail = async (email) => {
  loadingInvoices.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    console.error("❌ Error fetching invoices:", err);
  } finally {
    loadingInvoices.value = false;
  }
};

const goToInvoices = () => {
  router.push("/invoices");
};

onAuthStateChanged(auth, (user) => {
  if (user?.email) {
    fetchInvoicesByEmail(user.email);
  } else {
    invoices.value = [];
    paidClaims.value = 0;
    unpaidClaims.value = 0;
    overdueCount.value = 0;
    unpaidTotalAmount.value = 0;
  }
});
</script>


