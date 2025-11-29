<template>
  <div class="h-screen bg-gray-100 text-gray-800 flex flex-col relative">
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
          class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        ></div>
      </transition>

      <!-- Content -->
      <div
        :class="[
          'flex flex-col flex-1 w-full overflow-y-auto px-3 pt-3 pb-24 space-y-3 transition-all animate-fade-in',
          isMobileSidebarOpen ? 'blur-sm pointer-events-none select-none' : ''
        ]"
      >
        <!-- FILTERS (Improved for mobile) -->
        <section class="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          
          <!-- Search Slide Button -->
          <div class="flex items-center justify-between">
            <button
              @click="toggleSearch"
              class="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Search class="w-4 h-4 text-gray-600" />
            </button>

            <!-- Slide Search Box -->
            <transition name="slide-search">
              <input
                v-if="searchOpen"
                v-model="searchQuery"
                type="text"
                placeholder="Search invoice..."
                class="w-full ml-2 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
              />
            </transition>
          </div>

          <!-- FILTER BUTTONS -->
          <div class="flex gap-2 overflow-x-auto no-scrollbar pt-1">
            <button
              v-for="opt in filterOptions"
              :key="opt.value"
              @click="filterStatus = opt.value"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition',
                filterStatus === opt.value
                  ? opt.activeClass
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ opt.label }}
            </button>
          </div>
        </section>

        <!-- LOADING -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <LoadingAnimation />
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="filteredInvoices.length === 0"
          class="flex flex-col items-center justify-center flex-1 text-center py-20"
        >
          <div class="text-5xl mb-3">📄</div>
          <p class="text-gray-700 text-sm font-semibold">No invoices found</p>
          <p class="text-gray-400 text-xs mt-1">Try another filter or search term</p>
        </div>

        <!-- MOBILE LIST -->
        <section v-else class="space-y-3 sm:hidden">
          <div
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-2"
          >
            <!-- ID -->
            <div class="flex justify-between text-[11px]">
              <span class="font-medium text-gray-600 flex items-center gap-1">
                <FileText class="w-3 h-3" /> Invoice
              </span>
              <span class="font-semibold">{{ invoice.shortId }}</span>
            </div>

            <!-- Total -->
            <div class="flex justify-between text-[12px]">
              <span class="font-medium text-gray-600 flex items-center gap-1">
                <Receipt class="w-3 h-3" /> Total
              </span>
              <span class="text-green-600 font-bold text-sm">
                ₱{{ calculateInvoiceTotal(invoice).toFixed(2) }}
              </span>
            </div>

            <!-- Services -->
            <div>
              <p class="text-[11px] text-gray-600 font-medium flex items-center gap-1 mb-1">
                <List class="w-3 h-3" /> Services
              </p>
              <ul class="list-disc ml-4 text-gray-700 text-[11px] space-y-0.5">
                <li v-for="s in invoice.services" :key="s.serviceName">
                  {{ s.serviceName }}
                </li>
              </ul>
            </div>

            <!-- Date -->
            <div class="flex justify-between text-[11px]">
              <span class="font-medium text-gray-600 flex items-center gap-1">
                <Calendar class="w-3 h-3" /> Date
              </span>
              <span>{{ formattedDate(invoice.createdAt) }}</span>
            </div>

            <!-- Status -->
            <div class="flex justify-between text-[11px]">
              <span class="font-medium text-gray-600 flex items-center gap-1">
                <BadgeCheck class="w-3 h-3" /> Status
              </span>

              <span
                :class="[
                  'px-2 py-1 rounded-full text-[10px] font-medium',
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

import {
  FileText,
  Receipt,
  List,
  Calendar,
  BadgeCheck,
  Search
} from "lucide-vue-next";

import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "UserInvoices",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
    FileText,
    Receipt,
    List,
    Calendar,
    BadgeCheck,
    Search
  },

  data() {
    return {
      invoices: [],
      userEmail: null,
      filterStatus: "",
      searchQuery: "",
      searchOpen: false,
      loading: true,
      isMobileSidebarOpen: false,

      filterOptions: [
        {
          label: "All",
          value: "",
          activeClass: "bg-blue-100 text-blue-700"
        },
        {
          label: "Paid",
          value: "Paid",
          activeClass: "bg-green-100 text-green-700"
        },
        {
          label: "Pending",
          value: "Pending",
          activeClass: "bg-yellow-100 text-yellow-700"
        },
        {
          label: "Not Paid",
          value: "Not Paid",
          activeClass: "bg-red-100 text-red-700"
        }
      ],
    };
  },

  computed: {
    filteredInvoices() {
      const statusFilter = this.filterStatus.toLowerCase();
      const searchQuery = this.searchQuery.toLowerCase();

      return this.invoices
        .slice()
        .sort((a, b) => {
          const dA = a.createdAt?.toDate?.() || new Date(0);
          const dB = b.createdAt?.toDate?.() || new Date(0);
          return dB - dA;
        })
        .filter((invoice) => {
          const status = (invoice.status || "").toLowerCase();
          const statusMatch = !statusFilter || status === statusFilter;

          const services = invoice.services?.map(s => s.serviceName).join(" ").toLowerCase() || "";
          const combined = [
            invoice.shortId || "",
            services,
            this.formattedDate(invoice.createdAt),
            status
          ].join(" ").toLowerCase();

          const searchMatch = !searchQuery || combined.includes(searchQuery);

          return statusMatch && searchMatch;
        });
    },
  },

  methods: {
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) this.searchQuery = "";
    },

    async getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchInvoices();
        } else {
          this.loading = false;
        }
      });
    },

    async fetchInvoices() {
      try {
        const q = query(collection(db, "invoices"), where("email", "==", this.userEmail));
        const snap = await getDocs(q);
        this.invoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.error("Error loading invoices:", e);
      } finally {
        this.loading = false;
      }
    },

    formattedDate(timestamp) {
      if (!timestamp?.toDate) return "N/A";
      return timestamp.toDate().toISOString().split("T")[0];
    },

    calculateInvoiceTotal(invoice) {
      return invoice.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
    },
  },

  mounted() {
    this.getCurrentUser();
  },
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.35s ease-out; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-search-enter-active,
.slide-search-leave-active {
  transition: all 0.25s ease;
}
.slide-search-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.slide-search-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
