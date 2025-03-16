<template>
  <div class="admin-invoices">
    <h2>Your Invoices</h2>
    <p>View and manage your invoices</p>

    <!-- Filters & Search -->
    <div class="filters">
      <label>Filter by Status:</label>
      <select v-model="filterStatus">
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
      </select>
      <input v-model="searchQuery" placeholder="Search Invoice ID" />
      <router-link to="/dashboard" class="btn nav-btn">
        <i class="fas fa-tachometer-alt"></i> Back
      </router-link>
    </div>

    <!-- Invoices Grid -->
    <div v-if="loading" class="loading">Loading invoices...</div>

    <div v-else-if="filteredInvoices.length === 0" class="no-invoices">
      No invoices found for your account.
    </div>

    <div v-else class="invoice-container">
      <div v-for="invoice in filteredInvoices" 
           :key="invoice.id" 
           class="invoice-card" 
           @click="openInvoice(invoice.id)">
        <h3>Invoice #{{ invoice.id }}</h3>
        <p><strong>Services:</strong> {{ invoice.services.map(s => s.serviceName).join(', ') }}</p>
        <p><strong>Total:</strong> ₱{{ invoice.totalAmount }}</p>
        <span :class="invoice.status.toLowerCase()">
          {{ invoice.status }}
        </span>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div v-if="selectedInvoice" class="modal-overlay" @click="closeInvoice">
      <div class="modal-content" @click.stop>
        <h2>Invoice #{{ selectedInvoice.id }}</h2>
        <p><strong>Date:</strong> {{ formattedDate(selectedInvoice.createdAt) }}</p>
        <p><strong>Services:</strong></p>
        <ul>
          <li v-for="service in selectedInvoice.services" :key="service.id">
            {{ service.serviceName }} - ₱{{ service.price }}
          </li>
        </ul>
        <p><strong>Total Amount:</strong> ₱{{ selectedInvoice.totalAmount }}</p>
        <p :class="selectedInvoice.status.toLowerCase()"><strong>Status:</strong> {{ selectedInvoice.status }}</p>
        <button class="close-btn" @click="closeInvoice">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "UserInvoices",
  data() {
    return {
      invoices: [],
      userEmail: null,
      filterStatus: "",
      searchQuery: "",
      loading: true,
      selectedInvoice: null,
    };
  },
  computed: {
    filteredInvoices() {
      return this.invoices.filter(invoice => 
        (!this.filterStatus || invoice.status === this.filterStatus) &&
        (!this.searchQuery || invoice.id.includes(this.searchQuery))
      );
    }
  },
  async mounted() {
    await this.getCurrentUser();
  },
  methods: {
    async getCurrentUser() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          await this.fetchInvoices();
        } else {
          console.error("User not authenticated");
          this.loading = false;
        }
      });
    },
    async fetchInvoices() {
      if (!this.userEmail) return;

      try {
        const q = query(collection(db, "invoices"), where("email", "==", this.userEmail));
        const querySnapshot = await getDocs(q);
        this.invoices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        this.loading = false;
      }
    },
    async openInvoice(invoiceId) {
      try {
        const invoiceRef = doc(db, "invoices", invoiceId);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
          this.selectedInvoice = { id: invoiceId, ...invoiceSnap.data() };
        } else {
          console.error("Invoice not found!");
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      }
    },
    closeInvoice() {
      this.selectedInvoice = null;
    },
    formattedDate(timestamp) {
      if (!timestamp || !timestamp.toDate) return "N/A";
      const date = timestamp.toDate();
      return date.toISOString().split('T')[0];
    }
  }
};
</script>

<style scoped>
.admin-invoices {
  background: linear-gradient(135deg, #a8db8f, #388e3c);
  color: #1b5e20;
  min-height: 100vh;
  padding: 30px;
  text-align: center;
}

h2 {
  color: #255d00;
  font-size: 28px;
  margin-bottom: 10px;
}

p {
  color: #2e7d32;
  font-size: 14px;
}

/* Filters & Search */
.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

select, input {
  background: #f1f8e9;
  color: #1b5e20;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #66bb6a;
  font-size: 14px;
  width: 220px;
  outline: none;
  transition: all 0.3s ease;
}

input:focus, select:focus {
  border-color: #2e7d32;
}


/* Invoice Grid */
.invoice-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Invoice Cards */
.invoice-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out;
}

.invoice-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.invoice-card h3 {
  color: #255d00;
  font-size: 18px;
  margin-bottom: 8px;
}

/* Status Badges */
.paid {
  background: #66bb6a;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  display: inline-block;
}

.pending {
  background: #f57c00;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  display: inline-block;
}

/* Loading & No Invoices */
.loading, .no-invoices {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-top: 20px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  text-align: left;
}

.close-btn {
  display: block;
  margin: 15px auto 0;
  padding: 8px 16px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-btn:hover {
  background: #b71c1c;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: center;
  }
  select, input {
    width: 100%;
  }
  .invoice-container {
    grid-template-columns: 1fr;
  }
}

/* Back Button Styling */
.nav-btn {
  display: inline-block;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: bold;
  color: #1b5e20;
  border: 2px solid #1b5e20;
  border-radius: 8px;
  text-decoration: none;
  background: transparent;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #1b5e20;
  color: white;
}
</style>
