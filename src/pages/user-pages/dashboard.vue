<template>
  <div class="flex flex-col h-screen bg-white text-gray-800 overflow-hidden">
    <!-- Topbar -->
    <div class="flex-shrink-0 z-20 bg-white">
      <Topbar @toggleSidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @closeSidebar="isMobileSidebarOpen = false"
      />

      <!-- Mobile overlay -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/25 z-20 sm:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- MAIN -->
      <main
        class="flex-1 overflow-y-auto px-6 py-4 sm:ml-20"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <!-- TOP SECTION: Metrics + Appointments -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- LEFT: Cards -->
          <div class="flex flex-col gap-3">
            <!-- Summary Cards -->
            <div class="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg">
              <div class="w-12 h-12 rounded-md bg-red-50 flex items-center justify-center">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div class="text-xs text-red-700 font-semibold">Not Paid</div>
                <div class="text-lg font-bold text-red-800">
                  ₱{{ unpaidTotalAmount.toLocaleString('en-US', {minimumFractionDigits:2}) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg">
              <div class="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
                <Clock class="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div class="text-xs text-yellow-700 font-semibold">Pending</div>
                <div class="text-lg font-bold text-yellow-700">{{ unpaidClaims }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg">
              <div class="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center">
                <Wallet class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div class="text-xs text-green-700 font-semibold">Paid</div>
                <div class="text-lg font-bold text-green-700">{{ paidClaims }}</div>
              </div>
            </div>

            <!-- REFRESH ICON + VIEW ALL INVOICES -->
            <div class="flex items-center gap-2 mt-2">
              <button
                @click="refreshPage"
                class="p-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5.353 6.353A9 9 0 1118.647 17.647" />
                </svg>
              </button>
              <button
                @click="goToInvoices"
                class="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                View All Invoices
              </button>
            </div>
          </div>

          <!-- RIGHT: Appointments (max 3) -->
          <div class="bg-white border border-gray-200 p-4 rounded-lg flex flex-col">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-semibold text-gray-700">Recent Appointments</h2>
              <button
                @click="goToAppointments"
                class="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                View All
              </button>
            </div>
            <div v-if="appointments.length === 0" class="text-xs text-gray-500">
              No appointments yet.
            </div>
            <ul class="flex-1 space-y-2">
              <li
                v-for="appt in recentAppointments"
                :key="appt.id"
                class="border border-gray-200 rounded p-2 text-xs hover:bg-gray-50"
              >
                <div class="font-semibold">{{ appt.department }}</div>
                <div>{{ formattedDate(appt.date) }}</div>
                <div class="text-gray-500 truncate">{{ appt.notes || '-' }}</div>
                <div class="mt-1 text-[10px] px-1 py-0.5 inline-block rounded-full" 
                     :class="appointmentBadgeClass(appt.status)">
                  {{ appt.status }}
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- RECENT INVOICES TABLE -->
        <section class="mt-6 bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-semibold text-gray-700">Recent Invoices</h2>
            <!-- SEARCH ICON -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="pl-6 pr-2 py-1 text-xs border rounded bg-gray-50 focus:outline-none focus:ring focus:ring-blue-200"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-1 top-1.5 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.607-10.607 7.5 7.5 0 0010.607 10.607z"/>
              </svg>
            </div>
          </div>

          <table class="min-w-full text-xs border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-2 py-1 text-left">ID</th>
                <th class="px-2 py-1 text-left">Services</th>
                <th class="px-2 py-1 text-left">Status</th>
                <th class="px-2 py-1 text-left">Created</th>
                <th class="px-2 py-1 text-left">Email</th>
                <th class="px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="inv in filteredInvoices"
                :key="inv.id"
                class="border-t hover:bg-gray-50 cursor-pointer"
                @click="goToInvoices"
              >
                <td class="px-2 py-1">{{ inv.shortId }}</td>
                <td class="px-2 py-1">{{ inv.services?.map(s => s.serviceName).join(', ') }}</td>
                <td class="px-2 py-1">
                  <span :class="badgeClass(inv.status)" class="px-2 py-0.5 rounded-full font-semibold">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="px-2 py-1">{{ formattedDate(inv.createdAt) }}</td>
                <td class="px-2 py-1">{{ maskEmail(inv.email) }}</td>
                <td class="px-2 py-1 text-right">₱{{ calculateInvoiceTotal(inv).toLocaleString('en-US', {minimumFractionDigits:2}) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Topbar from "@/components/topbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { AlertTriangle, Clock, Wallet } from "lucide-vue-next";

const router = useRouter();
const auth = getAuth();

const invoices = ref([]);
const appointments = ref([]);
const loading = ref(true);

const unpaidTotalAmount = ref(0);
const unpaidClaims = ref(0);
const paidClaims = ref(0);
const isMobileSidebarOpen = ref(false);

const filterStatus = ref("");
const searchQuery = ref("");

// Fetch invoices
const fetchInvoicesByEmail = async (email) => {
  loading.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    invoices.value = docs;

    unpaidTotalAmount.value = 0;
    unpaidClaims.value = 0;
    paidClaims.value = 0;

    for (const inv of docs) {
      const status = (inv.status || "").toLowerCase();
      const amt = Number(inv.totalAmount || inv.services?.reduce((s, it) => s + (it.amount || 0), 0) || 0);
      if (status === "paid") paidClaims.value++;
      else {
        unpaidClaims.value++;
        unpaidTotalAmount.value += amt;
      }
    }
  } catch (err) {
    console.error("Error fetching invoices", err);
  } finally {
    loading.value = false;
  }
};

// Fetch appointments
const fetchAppointmentsByEmail = async (email) => {
  try {
    const q = query(collection(db, "appointments"), where("email", "==", email));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
    appointments.value = docs;
  } catch (err) {
    console.error("Error fetching appointments", err);
  }
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user?.email) {
      await fetchInvoicesByEmail(user.email);
      await fetchAppointmentsByEmail(user.email);
    }
  });
});

// Utilities
const calculateInvoiceTotal = (inv) => inv.services?.reduce((s, it) => s + (Number(it.amount) || 0), 0) || Number(inv.totalAmount || 0);
const formattedDate = (ts) => ts?.toDate ? ts.toDate().toISOString().split("T")[0] : (typeof ts === "string" ? new Date(ts).toISOString().split("T")[0] : "-");
const maskEmail = (e) => {
  if (!e) return "";
  const [name, domain] = e.split("@");
  return `${name.slice(0,2)}…@${domain}`;
};
const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid") return "bg-green-100 text-green-700";
  if (s === "not paid") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};
const appointmentBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "bg-green-100 text-green-700";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const goToInvoices = () => router.push("/invoices");
const goToAppointments = () => router.push("/appointment");

// REFRESH PAGE BUTTON
const refreshPage = () => window.location.reload(); // full page reload

// Only show latest 3 appointments
const recentAppointments = computed(() => appointments.value.slice(0, 3));

const filteredInvoices = computed(() => {
  const qs = searchQuery.value.toLowerCase().trim();
  const status = filterStatus.value.toLowerCase().trim();
  return invoices.value.filter((inv) => {
    if (status && (inv.status || "").toLowerCase() !== status) return false;
    if (!qs) return true;
    const svc = (inv.services || []).map(s => s.serviceName).join(" ").toLowerCase();
    return (inv.shortId || "").toLowerCase().includes(qs) || svc.includes(qs) || (inv.email || "").toLowerCase().includes(qs);
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
