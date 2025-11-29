<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden relative">
    <!-- 🔔 Popup Notification -->
    <transition name="slide-fade">
      <div
        v-if="showWelcomePopup"
        class="fixed top-4 right-4 bg-white border border-green-200 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 z-50 animate-fadeIn text-xs sm:text-sm"
      >
        <CheckCircle class="w-4 h-4 text-green-500" />
        <div>
          <p class="font-medium text-gray-800">Welcome</p>
          <p class="text-gray-500">You are now logged in 🎉</p>
        </div>
      </div>
    </transition>

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
      <div class="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6 sm:space-y-8 pb-24 sm:pb-6">
        <!-- Loading -->
        <div v-if="loadingInvoices" class="flex justify-center items-center h-40 sm:h-60">
          <LoadingAnimation />
        </div>

        <!-- Dashboard -->
        <div v-else class="space-y-6 sm:space-y-8 animate-fadeIn">
          <!-- Section: Overview -->
          <section>
            <h2 class="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-4">Overview</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <!-- Total Not Paid -->
              <div
                class="bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4 shadow hover:shadow-md transition transform hover:scale-[1.02] flex items-center gap-2 sm:gap-3"
              >
                <AlertTriangle class="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5">Total Not Paid</h3>
                  <p class="text-xl sm:text-2xl font-bold text-red-800">
                    ₱{{ unpaidTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>

              <!-- Unpaid Claims -->
              <div
                class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 sm:p-4 shadow hover:shadow-md transition transform hover:scale-[1.02] flex items-center gap-2 sm:gap-3"
              >
                <Clock class="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-[10px] sm:text-xs font-semibold text-yellow-600 mb-0.5">Unpaid Claims</h3>
                  <p class="text-xl sm:text-2xl font-bold text-yellow-700">{{ unpaidClaims }}</p>
                </div>
              </div>

              <!-- Paid Claims -->
              <div
                class="bg-green-50 border border-green-200 rounded-2xl p-3 sm:p-4 shadow hover:shadow-md transition transform hover:scale-[1.02] flex items-center gap-2 sm:gap-3"
              >
                <Wallet class="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <div class="flex-1">
                  <h3 class="text-[10px] sm:text-xs font-semibold text-green-600 mb-0.5">Paid Claims</h3>
                  <p class="text-xl sm:text-2xl font-bold text-green-700">{{ paidClaims }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Recent Invoices -->
          <section class="space-y-2 sm:space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-semibold text-gray-700">
                <FileText class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>Recent Invoices</span>
              </div>
              <button
                class="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                @click="goToInvoices"
              >
                View All
              </button>
            </div>

            <!-- Desktop Cards -->
            <div class="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div
                v-for="invoice in invoices"
                :key="invoice.id"
                class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow hover:shadow-md cursor-pointer transition transform hover:scale-[1.01]"
                @click="goToInvoices"
              >
                <div class="flex justify-between items-start">
                  <div class="flex items-center gap-2">
                    <FileText class="w-4 h-4 text-blue-500" />
                    <span class="text-xs sm:text-sm font-medium text-gray-700 truncate">
                      {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                    </span>
                  </div>
                  <span
                    :class="[ 
                      'inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold',
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

              <!-- Empty State -->
              <div v-if="invoices.length === 0" class="col-span-full flex flex-col items-center justify-center py-8">
                <div class="text-3xl mb-2">📄</div>
                <p class="text-gray-600 font-medium text-sm">No invoices found</p>
                <p class="text-gray-400 text-xs mt-1">Please check back later or create a new invoice</p>
              </div>
            </div>

            <!-- Mobile List -->
            <div class="sm:hidden space-y-2">
              <div
                v-for="(invoice, index) in invoices"
                :key="invoice.id"
                class="bg-white border border-gray-200 rounded-xl p-2 shadow-sm cursor-pointer hover:shadow-md transition"
                @click="goToInvoices"
              >
                <div class="flex justify-between items-start">
                  <ul class="list-disc list-inside text-gray-700 text-xs sm:text-sm flex-1">
                    <li v-for="service in invoice.services" :key="service.serviceName" class="truncate">
                      {{ service.serviceName }}
                    </li>
                  </ul>
                  <span
                    :class="[ 
                      'inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold',
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
                <div v-if="index !== invoices.length - 1" class="border-t border-gray-200 mt-1"></div>
              </div>

              <!-- Empty State -->
              <div v-if="invoices.length === 0" class="py-6 flex flex-col items-start">
                <div class="text-3xl mb-1">📄</div>
                <p class="text-gray-600 font-medium text-sm">No invoices found</p>
                <p class="text-gray-400 text-xs mt-1">Please check back later or create a new invoice</p>
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
import Sidebar from "@/components/Sidebar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FileText, AlertTriangle, Clock, Wallet, CheckCircle } from "lucide-vue-next";

const invoices = ref([]);
const paidClaims = ref(0);
const unpaidClaims = ref(0);
const overdueCount = ref(0);
const unpaidTotalAmount = ref(0);
const loadingInvoices = ref(true);
const isMobileSidebarOpen = ref(false);
const showWelcomePopup = ref(false);

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
    showWelcomePopup.value = true;
    setTimeout(() => {
      showWelcomePopup.value = false;
    }, 3000);
  } else {
    invoices.value = [];
    paidClaims.value = 0;
    unpaidClaims.value = 0;
    overdueCount.value = 0;
    unpaidTotalAmount.value = 0;
  }
});
</script>

<style scoped>
/* Animation for popup */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
</style>
