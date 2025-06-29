<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">
    <Sidebar />
    <div class="flex flex-col flex-1 w-full text-sm">
      <div class="sticky top-0 z-50 bg-white shadow">
        <Topbar />
      </div>

      <main class="flex-1 overflow-y-auto px-3 py-3 space-y-4 animate-fade-in">
        <!-- Header -->
        <div class="space-y-0.5">
          <h2 class="text-xl font-bold text-green-700">Your Invoices</h2>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 items-end bg-white p-3 rounded-md shadow-sm border border-gray-200">
          <div class="flex flex-col">
            <select
              v-model="filterStatus"
              class="mt-0.5 px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>

          <div class="flex flex-col flex-grow min-w-[180px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search"
              class="mt-0.5 px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-6">
          <LoadingAnimation />
        </div>

        <!-- No Results -->
        <div v-else-if="filteredInvoices.length === 0" class="text-gray-600 text-center py-6 text-xs">
          No invoices found.
        </div>

        <!-- Invoices Table -->
        <div v-else class="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
          <table class="min-w-full bg-white text-xs text-gray-800">
            <thead class="bg-gray-100 text-left text-[10px] uppercase text-gray-600">
              <tr>
                <th class="px-3 py-2 whitespace-nowrap">Invoice&nbsp;ID</th>
                <th class="px-3 py-2 whitespace-nowrap">Service(s)</th>
                <th class="px-3 py-2 whitespace-nowrap">Total Amount</th>
                <th class="px-3 py-2 whitespace-nowrap">Date</th>
                <th class="px-3 py-2 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="hover:bg-blue-50 transition"
              >
                <!-- shortId -->
                <td class="px-3 py-2 font-mono whitespace-nowrap">
                  {{ invoice.shortId || 'N/A' }}
                </td>

                <!-- Services with Amount -->
                <td class="px-3 py-2">
                  <ul class="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                    <li v-for="service in invoice.services" :key="service.serviceName">
                      {{ service.serviceName }} - ₱{{ service.amount?.toFixed(2) || '0.00' }}
                    </li>
                  </ul>
                </td>

                <!-- Total -->
                <td class="px-3 py-2 whitespace-nowrap font-semibold text-green-600">
                  ₱{{ calculateInvoiceTotal(invoice).toFixed(2) }}
                </td>

                <!-- Date -->
                <td class="px-3 py-2 whitespace-nowrap">
                  {{ formattedDate(invoice.createdAt) }}
                </td>

                <!-- Status -->
                <td class="px-3 py-2 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-medium',
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
        </div>
      </main>
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
  async mounted() {
    await this.getCurrentUser();
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
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
