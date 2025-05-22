<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <Topbar />

      <!-- Page Content -->
      <main class="p-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-xl font-semibold text-green-700 mb-1">Your Invoices</h2>
          <p class="text-sm text-gray-600 mb-4">Browse your invoices below.</p>

          <!-- Filters -->
          <div class="flex flex-col md:flex-row gap-2 items-center mb-4">
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-700">Status:</label>
              <select
                v-model="filterStatus"
                class="border bg-white text-gray-800 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Not Paid">Not Paid</option>
              </select>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Invoice ID"
              class="border bg-white text-gray-800 rounded px-2 py-1 text-xs w-full md:w-48"
            />
          </div>

          <!-- Table or Feedback -->
          <div>
            <div v-if="loading" class="flex justify-center py-8">
              <LoadingAnimation />
            </div>

            <div v-else-if="filteredInvoices.length === 0" class="text-center text-gray-500 py-6 text-sm">
              No invoices found.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full table-auto bg-white border border-black rounded text-sm shadow-sm">
                <thead>
                  <tr class="bg-gray-100 text-gray-700 text-left">
                    <th class="px-4 py-2 border-b">Invoice ID</th>
                    <th class="px-4 py-2 border-b">Date</th>
                    <th class="px-4 py-2 border-b">Services</th>
                    <th class="px-4 py-2 border-b">Total</th>
                    <th class="px-4 py-2 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="invoice in filteredInvoices"
                    :key="invoice.id"
                    class="hover:bg-gray-50 border-t"
                  >
                    <td class="px-4 py-2 font-medium text-gray-800">{{ invoice.id }}</td>
                    <td class="px-4 py-2 text-gray-700">{{ formattedDate(invoice.createdAt) }}</td>
                    <td class="px-4 py-2 text-gray-700">
                      <ul class="list-disc pl-4 space-y-1">
                        <li v-for="service in invoice.services" :key="service.serviceName">
                          {{ service.serviceName }}
                        </li>
                      </ul>
                    </td>
                    <td class="px-4 py-2 text-gray-800">₱{{ invoice.totalAmount }}</td>
                    <td class="px-4 py-2">
                      <span
                        class="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800': invoice.status?.toLowerCase() === 'pending',
                          'bg-green-100 text-green-800': invoice.status?.toLowerCase() === 'paid',
                          'bg-red-100 text-red-800': invoice.status?.toLowerCase() === 'not paid'
                        }"
                      >
                        {{ invoice.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
      return this.invoices.filter((invoice) => {
        const invoiceStatus = (invoice.status || "").toLowerCase();
        const statusMatches = !this.filterStatus || invoiceStatus === statusFilter;
        const searchMatches = !this.searchQuery || invoice.id.includes(this.searchQuery);
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
        this.invoices = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
table th,
table td {
  white-space: nowrap;
}
</style>
