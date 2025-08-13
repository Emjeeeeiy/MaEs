<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden">
    <!-- Fixed Topbar -->
    <div class="flex-shrink-0 z-10">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <!-- Mobile Sidebar -->
    <Sidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close-sidebar="isMobileSidebarOpen = false"
      class="sm:hidden"
    />

    <!-- Desktop Sidebar + Main Content -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar (desktop) -->
      <aside class="w-64 flex-shrink-0 hidden sm:block border-r bg-white shadow-sm">
        <Sidebar :is-mobile-sidebar-open="true" />
      </aside>

      <!-- Main -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        <transition name="fade" mode="out-in">
          <!-- Loading State -->
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[300px]">
            <LoadingAnimation />
          </div>

          <!-- Main Content -->
          <div v-else key="content" class="space-y-8 animate-fade-in">
            <!-- Search & Filters -->
            <div class="bg-white border border-gray-200 rounded-2xl shadow p-6 space-y-6">
              <h2 class="text-lg font-semibold text-blue-600">Generate Invoice</h2>

              <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Search Service or Category:</label>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search services..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                </div>
                <div class="sm:w-60">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Category:</label>
                  <select
                    v-model="selectedCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
              </div>

              <!-- Grouped Services -->
              <div v-for="(services, category) in groupedFilteredServices" :key="category">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-green-600 mt-6 mb-2 first:mt-0">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span> {{ category }}
                </h3>
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <label
                    v-for="service in services"
                    :key="service.id"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        :value="service"
                        v-model="selectedServices"
                        class="form-checkbox text-blue-600 h-4 w-4"
                      />
                      <span class="text-sm text-gray-800">{{ service.serviceName }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-700">₱{{ service.amount }}</span>
                  </label>
                </div>
              </div>

              <!-- No Results -->
              <p
                v-if="Object.keys(groupedFilteredServices).length === 0"
                class="text-sm text-gray-500 text-center py-6"
              >
                No services found.
              </p>

              <!-- Generate Button -->
              <div class="pt-4 text-right">
                <button
                  @click="generateInvoice"
                  class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30 px-4"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center space-y-4 animate-fade-in">
        <h2 class="text-xl font-semibold text-green-600">Invoice Generated</h2>
        <p class="text-gray-700 text-sm">
          Invoice <strong>{{ generatedShortId }}</strong> successfully generated for
          <strong>{{ userEmail }}</strong>.
        </p>
        <button
          @click="showSuccessModal = false"
          class="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition w-full sm:w-auto"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/Topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "BillingPage",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
  },
  data() {
    return {
      services: [],
      selectedServices: [],
      searchQuery: "",
      selectedCategory: "",
      loading: true,
      userEmail: null,
      showSuccessModal: false,
      generatedShortId: "",
      isMobileSidebarOpen: false, // <-- NEW
    };
  },
  computed: {
    availableCategories() {
      const categories = this.services.map((s) => s.category || "Uncategorized");
      return [...new Set(categories)].sort();
    },
    filteredServices() {
      return this.services.filter((service) => {
        const query = this.searchQuery.toLowerCase();
        const matchesQuery =
          service.serviceName.toLowerCase().includes(query) ||
          (service.category || "").toLowerCase().includes(query);
        const matchesCategory = this.selectedCategory
          ? service.category === this.selectedCategory
          : true;
        return matchesQuery && matchesCategory;
      });
    },
    groupedFilteredServices() {
      return this.filteredServices.reduce((groups, service) => {
        const cat = service.category || "Uncategorized";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(service);
        return groups;
      }, {});
    },
  },
  methods: {
    async fetchServices() {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        this.services = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        this.loading = false;
      }
    },
    generateShortId() {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `INV-${randomPart}`;
    },
    async generateInvoice() {
      if (this.selectedServices.length === 0) {
        alert("Please select at least one service.");
        return;
      }
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in.");
        return;
      }
      const shortId = this.generateShortId();
      const totalAmount = this.selectedServices.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0
      );
      const invoiceData = {
        email: user.email,
        services: this.selectedServices.map((s) => ({
          serviceName: s.serviceName,
          amount: s.amount,
        })),
        status: "not paid",
        totalAmount,
        createdAt: serverTimestamp(),
        shortId,
      };
      try {
        await addDoc(collection(db, "invoices"), invoiceData);
        this.generatedShortId = shortId;
        this.userEmail = user.email;
        this.selectedServices = [];
        this.showSuccessModal = true;
      } catch (err) {
        console.error("Error generating invoice:", err);
        alert("Failed to generate invoice.");
      }
    },
  },
  mounted() {
    this.fetchServices();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.userEmail = user.email;
    }
  },
};
</script>
