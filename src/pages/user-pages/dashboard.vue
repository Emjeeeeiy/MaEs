<template>
  <div class="flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden">
    <!-- Topbar -->
    <div
      class="flex-shrink-0 z-20 transition-all duration-200 bg-white border-b border-gray-200"
    >
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

      <!-- Main -->
      <main
        class="flex-1 overflow-y-auto px-3 py-3 pb-28 sm:pb-20"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <!-- Top compact header (counts + totals) -->
        <div class="mb-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-semibold text-gray-700">Dashboard</h1>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="goToInvoices"
                class="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                View All Invoices
              </button>
            </div>
          </div>
        </div>

        <!-- Overview (compact cards) -->
        <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <!-- Not paid -->
          <div
            class="flex items-center gap-3 bg-white border border-gray-200 p-2 md:p-4 rounded-lg shadow-sm"
          >
            <div class="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-md bg-red-50">
              <AlertTriangle class="w-5 h-5 md:w-7 md:h-7 text-red-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10px] md:text-sm text-red-700 font-semibold">Not Paid</div>
                  <div class="text-base md:text-lg font-bold text-red-800">₱{{ unpaidTotalAmount.toLocaleString('en-US',{minimumFractionDigits:2}) }}</div>
                </div>
                <div class="text-right text-[11px] md:text-sm text-gray-500">{{ unpaidClaims }} open</div>
              </div>
            </div>
          </div>

          <!-- Pending -->
          <div class="flex items-center gap-3 bg-white border border-gray-200 p-2 md:p-4 rounded-lg shadow-sm">
            <div class="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-md bg-yellow-50">
              <Clock class="w-5 h-5 md:w-7 md:h-7 text-yellow-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10px] md:text-sm text-yellow-700 font-semibold">Pending</div>
                  <div class="text-base md:text-lg font-bold text-yellow-700">{{ unpaidClaims }}</div>
                </div>
                <div class="text-right text-[11px] md:text-sm text-gray-500">{{ overdueCount }} overdue</div>
              </div>
            </div>
          </div>

          <!-- Paid -->
          <div class="flex items-center gap-3 bg-white border border-gray-200 p-2 md:p-4 rounded-lg shadow-sm">
            <div class="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-md bg-green-50">
              <Wallet class="w-5 h-5 md:w-7 md:h-7 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10px] md:text-sm text-green-700 font-semibold">Paid</div>
                  <div class="text-base md:text-lg font-bold text-green-700">{{ paidClaims }}</div>
                </div>
                <div class="text-right text-[11px] md:text-sm text-gray-500">recent</div>
              </div>
            </div>
          </div>
        </section>


        <!-- Compact controls row -->
        <div class="mt-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-600">Status</label>
            <select v-model="filterStatus" class="text-xs px-2 py-1 border rounded bg-white">
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search id / service..."
              class="text-xs px-2 py-1 border rounded w-48 bg-white"
            />
            <button @click="refresh" class="text-xs px-2 py-1 bg-gray-100 border rounded">Refresh</button>
          </div>
        </div>

        <!-- Invoices grid / list (compact) -->
        <section class="mt-3">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <template v-if="filteredInvoices.length">
              <article
                v-for="inv in filteredInvoices"
                :key="inv.id"
                class="bg-white border border-gray-200 p-2 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                @click="goToInvoices"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-[11px] font-semibold text-gray-800 truncate">
                      {{ inv.shortId || '—' }}
                    </div>
                    <div class="text-[11px] text-gray-600 truncate">
                      {{ inv.services?.map(s => s.serviceName).join(', ') || 'No services' }}
                    </div>
                  </div>

                  <div class="text-right flex-shrink-0">
                    <div class="text-[11px] font-semibold text-green-700">{{ formatCurrency(calculateInvoiceTotal(inv)) }}</div>
                    <div>
                      <span
                        :class="badgeClass(inv.status)"
                        class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      >
                        {{ inv.status }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <div>{{ formattedDate(inv.createdAt) }}</div>
                  <div class="text-right">{{ inv.email ? maskEmail(inv.email) : '' }}</div>
                </div>
              </article>
            </template>

            <!-- empty -->
            <div v-if="filteredInvoices.length === 0" class="col-span-full bg-white border border-dashed border-gray-200 p-3 rounded-lg text-center text-sm text-gray-500">
              No invoices found
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- small welcome toast (compact) -->
    <transition name="fade">
      <div
        v-if="showWelcomePopup"
        class="fixed top-4 right-4 z-50 bg-white border border-gray-200 px-3 py-2 rounded-md text-xs flex items-center gap-2 shadow"
      >
        <CheckCircle class="w-4 h-4 text-green-600" />
        <div>
          <div class="font-medium text-gray-800">Welcome</div>
          <div class="text-[11px] text-gray-500">You're logged in</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
/* Compact dashboard — Option B */
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import LoadingAnimation from "@/components/loading_animation.vue";
import Topbar from "@/components/topbar.vue";
import Sidebar from "@/components/Sidebar.vue";

import {
  FileText,
  AlertTriangle,
  Clock,
  Wallet,
  CheckCircle,
} from "lucide-vue-next";

const router = useRouter();
const auth = getAuth();

const invoices = ref([]);
const loading = ref(true);
const unpaidTotalAmount = ref(0);
const unpaidClaims = ref(0);
const paidClaims = ref(0);
const overdueCount = ref(0);
const isMobileSidebarOpen = ref(false);
const showWelcomePopup = ref(false);

const filterStatus = ref("");
const searchQuery = ref("");

/* Fetch invoices for current user */
const fetchInvoicesByEmail = async (email) => {
  loading.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // compact sort: newest first by createdAt or fallback to id
    docs.sort((a, b) => {
      const ta = a.createdAt?.seconds || a.createdAt?._seconds || 0;
      const tb = b.createdAt?.seconds || b.createdAt?._seconds || 0;
      return tb - ta;
    });

    invoices.value = docs;

    // compute small metrics
    unpaidTotalAmount.value = 0;
    unpaidClaims.value = 0;
    paidClaims.value = 0;
    overdueCount.value = 0;

    const now = new Date();
    for (const inv of docs) {
      const status = (inv.status || "").toLowerCase();
      const amt = Number(inv.totalAmount || inv.services?.reduce((s, it) => s + (it.amount || 0), 0) || 0);
      if (status === "paid") paidClaims.value++;
      else {
        unpaidClaims.value++;
        unpaidTotalAmount.value += amt;
      }
      const raw = inv.date;
      const due = raw?.toDate?.() || (typeof raw === "string" ? new Date(raw) : null);
      if (due && due < now && status !== "paid") overdueCount.value++;
    }
  } catch (err) {
    console.error("Error fetching invoices", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user?.email) {
      await fetchInvoicesByEmail(user.email);
      showWelcomePopup.value = true;
      setTimeout(() => (showWelcomePopup.value = false), 2000);
    } else {
      invoices.value = [];
      loading.value = false;
    }
  });
});

/* Utilities */
const calculateInvoiceTotal = (inv) => {
  return inv.services?.reduce((s, it) => s + (Number(it.amount) || 0), 0) || Number(inv.totalAmount || 0);
};

const formattedDate = (ts) => {
  if (!ts) return "-";
  if (ts?.toDate) return ts.toDate().toISOString().split("T")[0];
  if (typeof ts === "string") return new Date(ts).toISOString().split("T")[0];
  return new Date(ts.seconds ? ts.seconds * 1000 : ts).toISOString().split("T")[0];
};

const formatCurrency = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 2 });
};

const maskEmail = (e) => {
  if (!e) return "";
  const [name, domain] = e.split("@");
  const short = name.length > 2 ? name.slice(0, 2) + "…" : name;
  return `${short}@${domain}`;
};

const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid") return "bg-green-100 text-green-700";
  if (s === "not paid") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const goToInvoices = () => router.push("/invoices");
const refresh = async () => {
  const user = auth.currentUser;
  if (user?.email) {
    await fetchInvoicesByEmail(user.email);
  }
};

const filteredInvoices = computed(() => {
  const qs = searchQuery.value.toLowerCase().trim();
  const status = filterStatus.value.toLowerCase().trim();
  return invoices.value.filter((inv) => {
    if (status && (inv.status || "").toLowerCase() !== status) return false;
    if (!qs) return true;
    const svc = (inv.services || []).map((s) => s.serviceName).join(" ").toLowerCase();
    return (inv.shortId || "").toLowerCase().includes(qs) || svc.includes(qs) || (inv.email || "").toLowerCase().includes(qs);
  });
});
</script>

<style scoped>
/* compact styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
