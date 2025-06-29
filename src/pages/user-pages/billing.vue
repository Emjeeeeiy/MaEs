<template>
  <div class="flex bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen text-gray-800 overflow-hidden relative">
    <Sidebar />

    <div class="flex-1 flex flex-col max-h-screen">
      <Topbar />

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <transition name="fade" mode="out-in">
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[300px]">
            <LoadingAnimation />
          </div>

          <div v-else key="content" class="space-y-6 animate-fade-in">
            <!-- Header -->
            <div class="flex items-center gap-2">
              <CreditCardIcon class="w-6 h-6 text-blue-500" />
              <h2 class="text-xl font-bold text-green-700">Billing System</h2>
            </div>

            <!-- Billing Card -->
            <div class="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-6">
              <!-- Search Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search Service:</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Type to filter services..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <!-- Grouped Services by Category -->
              <div v-for="(services, category) in groupedFilteredServices" :key="category">
                <h3 class="text-md font-semibold text-gray-700 mt-4 mb-2">{{ category }}</h3>
                <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <label
                    v-for="service in services"
                    :key="service.id"
                    class="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
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

              <p v-if="Object.keys(groupedFilteredServices).length === 0" class="text-sm text-gray-500 mt-2">
                No services found.
              </p>

              <!-- Submit Button -->
              <div class="text-right pt-4">
                <button
                  @click="generateInvoice"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow transition"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- ✅ Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 animate-fade-in">
        <h2 class="text-xl font-semibold text-green-600">Invoice Generated</h2>
        <p class="text-gray-700 text-sm">
          Invoice <strong>{{ generatedShortId }}</strong> successfully generated for <strong>{{ userEmail }}</strong>.
        </p>
        <div class="text-center">
          <button
            @click="showSuccessModal = false"
            class="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            Close
          </button>
        </div>
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
import { CreditCardIcon } from "@heroicons/vue/24/solid";

export default {
  name: "BillingPage",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
    CreditCardIcon,
  },
  data() {
    return {
      services: [],
      selectedServices: [],
      searchQuery: "",
      loading: true,
      userEmail: null,
      showSuccessModal: false,
      generatedShortId: "",
    };
  },
  computed: {
    filteredServices() {
      if (!this.searchQuery.trim()) return this.services;
      const q = this.searchQuery.toLowerCase();
      return this.services.filter((service) =>
        service.serviceName.toLowerCase().includes(q)
      );
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
      const totalAmount = this.selectedServices.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      const invoiceData = {
        email: user.email,
        services: this.selectedServices.map(s => ({
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
