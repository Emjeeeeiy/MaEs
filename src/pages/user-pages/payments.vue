<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
    <!-- Topbar -->
    <div class="flex-shrink-0">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Desktop Sidebar -->
      <Sidebar class="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden sm:block" />

      <!-- Mobile Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @closeSidebar="isMobileSidebarOpen = false"
      />


      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <transition name="fade" mode="out-in">
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[300px]">
            <LoadingAnimation />
          </div>

          <div v-else key="content" class="space-y-6 animate-fade-in">
            <div class="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
              <h3 class="font-medium text-sm text-gray-700 mb-2">Select Unpaid Invoices:</h3>

              <!-- Invoice Table -->
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
                      <td class="px-4 py-2 text-left">
                        <input
                          type="checkbox"
                          :value="invoice"
                          v-model="selectedInvoices"
                          class="form-checkbox text-blue-600"
                        />
                      </td>
                      <td class="px-4 py-2 text-left">
                        {{ invoice.services?.map(s => s.serviceName).join(', ') || 'N/A' }}
                      </td>
                      <td class="px-4 py-2 text-left text-green-600 font-medium">
                        ₱{{ calculateInvoiceAmount(invoice).toFixed(2) }}
                      </td>
                    </tr>
                    <tr v-if="sortedInvoices.length === 0">
                      <td colspan="3" class="text-center text-gray-500 py-4">No unpaid invoices found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Cards -->
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
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>
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

              <!-- Submit -->
              <div class="flex justify-center mt-4">
                <button
                  @click="handleSubmitClick"
                  class="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
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
      <div v-if="showPaymentMethodModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-80 p-5 rounded-lg shadow-xl space-y-5 animate-fade-in">
          <h3 class="text-base font-bold text-gray-800 text-left">Select Payment Method</h3>
          <div class="grid grid-cols-2 gap-2 text-sm font-medium">
            <button @click="submitPayments('Cash')" class="bg-gray-100 hover:bg-gray-200 py-1.5 rounded-md">Cash</button>
            <button @click="submitPayments('GCash')" class="bg-blue-100 hover:bg-blue-200 py-1.5 rounded-md">GCash</button>
          </div>
          <div class="flex justify-end">
            <button @click="showPaymentMethodModal = false" class="text-red-500 hover:underline text-xs">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- GCash Modal -->
    <transition name="fade">
      <div v-if="showGCashModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-[400px] p-6 rounded-lg shadow-xl space-y-5 animate-fade-in text-gray-700">
          <div class="flex justify-center">
            <img src="/gcash_logo.jpg" alt="GCash Logo" class="w-16 h-16 rounded-full shadow border" />
          </div>
          <h3 class="text-lg font-bold text-blue-600 text-center">Pay with GCash</h3>

          <div class="text-sm space-y-2 text-left">
            <p><strong>Step 1:</strong> Scan the QR code below using your GCash app.</p>
            <p><strong>Step 2:</strong> Pay the total amount for your selected invoice(s).</p>
            <p><strong>Step 3:</strong> Upload your GCash receipt & enter reference number.</p>
          </div>

          <img src="/gcash-qr2.jpeg" alt="GCash QR" class="w-40 mx-auto rounded border shadow" />

          <div class="text-sm mt-4 space-y-3">
            <label class="block text-left">
              <span class="font-semibold">GCash Reference Number</span>
              <input v-model="gcashReferenceNumber" type="text" class="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label class="block text-left">
              <span class="font-semibold">Upload Receipt</span>
              <input type="file" accept="image/*" @change="onFileChange" class="w-full mt-1 border border-dashed border-gray-400 rounded px-3 py-2 text-sm" />
            </label>
          </div>

          <div class="flex justify-end items-center pt-4 space-x-3 text-sm">
            <button @click="showGCashModal = false" class="text-red-500 hover:underline">Cancel</button>
            <button @click="handleGCashSubmit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded">Submit</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reminder Modal -->
    <transition name="fade">
      <div v-if="showReminderModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-[320px] p-5 rounded-lg shadow-xl space-y-4 animate-fade-in text-left">
          <h3 class="text-lg font-bold text-yellow-600">No Service Selected</h3>
          <p class="text-sm text-gray-700">Please select at least one invoice before submitting.</p>
          <div class="flex justify-end">
            <button @click="showReminderModal = false" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-md text-sm">Okay</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-[320px] p-5 rounded-lg shadow-xl space-y-4 animate-fade-in text-left">
          <h3 class="text-lg font-bold text-green-600">Payment Submitted!</h3>
          <p class="text-sm text-gray-700">
            {{ selectedInvoices.length }} invoice(s) have been submitted and are awaiting admin approval.
          </p>
          <div class="flex justify-end">
            <button @click="showSuccessModal = false" class="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm">Okay</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Error Modal -->
    <transition name="fade">
      <div v-if="showErrorModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white w-[320px] p-5 rounded-lg shadow-xl space-y-4 animate-fade-in text-left">
          <h3 class="text-lg font-bold text-red-600">Error</h3>
          <p class="text-sm text-gray-700">{{ errorMessage }}</p>
          <div class="flex justify-end">
            <button @click="showErrorModal = false" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm">Okay</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/Topbar.vue";
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
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
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
      showPaymentMethodModal: false,
      showSuccessModal: false,
      showReminderModal: false,
      showErrorModal: false,
      errorMessage: "",
      showGCashModal: false,
      gcashReferenceNumber: "",
      gcashReceiptFile: null,
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
      return (invoice.services || []).reduce((sum, s) => sum + (s.amount || 0), 0);
    },

    onFileChange(event) {
      this.gcashReceiptFile = event.target.files[0] || null;
    },

    async uploadFileToStorage(file) {
      try {
        // ✅ Use correct bucket path — Firebase automatically resolves .appspot.com
        const storagePath = `gcash-receipts/${Date.now()}-${file.name}`;
        const fileRef = storageRef(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { downloadURL, storagePath };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload receipt. Please try again later.");
      }
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
        this.invoices = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          services: Array.isArray(doc.data().services) ? doc.data().services : [],
        }));
      } catch (err) {
        this.showError("Error fetching invoices.");
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async submitPayments(method) {
      this.showPaymentMethodModal = false;
      if (method === "GCash") {
        this.showGCashModal = true;
        return;
      }

      if (this.selectedInvoices.length === 0) {
        this.showReminderModal = true;
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
            referenceNumber: null,
            receiptURL: null,
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
        this.showError("Error processing payments.");
        console.error(err);
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
        this.showError("Submission failed. Please check your internet connection or try again later.");
      }
    },

    handleSubmitClick() {
      if (this.selectedInvoices.length === 0) {
        this.showReminderModal = true;
      } else {
        this.showPaymentMethodModal = true;
      }
    },

    getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchUnpaidInvoices();
        } else {
          this.loading = false;
          this.showError("User not authenticated.");
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
