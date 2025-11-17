<template>
  <div class="h-screen overflow-hidden bg-gray-100 text-gray-800 flex flex-col relative">
    <!-- Topbar -->
    <div class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @close-sidebar="isMobileSidebarOpen = false"
        class="z-50"
      />

      <!-- Overlay -->
      <transition name="fade">
        <div
          v-if="isMobileSidebarOpen"
          @click="isMobileSidebarOpen = false"
          class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        ></div>
      </transition>

      <!-- Page Content -->
      <div
        :class="[
          'flex flex-col flex-1 w-full overflow-y-auto px-2 py-4 space-y-2 animate-fade-in transition-all',
          isMobileSidebarOpen ? 'blur-sm pointer-events-none select-none' : ''
        ]"
      >
        <!-- Filters -->
        <section class="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2 items-end">
          <div class="flex flex-col">
            <label class="text-[10px] text-gray-600 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <div class="flex flex-col flex-grow min-w-[120px]">
            <label class="text-[10px] text-gray-600 mb-1">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by ID, service..."
              class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <LoadingAnimation />
        </div>

        <!-- No Results -->
        <div
          v-else-if="filteredInvoices.length === 0"
          class="flex flex-col items-center justify-center flex-1 text-center py-20"
        >
          <div class="text-4xl mb-2">📄</div>
          <p class="text-gray-700 text-base font-semibold">No invoices found</p>
          <p class="text-gray-400 text-xs mt-1">
            Please check back later or create a new invoice
          </p>
        </div>

        <!-- Mobile Divider List -->
        <section v-else class="sm:hidden divide-y divide-gray-300">
          <div
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            class="py-3 flex flex-col text-xs space-y-1"
          >
            <!-- ID -->
            <div>
              <span class="font-semibold text-gray-800">ID: </span>
              <span class="text-gray-700">{{ invoice.shortId || 'N/A' }}</span>
            </div>

            <!-- Total -->
            <div>
              <span class="font-semibold text-gray-800">Total: </span>
              <span class="text-green-600 font-medium">
                ₱{{ calculateInvoiceTotal(invoice).toFixed(2) }}
              </span>
            </div>

            <!-- Services -->
            <div>
              <span class="font-semibold text-gray-800">Services: </span>
              <span class="text-gray-700 break-words">
                {{ invoice.services.map(s => s.serviceName).join(', ') }}
              </span>
            </div>

            <!-- Date -->
            <div>
              <span class="font-semibold text-gray-800">Date: </span>
              <span class="text-gray-700">{{ formattedDate(invoice.createdAt) }}</span>
            </div>

            <!-- Status -->
            <div>
              <span class="font-semibold text-gray-800">Status: </span>
              <span
                :class="[
                  'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
                  invoice.status === 'Paid'
                    ? 'bg-green-100 text-green-700'
                    : invoice.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                ]"
              >
                {{ invoice.status }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "UserInvoices",
  components: { Sidebar, Topbar, LoadingAnimation },
  data() {
    return {
      invoices: [],
      userEmail: null,
      filterStatus: "",
      searchQuery: "",
      loading: true,
      isMobileSidebarOpen: false,
    };
  },
  computed: {
    filteredInvoices() {
      const statusFilter = this.filterStatus.trim().toLowerCase();
      const q = this.searchQuery.toLowerCase();

      return this.invoices
        .slice()
        .sort((a, b) => {
          const dA = a.createdAt?.toDate?.() || new Date(0);
          const dB = b.createdAt?.toDate?.() || new Date(0);
          return dB - dA;
        })
        .filter((inv) => {
          const status = (inv.status || "").toLowerCase();
          const statusMatches = !statusFilter || status === statusFilter;

          const servicesText = inv.services
            .map((s) => s.serviceName)
            .join(" ")
            .toLowerCase();
          const combined = [
            (inv.shortId || "").toLowerCase(),
            servicesText,
            this.formattedDate(inv.createdAt).toLowerCase(),
            status,
          ].join(" ");

          const searchMatches = !q || combined.includes(q);
          return statusMatches && searchMatches;
        });
    },
  },
  methods: {
    async getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchInvoices();
        } else {
          console.error("User not authenticated");
          this.loading = false;
        }
      });
    },
    async fetchInvoices() {
      if (!this.userEmail) return;
      try {
        const q = query(
          collection(db, "invoices"),
          where("email", "==", this.userEmail)
        );
        const snap = await getDocs(q);
        this.invoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
    formattedDate(ts) {
      if (!ts || !ts.toDate) return "N/A";
      return ts.toDate().toISOString().split("T")[0];
    },
    calculateInvoiceTotal(invoice) {
      return (
        invoice.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
      );
    },
  },
  async mounted() {
    await this.getCurrentUser();
  },
};
</script>

<style>
/* Fade animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out; }

/* Fade transition for overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
</style>
