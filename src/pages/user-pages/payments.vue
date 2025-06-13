<template>
  <div class="flex bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen text-gray-800">
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
              <BanknotesIcon class="w-6 h-6 text-green-600" />
              <h2 class="text-2xl font-semibold">Process Payment</h2>
            </div>

            <div class="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
              <!-- Invoice Select -->
              <div>
                <label class="block font-medium text-sm text-gray-700 mb-1">Select an Unpaid Invoice:</label>
                <select
                  v-model="selectedInvoice"
                  class="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="invoice in invoices" :key="invoice.id" :value="invoice">
                    Invoice #{{ invoice.id }} - ₱{{ invoice.totalAmount.toLocaleString() }}
                  </option>
                </select>
              </div>

              <!-- Cash Input -->
              <div>
                <label class="block font-medium text-sm text-gray-700 mb-1">Enter Cash Payment:</label>
                <input
                  v-model.number="cashPaid"
                  type="number"
                  placeholder="Enter cash amount"
                  class="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Summary -->
              <div v-if="selectedInvoice" class="space-y-1 text-sm text-gray-800">
                <p><span class="font-semibold">Total Amount:</span> ₱{{ selectedInvoice.totalAmount.toLocaleString() }}</p>
                <p><span class="font-semibold">Change:</span> ₱{{ changeDue.toLocaleString() }}</p>
              </div>

              <!-- Submit Button -->
              <div class="text-right">
                <button
                  @click="showPaymentMethodModal = true"
                  :disabled="!selectedInvoice || cashPaid < selectedInvoice.totalAmount"
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
        <div class="bg-white/90 w-80 p-4 rounded-lg shadow-xl space-y-4 animate-fade-in">
          <h3 class="text-base font-bold text-center">Select Payment Method</h3>
          <div class="grid grid-cols-2 gap-2 text-sm font-medium">
            <button @click="submitPayment('Cash')" class="bg-gray-100 hover:bg-gray-200 py-1.5 rounded-md">Cash</button>
            <button @click="submitPayment('GCash')" class="bg-blue-100 hover:bg-blue-200 py-1.5 rounded-md">GCash</button>
            <button @click="submitPayment('PayMaya')" class="bg-purple-100 hover:bg-purple-200 py-1.5 rounded-md">PayMaya</button>
            <button @click="submitPayment('PayPal')" class="bg-yellow-100 hover:bg-yellow-200 py-1.5 rounded-md">PayPal</button>
          </div>
          <button @click="showPaymentMethodModal = false" class="w-full text-center text-red-500 hover:underline text-xs">
            Cancel
          </button>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <transition name="fade">
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white/90 w-[300px] p-5 rounded-lg shadow-xl space-y-4 animate-fade-in text-center">
          <h3 class="text-lg font-bold text-green-600">Payment Submitted!</h3>
          <p class="text-sm text-gray-700">Your payment has been submitted and is awaiting admin approval.</p>
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

import { BanknotesIcon } from "@heroicons/vue/24/solid";

export default {
  name: "ProcessPaymentPage",
  components: {
    Sidebar,
    Topbar,
    LoadingAnimation,
    BanknotesIcon,
  },
  data() {
    return {
      invoices: [],
      selectedInvoice: null,
      cashPaid: 0,
      loading: true,
      userEmail: null,
      showPaymentMethodModal: false,
      showSuccessModal: false,
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

      if (!this.selectedInvoice) return;

      const paymentData = {
        invoiceID: this.selectedInvoice.id,
        amountPaid: this.selectedInvoice.totalAmount,
        method,
        status: "Pending",
        createdAt: serverTimestamp(),
        email: this.userEmail,
      };

      try {
        await addDoc(collection(db, "payments"), paymentData);

        const invoiceRef = doc(db, "invoices", this.selectedInvoice.id);
        await updateDoc(invoiceRef, {
          status: "Pending",
          paymentMethod: method,
        });

        this.selectedInvoice = null;
        this.cashPaid = 0;
        await this.fetchUnpaidInvoices();

        this.showSuccessModal = true;
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
