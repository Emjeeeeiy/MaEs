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
                </select>
            </div>
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search Invoice ID"
                class="border bg-white text-gray-800 rounded px-2 py-1 text-xs w-full md:w-48"
            />
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center text-gray-500 py-6 text-sm">Loading invoices...</div>
  
            <!-- No invoices -->
            <div v-else-if="filteredInvoices.length === 0" class="text-center text-gray-500 py-6 text-sm">
              No invoices found.
            </div>
  
            <!-- Compact Invoice Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="bg-white p-3 rounded shadow-sm hover:shadow-md transition text-xs"
              >
                <h3 class="font-medium text-gray-800 mb-1 truncate">#{{ invoice.id }}</h3>
                <p class="text-gray-500 mb-1"><strong>Date:</strong> {{ formattedDate(invoice.createdAt) }}</p>
                <ul class="list-disc pl-4 mb-1 text-gray-700">
                  <li
                    v-for="service in invoice.services"
                    :key="service.serviceName"
                    class="truncate"
                  >
                    {{ service.serviceName }}
                  </li>
                </ul>
                <p><strong>Total:</strong> ₱{{ invoice.totalAmount }}</p>
                <span
                  class="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': invoice.status === 'Pending',
                    'bg-green-100 text-green-800': invoice.status === 'Paid'
                  }"
                >
                  {{ invoice.status }}
                </span>
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
  import { db } from "@/firebase";
  import { collection, getDocs, query, where } from "firebase/firestore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  
  export default {
    name: "UserInvoices",
    components: {
      Sidebar,
      Topbar,
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
        return this.invoices.filter(
          (invoice) =>
            (!this.filterStatus || invoice.status === this.filterStatus) &&
            (!this.searchQuery || invoice.id.includes(this.searchQuery))
        );
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
  