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
          <h2 class="text-lg font-semibold text-gray-900">Your Invoices</h2>
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
        <div v-else class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow-sm text-xs text-gray-800">
            <thead class="bg-gray-100 text-left text-[10px] uppercase text-gray-600">
              <tr>
                <th class="px-3 py-2">Invoice ID</th>
                <th class="px-3 py-2">Date</th>
                <th class="px-3 py-2">Services</th>
                <th class="px-3 py-2">Total</th>
                <th class="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="hover:bg-blue-50 transition"
              >
                <td class="px-3 py-2 font-mono">{{ invoice.id }}</td>
                <td class="px-3 py-2">{{ formattedDate(invoice.createdAt) }}</td>
                <td class="px-3 py-2">
                  <ul class="list-disc list-inside text-[11px] text-gray-700">
                    <li v-for="service in invoice.services" :key="service.serviceName">
                      {{ service.serviceName }}
                    </li>
                  </ul>
                </td>
                <td class="px-3 py-2 font-semibold">₱{{ invoice.totalAmount.toLocaleString() }}</td>
                <td class="px-3 py-2">
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
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "UserInvoices",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
  },
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
      const query = this.searchQuery.toLowerCase();

      return this.invoices
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA; // newest first
        })
        .filter((invoice) => {
          const invoiceStatus = (invoice.status || "").toLowerCase();
          const statusMatches = !this.filterStatus || invoiceStatus === statusFilter;

          const servicesText = invoice.services.map(s => s.serviceName).join(" ").toLowerCase();
          const total = invoice.totalAmount?.toString() || "";
          const date = this.formattedDate(invoice.createdAt).toLowerCase();

          const combined = [
            invoice.id?.toLowerCase(),
            servicesText,
            date,
            total,
            invoiceStatus,
          ].join(" ");

          const searchMatches = !this.searchQuery || combined.includes(query);

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
        const querySnapshot = await getDocs(q);
        this.invoices = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        this.loading = false;
      }
    },
    formattedDate(timestamp) {
      if (!timestamp || !timestamp.toDate) return "N/A";
      const date = timestamp.toDate();
      return date.toISOString().split("T")[0];
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
