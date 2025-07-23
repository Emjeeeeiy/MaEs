<template>
  <div class="h-screen overflow-hidden bg-gray-100 text-gray-800 flex flex-col">
    <!-- Topbar (full width) -->
    <div class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <Topbar />
    </div>

    <!-- Main Content Area with Sidebar + Page Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Page Content -->
      <div class="flex flex-col flex-1 w-full text-sm overflow-y-auto px-4 py-4 space-y-4 animate-fade-in">
        <!-- Filters -->
        <section class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-2 items-end">
          <div class="flex flex-col">
            <label class="text-xs text-gray-600 mb-0.5">Status</label>
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

          <div class="flex flex-col flex-grow min-w-[180px]">
            <label class="text-xs text-gray-600 mb-0.5">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by ID, service, status..."
              class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <LoadingAnimation />
        </div>

        <!-- No Results -->
        <div v-else-if="filteredInvoices.length === 0" class="text-center text-gray-500 text-sm py-10">
          No invoices found.
        </div>

        <!-- Desktop Table -->
        <section
          v-else
          class="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto"
        >
          <table class="min-w-full text-sm text-gray-800">
            <thead class="bg-gray-100 text-[11px] uppercase text-gray-600">
              <tr>
                <th class="px-4 py-2 text-left whitespace-nowrap">Invoice ID</th>
                <th class="px-4 py-2 text-left whitespace-nowrap">Services</th>
                <th class="px-4 py-2 text-left whitespace-nowrap">Total</th>
                <th class="px-4 py-2 text-left whitespace-nowrap">Date</th>
                <th class="px-4 py-2 text-left whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="hover:bg-blue-50 transition-colors border-t border-gray-100"
              >
                <td class="px-4 py-2 font-mono text-xs whitespace-nowrap">
                  {{ invoice.shortId || 'N/A' }}
                </td>
                <td class="px-4 py-2">
                  <ul class="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                    <li v-for="service in invoice.services" :key="service.serviceName">
                      {{ service.serviceName }} - ₱{{ service.amount?.toFixed(2) || '0.00' }}
                    </li>
                  </ul>
                </td>
                <td class="px-4 py-2 text-green-600 font-semibold whitespace-nowrap">
                  ₱{{ calculateInvoiceTotal(invoice).toFixed(2) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ formattedDate(invoice.createdAt) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <span
                    :class="[ 'px-2 py-0.5 rounded-full text-[11px] font-medium',
                      invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ invoice.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Mobile Card View -->
        <section class="sm:hidden space-y-4">
          <div
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            class="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
          >
            <div class="mb-2 text-xs text-gray-600">
              <span class="font-semibold text-gray-800">Invoice ID:</span> {{ invoice.shortId || 'N/A' }}
            </div>

            <div class="mb-2 text-xs text-gray-600">
              <span class="font-semibold text-gray-800">Services:</span>
              <ul class="list-disc list-inside ml-4 mt-1">
                <li
                  v-for="s in invoice.services"
                  :key="s.serviceName"
                  class="text-gray-700"
                >
                  {{ s.serviceName }} - ₱{{ s.amount?.toFixed(2) || '0.00' }}
                </li>
              </ul>
            </div>

            <div class="mb-1 text-xs text-gray-600">
              <span class="font-semibold text-gray-800">Total:</span>
              <span class="text-green-600 font-medium">
                ₱{{ calculateInvoiceTotal(invoice).toFixed(2) }}
              </span>
            </div>

            <div class="mb-1 text-xs text-gray-600">
              <span class="font-semibold text-gray-800">Date:</span>
              {{ formattedDate(invoice.createdAt) }}
            </div>

            <div class="text-xs mt-1">
              <span
                :class="[ 'px-2 py-0.5 rounded-full text-[11px] font-medium',
                  invoice.status === 'Paid'
                    ? 'bg-green-100 text-green-800'
                    : invoice.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
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
import Topbar from "@/components/Topbar.vue";
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

          const servicesText = inv.services.map((s) => s.serviceName).join(" ").toLowerCase();
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
        const q = query(collection(db, "invoices"), where("email", "==", this.userEmail));
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
      return invoice.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
    },
  },
  async mounted() {
    await this.getCurrentUser();
  },
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
