<template>
  <div class="flex flex-col sm:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
    <Sidebar />

    <div class="flex-1 flex flex-col max-h-screen">
      <Topbar />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <transition name="fade" mode="out-in">
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[300px]">
            <LoadingAnimation />
          </div>

          <div v-else key="content" class="space-y-6 animate-fade-in">
            <div class="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
              <h3 class="font-medium text-sm text-gray-700 mb-2">Select Unpaid Invoices:</h3>

              <!-- Table for Desktop -->
              <div class="hidden sm:block overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-100 text-gray-600">
                    <tr>
                      <th class="px-4 py-2 text-left">Select</th>
                      <th class="px-4 py-2 text-left">Service(s)</th>
                      <th class="px-4 py-2 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr
                      v-for="invoice in sortedInvoices"
                      :key="invoice.id"
                      class="hover:bg-gray-50 transition"
                    >
                      <td class="px-4 py-2">
                        <input
                          type="checkbox"
                          :value="invoice"
                          v-model="selectedInvoices"
                          class="form-checkbox text-blue-600"
                        />
                      </td>
                      <td class="px-4 py-2">
                        {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                      </td>
                      <td class="px-4 py-2 text-green-600 font-medium">
                        ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
                      </td>
                    </tr>
                    <tr v-if="sortedInvoices.length === 0">
                      <td colspan="3" class="text-center text-gray-500 py-4">No unpaid invoices found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="space-y-4 sm:hidden">
                <div
                  v-for="invoice in sortedInvoices"
                  :key="invoice.id"
                  class="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                >
                  <label class="flex items-center mb-2">
                    <input
                      type="checkbox"
                      :value="invoice"
                      v-model="selectedInvoices"
                      class="form-checkbox text-blue-600 mr-2"
                    />
                    <span class="font-medium text-sm text-gray-700">Select</span>
                  </label>
                  <div class="text-sm text-gray-600">
                    <p class="mb-1">
                      <span class="font-semibold">Services:</span>
                      {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                    </p>
                    <p>
                      <span class="font-semibold">Amount:</span>
                      <span class="text-green-600 font-medium">
                        ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="text-right">
                <button
                  @click="showPaymentMethodModal = true"
                  :disabled="selectedInvoices.length === 0"
                  class="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- Payment Method Modal -->
    <transition name="fade">
      <div
        v-if="showPaymentMethodModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white w-80 p-4 rounded-lg shadow-xl space-y-4 animate-fade-in">
          <h3 class="text-base font-bold text-center">Select Payment Method</h3>
          <div class="grid grid-cols-2 gap-2 text-sm font-medium">
            <button @click="submitPayments('Cash')" class="bg-gray-100 hover:bg-gray-200 py-1.5 rounded-md">Cash</button>
            <button @click="submitPayments('GCash')" class="bg-blue-100 hover:bg-blue-200 py-1.5 rounded-md">GCash</button>
            <button @click="submitPayments('PayMaya')" class="bg-purple-100 hover:bg-purple-200 py-1.5 rounded-md">PayMaya</button>
            <button @click="submitPayments('PayPal')" class="bg-yellow-100 hover:bg-yellow-200 py-1.5 rounded-md">PayPal</button>
          </div>
          <button @click="showPaymentMethodModal = false" class="w-full text-center text-red-500 hover:underline text-xs">Cancel</button>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-[300px] p-5 rounded-lg shadow-xl space-y-4 animate-fade-in text-center">
          <h3 class="text-lg font-bold text-green-600">Payment Submitted!</h3>
          <p class="text-sm text-gray-700">
            {{ selectedInvoices.length }} invoice(s) have been submitted and are awaiting admin approval.
          </p>
          <button
            @click="showSuccessModal = false"
            class="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm"
          >
            Okay
          </button>
        </div>
      </div>
    </transition>
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
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "ProcessPaymentPage",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
  },
  data() {
    return {
      invoices: [],
      selectedInvoices: [],
      loading: true,
      userEmail: null,
      showPaymentMethodModal: false,
      showSuccessModal: false,
    };
  },
  computed: {
    sortedInvoices() {
      return [...this.invoices].sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
    },
  },
  methods: {
    calculateInvoiceAmount(invoice) {
      const services = invoice.services || [];
      return services.reduce((sum, s) => sum + (s.amount || 0), 0);
    },
    async fetchUnpaidInvoices() {
      if (!this.userEmail) return;
      try {
        const q = query(
          collection(db, "invoices"),
          where("email", "==", this.userEmail),
          where("status", "==", "not paid")
        );
        const snapshot = await getDocs(q);
        this.invoices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          services: Array.isArray(doc.data().services) ? doc.data().services : [],
        }));
      } catch (err) {
        console.error("Error fetching invoices:", err);
        alert("Error fetching invoices.");
      } finally {
        this.loading = false;
      }
    },
    async submitPayments(method) {
      this.showPaymentMethodModal = false;
      if (this.selectedInvoices.length === 0) return;
      try {
        const submittedAt = serverTimestamp();
        for (const invoice of this.selectedInvoices) {
          await addDoc(collection(db, "payments"), {
            invoiceID: invoice.id,
            method,
            status: "Pending",
            submittedAt,
            email: this.userEmail,
          });
          await updateDoc(doc(db, "invoices", invoice.id), {
            status: "Pending",
            paymentMethod: method,
            submittedAt,
          });
        }
        this.selectedInvoices = [];
        await this.fetchUnpaidInvoices();
        this.showSuccessModal = true;
      } catch (err) {
        console.error("Error submitting payments:", err);
        alert("Error processing payments.");
      }
    },
    getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchUnpaidInvoices();
        } else {
          console.error("User not authenticated");
          this.loading = false;
        }
      });
    },
  },
  mounted() {
    this.getCurrentUser();
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
