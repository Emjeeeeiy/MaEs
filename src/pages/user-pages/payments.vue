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

          <!-- Invoice List -->
          <div v-else key="content" class="space-y-2 animate-fade-in">
            <!-- Search Bar (Mobile) -->
            <div class="sm:hidden flex justify-start mb-2">
              <button
                @click="showMobileSearch = !showMobileSearch"
                class="p-2 rounded-md hover:bg-gray-200 transition"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />
                </svg>
              </button>
            </div>

            <!-- Mobile Search Input -->
            <transition name="slide-down">
              <div v-if="showMobileSearch" class="sm:hidden mb-2">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search..."
                  class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
            </transition>

            <!-- Desktop Search Input -->
            <div class="hidden sm:flex mb-2">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by service or date (YYYY-MM-DD)"
                class="w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <h3 class="text-sm font-medium text-gray-700 mb-2">
              Select Unpaid Invoices:
            </h3>

            <!-- Invoice Rows -->
            <div
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              class="flex items-center justify-between py-2 border-b border-gray-300 text-sm"
            >
              <!-- Checkbox -->
              <div class="w-1/12 flex items-center">
                <input
                  type="checkbox"
                  :value="invoice"
                  v-model="selectedInvoices"
                  class="form-checkbox text-blue-600 h-4 w-4"
                />
              </div>

              <!-- Services -->
              <div class="w-7/12 text-left text-gray-700">
                <ul class="list-disc list-inside space-y-0.5">
                  <li v-for="service in invoice.services" :key="service.serviceName">
                    {{ service.serviceName }}
                  </li>
                </ul>
                <p class="text-xs text-gray-400 mt-0.5">
                  Date: {{ formatDate(invoice.createdAt) }}
                </p>
              </div>

              <!-- Amount -->
              <div class="w-4/12 text-right text-green-600 font-medium">
                ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
              </div>
            </div>

            <!-- No Invoices -->
            <p
              v-if="filteredInvoices.length === 0"
              class="text-gray-500 text-sm text-left py-4"
            >
              No unpaid invoices found.
            </p>

            <!-- Submit Button -->
            <div class="mt-3 flex justify-start">
              <button
                @click="handleSubmitClick"
                class="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded shadow hover:bg-blue-700 transition"
              >
                Submit Payment
              </button>
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
            <img src="/gcash_logo.jpg" alt="GCash Logo" class="w-12 h-12 rounded-full object-cover" />
            <p class="text-xs text-gray-600">Scan QR or enter reference number</p>
          </div>
          <img src="/gcash-qr2.jpeg" alt="GCash QR" class="w-48 mx-auto my-2 object-contain" />
          <input
            type="text"
            v-model="gcashReferenceNumber"
            placeholder="Enter GCash Reference Number"
            class="w-full border px-3 py-1.5 rounded text-sm"
          />
          <input
            type="file"
            @change="onFileChange"
            class="w-full text-sm"
          />
          <div class="flex justify-between mt-3">
            <button @click="showGCashModal = false" class="text-red-500 hover:underline text-xs">
              Cancel
            </button>
            <button @click="handleGCashSubmit" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm shadow">
              Submit
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { db, storage } from "@/firebase";
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
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "ProcessPaymentPage",
  components: { Sidebar, Topbar, LoadingAnimation },
  data() {
    return {
      isMobileSidebarOpen: false,
      invoices: [],
      selectedInvoices: [],
      loading: true,
      userEmail: null,
      searchQuery: "",
      showPaymentMethodModal: false,
      showGCashModal: false,
      gcashReferenceNumber: "",
      gcashReceiptFile: null,
      showMobileSearch: false,
      showSuccessModal: false,
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
    onFileChange(event) {
      this.gcashReceiptFile = event.target.files[0] || null;
    },
    async uploadFileToStorage(file) {
      const storagePath = `gcash-receipts/${Date.now()}-${file.name}`;
      const fileRef = storageRef(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { downloadURL, storagePath };
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
      if (this.selectedInvoices.length === 0) {
        this.showReminderModal = true;
      } else {
        this.showPaymentMethodModal = true;
      }
    },
    async submitPayments(method) {
      this.showPaymentMethodModal = false;
      if (method === "GCash") {
        this.showGCashModal = true;
        return;
      }

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
        console.error(err);
        this.showError("Error processing payments.");
      }
    },
    async handleGCashSubmit() {
      if (!this.gcashReferenceNumber || !this.gcashReceiptFile) {
        this.showError("Please enter a reference number and upload your receipt.");
        return;
      }

      try {
        const submittedAt = serverTimestamp();
        const { downloadURL: receiptURL, storagePath } = await this.uploadFileToStorage(this.gcashReceiptFile);

        for (const invoice of this.selectedInvoices) {
          await addDoc(collection(db, "payments"), {
            invoiceID: invoice.id,
            method: "GCash",
            status: "Pending",
            submittedAt,
            email: this.userEmail,
            referenceNumber: this.gcashReferenceNumber,
            receiptURL,
          });
          await updateDoc(doc(db, "invoices", invoice.id), {
            status: "Pending",
            paymentMethod: "GCash",
            submittedAt,
            referenceNumber: this.gcashReferenceNumber,
            receiptImage: storagePath,
          });
        }

        this.gcashReferenceNumber = "";
        this.gcashReceiptFile = null;
        this.selectedInvoices = [];
        this.showGCashModal = false;
        await this.fetchUnpaidInvoices();
        this.showSuccessModal = true;
      } catch (error) {
        console.error(error);
        this.showError("Submission failed. Please try again later.");
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

/* Mobile Search Slide Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 100px;
  opacity: 1;
  padding: 0.5rem 0;
}

@media (max-width: 640px) {
  main {
    padding-bottom: 6rem;
  }
  button {
    font-size: 14px;
    padding: 0.35rem 0.75rem;
  }
  input.form-checkbox {
    width: 16px;
    height: 16px;
  }
  .text-sm {
    font-size: 13px;
  }
}
</style>
