<template>
  <div class="payment-wrapper">
    <div class="payment-card">
      <h2 class="title">Process Payment</h2>

      <div v-if="loading" class="loading-text">Loading unpaid invoices...</div>

      <div v-else>
        <label class="label">Select an Unpaid Invoice:</label>
        <select v-model="selectedInvoice" class="select-input">
          <option v-for="invoice in invoices" :key="invoice.id" :value="invoice">
            Invoice #{{ invoice.id }} - ₱{{ invoice.totalAmount }}
          </option>
        </select>

        <label class="label">Enter Cash Payment:</label>
        <input v-model.number="cashPaid" type="number" class="select-input" placeholder="Enter cash amount" />

        <div v-if="selectedInvoice">
          <p><strong>Total Amount:</strong> ₱{{ selectedInvoice.totalAmount }}</p>
          <p><strong>Change:</strong> ₱{{ changeDue }}</p>
        </div>

        <button @click="processPayment" class="btn primary-btn" :disabled="cashPaid < selectedInvoice?.totalAmount">
          Submit Payment
        </button>

        <hr class="divider" />

        <router-link to="/dashboard" class="btn nav-btn">
          <i class="fas fa-tachometer-alt"></i> Back
        </router-link>
      </div>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication

export default {
  name: "BillingPage",
  data() {
    return {
      invoices: [],
      selectedInvoice: null,
      cashPaid: 0,
      loading: true,
      successMessage: "",
      userEmail: null, // Store logged-in user email
    };
  },
  computed: {
    changeDue() {
      return this.cashPaid && this.selectedInvoice ? Math.max(this.cashPaid - this.selectedInvoice.totalAmount, 0) : 0;
    },
  },
  methods: {
    async fetchUnpaidInvoices() {
      if (!this.userEmail) return;

      try {
        const q = query(collection(db, "invoices"), where("email", "==", this.userEmail), where("status", "==", "Pending"));
        const querySnapshot = await getDocs(q);
        this.invoices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
        email: this.userEmail, // Store the user's email for tracking
      };

      try {
        await addDoc(collection(db, "payments"), paymentData);
        await updateDoc(doc(db, "invoices", this.selectedInvoice.id), { status: "Paid" });

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
    }
  },
  mounted() {
    this.getCurrentUser();
  },
};
</script>

<style scoped>
/* Overall Wrapper with Gradient Background */
.payment-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  font-family: 'Poppins', sans-serif;
  padding: 20px;
  color: #333;
}

/* Centered Card Container */
.payment-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

/* Title & Loading */
.title {
  font-size: 28px;
  color: #388e3c;
  margin-bottom: 20px;
}
.loading-text {
  font-size: 16px;
  color: #555;
}

/* Labels & Inputs */
.label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
  text-align: left;
}
.select-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #f9fbe7;
  font-size: 15px;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: background 0.3s ease;
  display: inline-block;
  margin-bottom: 20px;
}
.primary-btn {
  background: #2e7d32;
  color: #fff;
}
.primary-btn:hover {
  background: #1b5e20;
}
.nav-btn {
  background: transparent;
  color: #388e3c;
  border: 2px solid #388e3c;
  text-decoration: none;
  transition: background 0.3s ease, color 0.3s ease;
}
.nav-btn:hover {
  background: #388e3c;
  color: #fff;
}

/* Divider */
.divider {
  margin: 20px 0;
  border-top: 1px solid #ddd;
}

/* Success Message */
.success-message {
  font-size: 16px;
  color: green;
  margin-top: 10px;
}
</style>
