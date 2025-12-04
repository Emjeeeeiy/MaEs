<template>
  <div class="flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden">
    <!-- Topbar -->
    <div class="flex-shrink-0 z-20 bg-white border-b border-gray-200">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @closeSidebar="isMobileSidebarOpen = false"
      />
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/25 z-20 sm:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- Main -->
      <main class="flex-1 overflow-y-auto p-3 sm:p-4 pb-28">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
          <LoadingAnimation />
        </div>

        <!-- Content -->
        <div v-else class="space-y-3">
          <!-- Search -->
          <section class="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <!-- Mobile toggle -->
            <button
              @click="searchOpen = !searchOpen"
              class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition sm:hidden"
            >
              <Search class="w-4 h-4 text-gray-600" />
            </button>

            <!-- Mobile slide search -->
            <transition name="slide-search">
              <input
                v-if="searchOpen"
                v-model="searchQuery"
                type="text"
                placeholder="Search invoice..."
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg sm:hidden focus:ring-1 focus:ring-blue-500"
              />
            </transition>

            <!-- Desktop search -->
            <input
              v-if="!searchOpen"
              v-model="searchQuery"
              type="text"
              placeholder="Search by service or date (YYYY-MM-DD)"
              class="hidden sm:flex w-full sm:w-64 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            />
          </section>

          <!-- Invoice List -->
          <section class="bg-white p-2 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <h3 class="text-sm font-medium text-gray-700 mb-1">Select Unpaid Invoices:</h3>

            <div v-if="filteredInvoices.length === 0" class="text-center text-gray-500 text-xs py-4">
              No unpaid invoices found.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md"
              >
                <!-- Top Row -->
                <div class="flex items-start justify-between gap-2">
                  <!-- Checkbox -->
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :value="invoice"
                      v-model="selectedInvoices"
                      class="form-checkbox text-blue-600 h-4 w-4"
                    />
                  </div>

                  <!-- Services -->
                  <div class="flex-1 min-w-0 text-gray-700 ml-2">
                    <p class="flex items-center gap-1 text-[10px] font-semibold mb-1">
                      <List class="w-3 h-3" /> Services
                    </p>
                    <ul class="list-disc list-inside text-[10px] space-y-0.5">
                      <li v-for="service in invoice.services" :key="service.serviceName">
                        {{ service.serviceName }}
                      </li>
                    </ul>
                    <p class="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar class="w-3 h-3" /> {{ formatDate(invoice.createdAt) }}
                    </p>
                  </div>

                  <!-- Amount -->
                  <div class="flex items-center justify-end text-green-600 font-semibold gap-1 text-[10px]">
                    <Receipt class="w-3 h-3" /> ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="mt-2 flex justify-start">
              <button
                @click="handleSubmitClick"
                :disabled="processingPayment"
                class="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded shadow hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <svg
                  v-if="processingPayment"
                  class="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Submit Payment
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- Payment Method Modal -->
    <transition name="fade">
      <div
        v-if="showPaymentMethodModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white w-64 p-3 rounded-lg shadow-xl space-y-3 animate-fade-in">
          <h3 class="text-sm font-bold text-gray-800">Select Payment Method</h3>
          <div class="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              @click="submitPayments('Cash')"
              class="bg-gray-100 hover:bg-gray-200 py-1 rounded"
            >
              Cash
            </button>
            <button
              @click="submitPayments('GCash')"
              class="bg-blue-100 hover:bg-blue-200 py-1 rounded"
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
        <div class="bg-white w-72 p-3 rounded-lg shadow-xl space-y-3 animate-fade-in border-2 border-blue-500">
          <h3 class="text-sm font-bold text-gray-800">GCash Payment</h3>
          <div class="flex items-center space-x-2">
            <img src="/gcash_logo.jpg" class="w-10 h-10 rounded-full" />
            <p class="text-[10px] text-gray-600">Scan QR or enter reference number</p>
          </div>
          <img src="/gcash-qr2.jpeg" class="w-40 mx-auto my-1" />
          <input
            type="text"
            v-model="gcashReferenceNumber"
            placeholder="Enter Reference Number"
            class="w-full border px-2 py-1 text-xs rounded"
          />
          <input type="file" @change="convertToBase64" class="w-full text-xs" />

          <div class="flex justify-between mt-2">
            <button
              @click="showGCashModal = false"
              class="text-red-500 hover:underline text-xs"
            >
              Cancel
            </button>
            <button
              @click="handleGCashSubmit"
              :disabled="processingPayment"
              class="bg-blue-600 text-white px-3 py-1 rounded text-xs shadow flex items-center gap-1"
            >
              <svg
                v-if="processingPayment"
                class="animate-spin h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Submit
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Success Toast -->
    <transition name="fade">
      <div
        v-if="showSuccessToast"
        class="fixed top-4 right-4 bg-white text-gray-800 px-3 py-1.5 rounded shadow flex items-center gap-1 border border-gray-300 text-xs z-50"
      >
        <Check class="w-3 h-3 text-green-500" /> {{ successMessage }}
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
      const qLower = this.searchQuery.toLowerCase();
      return this.sortedInvoices.filter((inv) => {
        const serviceMatch = inv.services.some((s) => s.serviceName.toLowerCase().includes(qLower));
        const dateMatch = inv.createdAt ? this.formatDate(inv.createdAt).includes(qLower) : false;
        return serviceMatch || dateMatch;
      });
    },
  },
  methods: {
    calculateInvoiceAmount(inv) {
      return (inv.services || []).reduce((sum, s) => sum + (s.amount || 0), 0);
    },
    formatDate(ts) {
      if (!ts) return "N/A";
      const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
      return d.toISOString().split("T")[0];
    },
    convertToBase64(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { this.gcashReceiptBase64 = reader.result; };
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
        const snap = await getDocs(q);
        this.invoices = snap.docs.map((d) => ({ id: d.id, ...d.data(), services: Array.isArray(d.data().services) ? d.data().services : [] }));
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    handleSubmitClick() {
      if (this.selectedInvoices.length === 0) alert("Select invoices first!");
      else this.showPaymentMethodModal = true;
    },
    async submitPayments(method) {
      this.showPaymentMethodModal = false;
      if (method === "GCash") { this.showGCashModal = true; return; }
      this.processingPayment = true;
      try {
        const submittedAt = serverTimestamp();
        for (const inv of this.selectedInvoices) {
          await addDoc(collection(db, "payments"), {
            invoiceID: inv.id, method, status: "Pending", submittedAt, email: this.userEmail,
          });
          await updateDoc(doc(db, "invoices", inv.id), { status: "Pending", paymentMethod: method, submittedAt });
        }
        this.selectedInvoices = [];
        await this.fetchUnpaidInvoices();
        this.successMessage = `Payment submitted successfully (${method})`;
        this.showSuccessToast = true;
        setTimeout(() => (this.showSuccessToast = false), 3000);
      } catch (err) { console.error(err); alert("Error processing payments"); }
      finally { this.processingPayment = false; }
    },
    async handleGCashSubmit() {
      if (!this.gcashReferenceNumber || !this.gcashReceiptBase64) {
        alert("Enter reference number & upload receipt"); return;
      }
      this.processingPayment = true;
      try {
        const submittedAt = serverTimestamp();
        for (const inv of this.selectedInvoices) {
          await addDoc(collection(db, "payments"), {
            invoiceID: inv.id,
            method: "GCash",
            status: "Pending",
            submittedAt,
            email: this.userEmail,
            referenceNumber: this.gcashReferenceNumber,
            receiptBase64: this.gcashReceiptBase64,
          });
          await updateDoc(doc(db, "invoices", inv.id), {
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
      } catch (err) { console.error(err); alert("GCash submission failed"); }
      finally { this.processingPayment = false; }
    },
    getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) { this.userEmail = user.email; await this.fetchUnpaidInvoices(); }
        else { alert("User not authenticated"); this.loading = false; }
      });
    },
  },
  mounted() { this.getCurrentUser(); },
};
</script>

<style scoped>
/* Fade */
.fade-enter-active, .fade-leave-active { transition: all 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; transform:translateY(6px); }
.animate-fade-in { animation: fadeIn 0.25s ease-in-out; }
@keyframes fadeIn { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }

/* Slide Search */
.slide-search-enter-active, .slide-search-leave-active { transition: all 0.25s ease; }
.slide-search-enter-from, .slide-search-leave-to { max-width:0; opacity:0; padding:0; }
.slide-search-enter-to, .slide-search-leave-from { max-width:100%; opacity:1; padding-left:.5rem; padding-right:.5rem; }
</style>
