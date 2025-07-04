<!-- BillingPage.vue -->
<template>
  <div class="flex flex-col lg:flex-row bg-gray-100 min-h-screen text-gray-800 overflow-hidden relative">
    <Sidebar />

    <div class="flex-1 flex flex-col max-h-screen">
      <Topbar />

      <main class="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <transition name="fade" mode="out-in">
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[300px]">
            <LoadingAnimation />
          </div>

          <div v-else key="content" class="space-y-6 animate-fade-in">
            <div class="bg-white border border-gray-300 rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
              <!-- Search + Category Filter -->
              <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Search Service or Category:</label>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Type to search services or category..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                </div>
                <div class="sm:w-60">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Category:</label>
                  <select
                    v-model="selectedCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
              </div>

              <!-- Grouped Service List -->
              <div v-for="(services, category) in groupedFilteredServices" :key="category">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-green-600 mt-4 mb-2 first:mt-0">
                  <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                  {{ category }}
                </h3>
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <label
                    v-for="service in services"
                    :key="service.id"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
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
                    <span class="text-sm font-medium text-gray-700 whitespace-nowrap">₱{{ service.amount }}</span>
                  </label>
                </div>
              </div>

              <!-- Empty state -->
              <p v-if="Object.keys(groupedFilteredServices).length === 0" class="text-sm text-gray-500">
                No services found.
              </p>

              <!-- Generate Button -->
              <div class="pt-2 sm:pt-4 text-right">
                <button
                  @click="generateInvoice"
                  class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-md shadow-sm transition"
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
    <div v-if="showSuccessModal" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30 px-4">
      <div class="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center space-y-4 animate-fade-in">
        <h2 class="text-xl font-semibold text-green-600">Invoice Generated</h2>
        <p class="text-gray-700 text-sm">
          Invoice <strong>{{ generatedShortId }}</strong> successfully generated for <strong>{{ userEmail }}</strong>.
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
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
