<template>
  <div class="billing-wrapper">
    <div class="billing-card">
      <h2 class="title">Billing System</h2>

      <div v-if="loading" class="loading-text">Loading services...</div>

      <div v-else>
        <label class="services-label">Select Services:</label>
        <div class="services-list">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-item"
          >
            <input
              type="checkbox"
              :value="service"
              v-model="selectedServices"
              class="service-checkbox"
            />
            <span class="service-text">
              {{ service.serviceName }} - ₱{{ service.cost }}
            </span>
          </div>
        </div>

        <h3 class="total-cost">Total: ₱{{ totalCost }}</h3>

        <button @click="generateInvoice" class="generate-button">
          Generate Invoice
        </button>
        <hr />
        <router-link to="/dashboard" class="nav-button">
          <i class="fas fa-tachometer-alt"></i> Back
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

export default {
  name: "BillingPage",
  data() {
    return {
      services: [],
      selectedServices: [],
      loading: true,
      userEmail: null, // Store user email
    };
  },
  computed: {
    totalCost() {
      return this.selectedServices.reduce(
        (sum, service) => sum + (service.cost || 0),
        0
      );
    },
  },
  methods: {
    async fetchServices() {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        this.services = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.loading = false;
      } catch (error) {
        console.error("Error fetching services:", error);
        this.loading = false;
      }
    },

    async generateInvoice() {
      if (this.selectedServices.length === 0) {
        alert("Please select at least one service.");
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to generate an invoice.");
        return;
      }

      const invoiceData = {
        email: user.email, // Store the user's email in the invoice
        services: this.selectedServices.map((service) => ({
          serviceName: service.serviceName,
          cost: service.cost,
        })),
        totalAmount: this.totalCost,
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "invoices"), invoiceData);
        alert(`Invoice generated successfully for ${user.email}!`);
        this.selectedServices = []; // Clear selection after generation
      } catch (error) {
        console.error("Error generating invoice:", error);
      }
    },
  },
  mounted() {
    this.fetchServices();

    // Get logged-in user email
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.userEmail = user.email;
    }
  },
};
</script>

<style scoped>
/* Overall Wrapper with Gradient Background (like your dashboard) */
.billing-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #333;
}

/* Centered White Card */
.billing-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* Title */
.title {
  font-size: 28px;
  color: #388e3c;
  margin-bottom: 20px;
}

/* Loading Text */
.loading-text {
  font-size: 16px;
  color: #555;
}

/* Services */
.services-label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
}

.services-list {
  margin-bottom: 20px;
  text-align: left;
}

.service-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.service-checkbox {
  margin-right: 8px;
}

.service-text {
  font-size: 16px;
  color: #333;
}

/* Total Cost */
.total-cost {
  margin: 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #388e3c;
}

/* Generate Button */
.generate-button {
  background: #2e7d32;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.3s ease;
  margin-bottom: 20px;
}

.generate-button:hover {
  background: #1b5e20;
}

/* Nav Button (Back to Dashboard) */
.nav-button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #388e3c;
  border: 2px solid #388e3c;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-button:hover {
  background-color: #388e3c;
  color: #fff;
}
</style>
