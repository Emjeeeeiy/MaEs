<template>
  <div class="flex flex-col h-screen bg-gray-100 text-gray-800">
    <!-- Topbar -->
    <div class="flex-shrink-0">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Mobile Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @closeSidebar="isMobileSidebarOpen = false"
      />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto px-3 sm:px-4 pt-4 pb-24">
        <transition name="fade" mode="out-in">
          <!-- Loading -->
          <div
            v-if="loading"
            key="loading"
            class="flex justify-center items-center min-h-[200px]"
          >
            <LoadingAnimation />
          </div>

          <!-- Invoice Section -->
          <section v-else key="content" class="space-y-4 animate-fade-in">
            <!-- SEARCH SECTION -->
            <section class="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <button
                  @click="searchOpen = !searchOpen"
                  class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition sm:hidden"
                >
                  <Search class="w-4 h-4 text-gray-600" />
                </button>

                <!-- Mobile Slide Search -->
                <transition name="slide-search">
                  <input
                    v-if="searchOpen"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search invoice..."
                    class="w-full ml-2 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 sm:hidden"
                  />
                </transition>

                <!-- Desktop Search -->
                <input
                  v-if="!searchOpen"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by service or date (YYYY-MM-DD)"
                  class="hidden sm:flex w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
            </section>

            <!-- INVOICE LIST SECTION -->
            <section class="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Select Unpaid Invoices:</h3>

              <div v-if="filteredInvoices.length === 0" class="text-center text-gray-500 text-sm py-4">
                No unpaid invoices found.
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="invoice in filteredInvoices"
                  :key="invoice.id"
                  class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
                >
                  <!-- Checkbox -->
                  <div class="flex items-center w-full sm:w-1/12">
                    <input
                      type="checkbox"
                      :value="invoice"
                      v-model="selectedInvoices"
                      class="form-checkbox text-blue-600 h-4 w-4"
                    />
                  </div>

                  <!-- Services -->
                  <div class="flex-1 text-gray-700">
                    <p class="flex items-center gap-1 text-[11px] font-medium mb-1">
                      <List class="w-3 h-3" /> Services
                    </p>
                    <ul class="list-disc list-inside text-[11px] space-y-0.5">
                      <li v-for="service in invoice.services" :key="service.serviceName">
                        {{ service.serviceName }}
                      </li>
                    </ul>
                    <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar class="w-3 h-3" /> {{ formatDate(invoice.createdAt) }}
                    </p>
                  </div>

                  <!-- Amount -->
                  <div class="flex items-center justify-end w-full sm:w-4/12 text-green-600 font-medium gap-1">
                    <Receipt class="w-3 h-3" /> ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="mt-3 flex justify-start">
                <button
                  @click="handleSubmitClick"
                  :disabled="processingPayment"
                  class="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded shadow hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg v-if="processingPayment" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Submit Payment
                </button>
              </div>
            </section>
          </section>
        </transition>
      </main>
    </div>

    <!-- Payment Method Modal -->
    <transition name="fade">
      <div
        v-if="showPaymentMethodModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white w-72 p-4 rounded-lg shadow-xl space-y-4 animate-fade-in">
          <h3 class="text-sm font-bold text-gray-800 text-left">
            Select Payment Method
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              @click="submitPayments('Cash')"
              class="bg-gray-100 hover:bg-gray-200 py-1 rounded-md"
            >
              Cash
            </button>
            <button
              @click="submitPayments('GCash')"
              class="bg-blue-100 hover:bg-blue-200 py-1 rounded-md"
            >
              GCash
            </button>
          </div>
          <div class="flex justify-end">
            <button
              @click="showPaymentMethodModal = false"
              class="text-red-500 hover:underline text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- GCash Modal -->
    <transition name="fade">
      <div
        v-if="showGCashModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white w-80 p-4 rounded-lg shadow-xl space-y-4 animate-fade-in border-2 border-blue-500">
          <h3 class="text-sm font-bold text-gray-800">GCash Payment</h3>
          <div class="flex items-center space-x-3">
            <img src="/gcash_logo.jpg" class="w-12 h-12 rounded-full" />
            <p class="text-xs text-gray-600">Scan QR or enter reference number</p>
          </div>

          <img src="/gcash-qr2.jpeg" class="w-48 mx-auto my-2" />

          <input
            type="text"
            v-model="gcashReferenceNumber"
            placeholder="Enter GCash Reference Number"
            class="w-full border px-3 py-1.5 rounded text-sm"
          />

          <input type="file" @change="convertToBase64" class="w-full text-sm" />

          <div class="flex justify-between mt-3">
            <button @click="showGCashModal = false" class="text-red-500 hover:underline text-xs">
              Cancel
            </button>
            <button
              @click="handleGCashSubmit"
              :disabled="processingPayment"
              class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm shadow flex items-center gap-2"
            >
              <svg v-if="processingPayment" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Submit
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Success Toast (White) -->
    <transition name="fade">
      <div
        v-if="showSuccessToast"
        class="fixed top-4 right-4 bg-white text-gray-800 px-4 py-2 rounded shadow flex items-center gap-2 border border-gray-300 z-50"
      >
        <Check class="w-4 h-4 text-green-500" /> {{ successMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { Search, List, Calendar, Receipt, Check } from "lucide-vue-next";

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
  components: { Sidebar, Topbar, LoadingAnimation, Search, List, Calendar, Receipt, Check },
  data() {
    return {
      isMobileSidebarOpen: false,
      invoices: [],
      selectedInvoices: [],
      loading: true,
      processingPayment: false,
      userEmail: null,
      searchQuery: "",
      searchOpen: false,
      showPaymentMethodModal: false,
      showGCashModal: false,
      gcashReferenceNumber: "",
      gcashReceiptBase64: null,
      showSuccessToast: false,
      successMessage: "",
      showReminderModal: false,
      showErrorModal: false,
      errorMessage: "",
    };
  },
  computed: {
    sortedInvoices() {
      return [...this.invoices].sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
    },
    filteredInvoices() {
      if (!this.searchQuery) return this.sortedInvoices;
      const queryLower = this.searchQuery.toLowerCase();
      return this.sortedInvoices.filter((invoice) => {
        const serviceMatch = invoice.services.some((s) =>
          s.serviceName.toLowerCase().includes(queryLower)
        );
        const dateMatch = invoice.createdAt
          ? this.formatDate(invoice.createdAt).includes(queryLower)
          : false;
        return serviceMatch || dateMatch;
      });
    },
  },
  methods: {
    calculateInvoiceAmount(invoice) {
      return (invoice.services || []).reduce((sum, s) => sum + (s.amount || 0), 0);
    },
    formatDate(timestamp) {
      if (!timestamp) return "N/A";
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return date.toISOString().split("T")[0];
    },
    convertToBase64(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.gcashReceiptBase64 = reader.result;
      };
      reader.readAsDataURL(file);
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
      } finally {
        this.loading = false;
      }
    },
    handleSubmitClick() {
      if (this.selectedInvoices.length === 0) this.showReminderModal = true;
      else this.showPaymentMethodModal = true;
    },
    async submitPayments(method) {
      this.showPaymentMethodModal = false;
      if (method === "GCash") {
        this.showGCashModal = true;
        return;
      }

      this.processingPayment = true;

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

        // Show toast
        this.successMessage = `Payment submitted successfully (${method})`;
        this.showSuccessToast = true;
        setTimeout(() => (this.showSuccessToast = false), 3000);
      } catch (err) {
        console.error(err);
        this.showError("Error processing payments.");
      } finally {
        this.processingPayment = false;
      }
    },
    async handleGCashSubmit() {
      if (!this.gcashReferenceNumber || !this.gcashReceiptBase64) {
        this.showError("Please enter a reference number and upload your receipt.");
        return;
      }

      this.processingPayment = true;

      try {
        const submittedAt = serverTimestamp();
        for (const invoice of this.selectedInvoices) {
          await addDoc(collection(db, "payments"), {
            invoiceID: invoice.id,
            method: "GCash",
            status: "Pending",
            submittedAt,
            email: this.userEmail,
            referenceNumber: this.gcashReferenceNumber,
            receiptBase64: this.gcashReceiptBase64,
          });
          await updateDoc(doc(db, "invoices", invoice.id), {
            status: "Pending",
            paymentMethod: "GCash",
            submittedAt,
            referenceNumber: this.gcashReferenceNumber,
            receiptBase64: this.gcashReceiptBase64,
          });
        }
        this.gcashReferenceNumber = "";
        this.gcashReceiptBase64 = null;
        this.selectedInvoices = [];
        this.showGCashModal = false;
        await this.fetchUnpaidInvoices();

        this.successMessage = `GCash payment submitted successfully`;
        this.showSuccessToast = true;
        setTimeout(() => (this.showSuccessToast = false), 3000);
      } catch (error) {
        console.error(error);
        this.showError("Submission failed. Please try again later.");
      } finally {
        this.processingPayment = false;
      }
    },
    getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchUnpaidInvoices();
        } else {
          this.showError("User not authenticated.");
          this.loading = false;
        }
      });
    },
    showError(message) {
      this.errorMessage = message;
      this.showErrorModal = true;
    },
  },
  mounted() {
    this.getCurrentUser();
  },
};
</script>

<style scoped>
/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide Search Animation */
.slide-search-enter-active,
.slide-search-leave-active {
  transition: all 0.3s ease;
}
.slide-search-enter-from,
.slide-search-leave-to {
  max-width: 0;
  opacity: 0;
  padding: 0;
}
.slide-search-enter-to,
.slide-search-leave-from {
  max-width: 100%;
  opacity: 1;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>
