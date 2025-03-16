<template>
  <div class="admin-invoices">
    <h2 class="title">Invoices Management</h2>
    <p class="subtitle">Click on a user to view their invoices</p>

    <!-- User Search Bar -->
    <div class="search-container">
      <input v-model="userSearchQuery" class="search-bar" placeholder="Search User" />
    </div><br><br>

    <!-- User Cards (Excluding Admin Accounts) -->
    <div class="user-container">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card" @click="fetchInvoicesForUser(user.email, user.username)">
        <h3>{{ user.username }}</h3>
        <p>Email: {{ user.email }}</p>
        <p class="user-role">Role: {{ user.role }}</p>
      </div>
    </div>

    <!-- Show Invoices Only If User is Selected -->
    <div v-if="selectedUserEmail">
      <h3 class="invoice-title">Invoices for {{ selectedUserName }}</h3>

      <!-- Filters -->
      <div class="filters">
        <label class="filter-label">Filter by Status:</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
        <input v-model="searchQuery" class="search-bar" placeholder="Search Invoice ID" />
      </div>

      <!-- Invoices Grid -->
      <div class="invoice-container">
        <div v-for="invoice in filteredInvoices" :key="invoice.id" class="invoice-card">
          <h3>Invoice #{{ invoice.id }}</h3>
          <p><strong>Date:</strong> {{ formattedDate(invoice.createdAt) }}</p>
          <p><strong>Services:</strong> {{ invoice.services.map(s => s.serviceName).join(', ') }}</p>
          <p><strong>Total:</strong> ₱{{ invoice.totalAmount }}</p>
          <span :class="invoice.status.toLowerCase()" class="status-badge">
            {{ invoice.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Message If No User Selected -->
    <div v-else class="no-user">
      <p>Select a user to view their invoices.</p>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default {
  data() {
    return {
      users: [],
      invoices: [],
      selectedUserEmail: null,
      selectedUserName: "",
      filterStatus: "",
      searchQuery: "",
      userSearchQuery: "", // New search query for users
    };
  },
  computed: {
    // Filter users to exclude Admins and match search query
    filteredUsers() {
      return this.users.filter(user => 
        user.role !== "admin" &&
        (user.username.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(this.userSearchQuery.toLowerCase()))
      );
    },

    // Filter invoices based on search and status
    filteredInvoices() {
      return this.invoices.filter(invoice => 
        (!this.filterStatus || invoice.status === this.filterStatus) &&
        (!this.searchQuery || invoice.id.includes(this.searchQuery))
      );
    }
  },
  async mounted() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        this.users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async fetchInvoicesForUser(email, username) {
      this.selectedUserEmail = email;
      this.selectedUserName = username;

      try {
        const q = query(collection(db, "invoices"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        this.invoices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (this.invoices.length === 0) {
          alert(`No invoices found for ${username}.`);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
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
/* General Layout */
/* General Layout */
.admin-invoices {
  background: #0f1624;
  color: #ffffff;
  min-height: 100vh;
  padding: 40px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

/* Titles */
.title {
  font-size: 30px;
  font-weight: 700;
  color: #ffcc00;
  margin-bottom: 10px;
}

.subtitle {
  color: #ddd;
  font-size: 16px;
  margin-bottom: 30px;
}

/* User Cards */
.user-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto 30px;
}

.user-card {
  background: #1e2a47;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-5px);
  background: #232b42;
}

.user-card h3 {
  color: #ffcc00;
  font-size: 18px;
  margin-bottom: 5px;
}

.user-role {
  font-size: 14px;
  color: #bbb;
}

/* Filters */
.filters {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-label {
  color: #ccc;
  font-size: 14px;
}

.filter-select, .search-bar {
  background: #1e2a47;
  color: white;
  padding: 10px;
  border-radius: 6px;
  border: none;
  outline: none;
  transition: all 0.3s ease;
}

.search-bar {
  width: 200px;
}

.filter-select:hover, .search-bar:hover {
  background: #2b3565;
}

/* Invoice Grid */
.invoice-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Invoice Cards */
.invoice-card {
  background: #1e2a47;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
  text-align: left;
  transition: transform 0.3s ease;
}

.invoice-card:hover {
  transform: scale(1.03);
}

.invoice-card h3 {
  color: #ffcc00;
  font-size: 18px;
}

/* Status Badges */
.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  display: inline-block;
}

.paid {
  background: #28a745;
}

.pending {
  background: #dc3545;
}

/* No User Message */
.no-user p {
  color: #bbb;
  font-size: 16px;
  margin-top: 20px;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: center;
  }
  .filter-select, .search-bar {
    width: 100%;
  }
  .invoice-container {
    grid-template-columns: 1fr;
  }
}
</style>
