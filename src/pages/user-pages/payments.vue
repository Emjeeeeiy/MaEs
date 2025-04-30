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
          <div class="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <h2 class="text-2xl font-semibold text-green-700 mb-6">Process Payment</h2>
  
            <div v-if="loading" class="text-gray-500">Loading unpaid invoices...</div>
  
            <div v-else>
              <label class="block text-gray-700 font-medium mb-2">Select an Unpaid Invoice:</label>
              <select v-model="selectedInvoice" class="w-full border border-gray-300 rounded-md p-2 mb-4">
                <option v-for="invoice in invoices" :key="invoice.id" :value="invoice">
                  Invoice #{{ invoice.id }} - ₱{{ invoice.totalAmount }}
                </option>
              </select>
  
              <label class="block text-gray-700 font-medium mb-2">Enter Cash Payment:</label>
              <input
                v-model.number="cashPaid"
                type="number"
                placeholder="Enter cash amount"
                class="w-full border border-gray-300 rounded-md p-2 mb-4"
              />
  
              <div v-if="selectedInvoice" class="mb-4 text-gray-700">
                <p><strong>Total Amount:</strong> ₱{{ selectedInvoice.totalAmount }}</p>
                <p><strong>Change:</strong> ₱{{ changeDue }}</p>
              </div>
  
              <button
                @click="processPayment"
                :disabled="cashPaid < selectedInvoice?.totalAmount"
                class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 mb-4"
              >
                Submit Payment
              </button>  
              <p v-if="successMessage" class="text-green-600 mt-4 font-medium">{{ successMessage }}</p>
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
  import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    where
  } from "firebase/firestore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  
  export default {
    name: "BillingPage",
    components: {
      Sidebar,
      Topbar,
    },
    data() {
      return {
        invoices: [],
        selectedInvoice: null,
        cashPaid: 0,
        loading: true,
        successMessage: "",
        userEmail: null,
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
            where("status", "==", "Pending")
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
  
      async processPayment() {
        if (!this.selectedInvoice) {
          alert("Please select an invoice.");
          return;
        }
        if (this.cashPaid < this.selectedInvoice.totalAmount) {
          alert("Insufficient cash payment.");
          return;
        }
  
        const paymentData = {
          invoiceID: this.selectedInvoice.id,
          amountPaid: this.selectedInvoice.totalAmount,
          method: "Cash",
          status: "Completed",
          createdAt: serverTimestamp(),
          email: this.userEmail,
        };
  
        try {
          await addDoc(collection(db, "payments"), paymentData);
          await updateDoc(doc(db, "invoices", this.selectedInvoice.id), {
            status: "Paid",
          });
  
          this.successMessage = `Payment successful! Change: ₱${this.changeDue}`;
          this.selectedInvoice = null;
          this.cashPaid = 0;
  
          this.fetchUnpaidInvoices();
        } catch (error) {
          console.error("Error processing payment:", error);
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
  