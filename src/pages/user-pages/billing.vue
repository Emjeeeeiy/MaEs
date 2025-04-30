<template>
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <Sidebar />
  
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <Topbar />
  
        <!-- Billing Content -->
        <main class="p-6">
          <div class="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
            <h2 class="text-2xl font-semibold text-green-700 mb-6">Billing System</h2>
  
            <div v-if="loading" class="text-gray-500">Loading services...</div>
  
            <div v-else>
              <label class="block text-gray-700 font-medium mb-2">Select Services:</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div
                  v-for="service in services"
                  :key="service.id"
                  class="flex items-center bg-gray-100 p-3 rounded-md shadow-sm"
                >
                  <input
                    type="checkbox"
                    :value="service"
                    v-model="selectedServices"
                    class="form-checkbox text-green-600 mr-3"
                  />
                  <span class="text-gray-800">
                    {{ service.serviceName }} - ₱{{ service.cost }}
                  </span>
                </div>
              </div>
  
              <h3 class="text-lg font-semibold text-green-700 mb-4">
                Total: ₱{{ totalCost }}
              </h3>
  
              <button
                @click="generateInvoice"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                Generate Invoice
              </button>
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
  import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
  import { getAuth } from "firebase/auth";
  
  export default {
    name: "BillingPage",
    components: {
      Sidebar,
      Topbar,
    },
    data() {
      return {
        services: [],
        selectedServices: [],
        loading: true,
        userEmail: null,
      };
    },
    computed: {
      totalCost() {
        return this.selectedServices.reduce(
          (sum, service) => sum + (service.cost || 0),
          0
        );
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
          this.loading = false;
        } catch (error) {
          console.error("Error fetching services:", error);
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
          status: "Pending",
          createdAt: serverTimestamp(),
        };
  
        try {
          await addDoc(collection(db, "invoices"), invoiceData);
          alert(`Invoice generated successfully for ${user.email}!`);
          this.selectedServices = [];
        } catch (error) {
          console.error("Error generating invoice:", error);
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
  