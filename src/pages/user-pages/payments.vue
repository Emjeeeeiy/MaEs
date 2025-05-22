<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <Topbar />

      <!-- Payment Content -->
      <main class="p-6">
        <div class="bg-white rounded-xl shadow-md px-8 py-2 max-w-4xl mx-auto border border-black">
          <h2 class="text-xl font-semibold text-green-700 mb-3">Process Payment</h2>

          <div v-if="loading" class="flex justify-center py-8">
            <LoadingAnimation />
          </div>

          <div v-else>
            <label class="block text-gray-700 text-sm font-medium mb-1">Select an Unpaid Invoice:</label>
            <select
              v-model="selectedInvoice"
              class="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 mb-3"
            >
              <option v-for="invoice in invoices" :key="invoice.id" :value="invoice">
                Invoice #{{ invoice.id }} - ₱{{ invoice.totalAmount }}
              </option>
            </select>

            <label class="block text-gray-700 text-sm font-medium mb-1">Enter Cash Payment:</label>
            <input
              v-model.number="cashPaid"
              type="number"
              placeholder="Enter cash amount"
              class="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 mb-3"
            />

            <div v-if="selectedInvoice" class="mb-3 text-gray-700 text-sm">
              <p><strong>Total Amount:</strong> ₱{{ selectedInvoice.totalAmount }}</p>
              <p><strong>Change:</strong> ₱{{ changeDue }}</p>
            </div>

            <button
              @click="showPaymentMethodModal = true"
              :disabled="!selectedInvoice || cashPaid < selectedInvoice.totalAmount"
              class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 mb-3 text-sm"
            >
              Submit Payment
            </button>

            <p v-if="successMessage" class="text-green-600 mt-2 font-medium text-sm">{{ successMessage }}</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Payment Method Modal -->
    <div v-if="showPaymentMethodModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Select Payment Method</h3>

        <div class="flex flex-col gap-3">
          <button
            @click="submitPayment('Cash')"
            class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Cash
          </button>
          <button
            @click="submitPayment('GCash')"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            GCash
          </button>
          <button
            @click="submitPayment('PayMaya')"
            class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            PayMaya
          </button>
          <button
            @click="submitPayment('PayPal')"
            class="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
          >
            PayPal
          </button>
        </div>

        <button
          @click="showPaymentMethodModal = false"
          class="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel
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
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "BillingPage",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
  },
  data() {
    return {
      invoices: [],
      selectedInvoice: null,
      cashPaid: 0,
      loading: true,
      successMessage: "",
      userEmail: null,
      showPaymentMethodModal: false,
    };
  },
  computed: {
    changeDue() {
      return this.cashPaid && this.selectedInvoice
        ? Math.max(this.cashPaid - this.selectedInvoice.totalAmount, 0)
        : 0;
    },
  },
  methods: {
    async fetchUnpaidInvoices() {
      if (!this.userEmail) return;

      try {
        const q = query(
          collection(db, "invoices"),
          where("email", "==", this.userEmail),
          where("status", "==", "not paid")
        );
        const querySnapshot = await getDocs(q);
        this.invoices = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (this.invoices.length === 0) {
          alert("No unpaid invoices available.");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        alert("Error fetching invoices. Check console.");
      } finally {
        this.loading = false;
      }
    },

    async submitPayment(method) {
      this.showPaymentMethodModal = false;

      if (!this.selectedInvoice) {
        alert("Please select an invoice.");
        return;
      }

      const paymentData = {
        invoiceID: this.selectedInvoice.id,
        amountPaid: this.selectedInvoice.totalAmount,
        method,
        status: "Pending", // Payment is pending admin approval
        createdAt: serverTimestamp(),
        email: this.userEmail,
      };

      try {
        // Add the payment record
        await addDoc(collection(db, "payments"), paymentData);

        // Update the invoice with new status and method
        const invoiceRef = doc(db, "invoices", this.selectedInvoice.id);
        await updateDoc(invoiceRef, {
          status: "Pending",
          paymentMethod: method,
        });

        this.successMessage =
          "Payment submitted and awaiting admin approval.";

        this.selectedInvoice = null;
        this.cashPaid = 0;
        await this.fetchUnpaidInvoices();
      } catch (error) {
        console.error("Error submitting payment:", error);
        alert("Error submitting payment.");
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
