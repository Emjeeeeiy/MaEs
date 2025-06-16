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
            <div class="flex items-center gap-2">
              <CreditCardIcon class="w-6 h-6 text-blue-500" />
              <h2 class="text-2xl font-semibold text-gray-800">Billing System</h2>
            </div>

            <!-- Billing Form -->
            <div class="bg-white shadow rounded-xl p-6 space-y-6 border border-gray-200">
              <!-- Service Selection -->
              <div>
                <label class="block text-base font-medium text-gray-700 mb-2">Select Services:</label>
                <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    v-for="service in services"
                    :key="service.id"
                    class="flex items-center bg-gray-100 rounded-lg px-3 py-2 shadow-sm hover:bg-gray-200 transition"
                  >
                    <input
                      type="checkbox"
                      :value="service"
                      v-model="selectedServices"
                      class="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    />
                    <span class="text-sm text-gray-800">
                      {{ service.serviceName }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Total Cost -->
              <div class="text-right text-lg font-semibold text-gray-800 border-t pt-4">
                Total: ₱{{ totalCost.toLocaleString() }}
              </div>

              <!-- Generate Button -->
              <div class="text-right">
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

    <!-- ✅ SUCCESS MODAL -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 animate-fade-in">
        <h2 class="text-xl font-semibold text-green-600">Invoice Generated</h2>
        <p class="text-gray-700 text-sm">Successfully generated invoice for <strong>{{ userEmail }}</strong>.</p>
        <button
          @click="showSuccessModal = false"
          class="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
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
      loading: true,
      userEmail: null,
      showSuccessModal: false,
    };
  },
  computed: {
    totalCost() {
      return this.selectedServices.reduce((sum, service) => sum + (service.cost || 0), 0);
    },
  },
  methods: {
    async fetchServices() {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        this.services = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        this.loading = false;
      }
    },

    async generateInvoice() {
      if (this.selectedServices.length === 0) {
        alert("Please select at least one service.");
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to generate an invoice.");
        return;
      }

      const invoiceData = {
        email: user.email,
        services: this.selectedServices.map((service) => ({
          serviceName: service.serviceName,
          cost: service.cost,
        })),
        totalAmount: this.totalCost,
        status: "not paid",
        createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "invoices"), invoiceData);
        this.userEmail = user.email;
        this.selectedServices = [];
        this.showSuccessModal = true; // ✅ Show custom modal
      } catch (error) {
        console.error("Error generating invoice:", error);
        alert("Failed to generate invoice. Please try again.");
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
