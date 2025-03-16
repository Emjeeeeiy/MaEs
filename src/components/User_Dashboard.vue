<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="profile-section">
        <div class="profile-img-container">
          <img
            v-if="profileImageUrl"
            :src="profileImageUrl"
            alt="Profile Picture"
            class="profile-img"
          />
          <div v-else class="profile-placeholder">
            {{ username.charAt(0).toUpperCase() }}
          </div>
        </div>
        <h3 class="username">{{ username }}</h3>
        <p class="role-text">{{ role }}</p>
      </div>
      <hr/>

      <nav class="nav-links">
        <router-link to="/profile-display" class="nav-button">
          <i class="fas fa-user"></i> Profile
        </router-link>
        <router-link to="/payments" class="nav-button">
          <i class="fas fa-credit-card"></i> Payments
        </router-link>
        <router-link to="/invoices" class="nav-button">
          <i class="fas fa-file-invoice"></i> Invoices
        </router-link>
        <router-link to="/billing" class="nav-button">
          <i class="fas fa-clipboard-check"></i> Billing
        </router-link>
        <router-link to="/reports" class="nav-button">
          <i class="fas fa-chart-bar"></i> Reports
        </router-link>
        <router-link to="/settings" class="nav-button">
          <i class="fas fa-cog"></i> Settings
        </router-link>
      </nav>
      <hr/>
    </aside>
    

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Dashboard Header -->
      <header class="dashboard-header">
        <h2>Dashboard</h2>
        <div class="header-controls">
          <input type="text" placeholder="Search..." class="search-bar" />
          <!-- <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div> -->
          <div class="user-profile">
            <!-- <img
              v-if="profileImageUrl"
              :src="profileImageUrl"
              alt="Profile Picture"
              class="profile-img-small"
            />
            <div v-else class="profile-placeholder-small">
              {{ username.charAt(0).toUpperCase() }}
            </div> -->
            <button @click="logout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i> Log Out
            </button>
          </div>
        </div>
      </header>
      <hr/>

      <!-- Dashboard Cards -->
      <section class="dashboard-cards">
        <div class="card">
          <h3>Total Revenue</h3>
          <p>${{ totalRevenue }}</p>
        </div>
        <div class="card">
          <h3>Pending Claims</h3>
          <p>{{ pendingClaims }}</p>
        </div>
        <div class="card">
          <h3>Outstanding Payments</h3>
          <p>${{ outstandingPayments }}</p>
        </div>
      </section>

     <!-- Invoices Section -->
      <section class="invoices-section">
        <h3>Recent Invoices</h3>
        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                <td>{{ invoice.id }}</td>
                <td>${{ invoice.totalAmount.toLocaleString() }}</td>
                <td :class="getStatusClass(invoice.status)">{{ invoice.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { ref, onMounted, computed, watch } from "vue";

export default {
  setup() {
    const auth = getAuth();

    // Reactive Variables
    const username = ref("User");
    const role = ref("User");
    const totalRevenue = ref(1200000);
    const pendingClaims = ref(45);
    const outstandingPayments = ref(250000);
    const invoices = ref([]);
    const userEmail = ref(null);

    // Fetch User Data and Invoices
    onMounted(async () => {
      if (auth.currentUser) {
        username.value = auth.currentUser.displayName || "User";
        userEmail.value = auth.currentUser.email;
        await fetchInvoices();
      }
    });

    // Fetch invoices based on user email
    async function fetchInvoices() {
      if (!userEmail.value) return;
      try {
        const q = query(collection(db, "invoices"), where("email", "==", userEmail.value));
        const querySnapshot = await getDocs(q);
        invoices.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    }

    // Watch for changes in userEmail and fetch invoices again if needed
    watch(userEmail, (newEmail) => {
      if (newEmail) fetchInvoices();
    });

    // Function to assign classes based on invoice status
    function getStatusClass(status) {
      switch (status.toLowerCase()) {
        case "paid":
          return "status-paid";
        case "pending":
          return "status-pending";
        case "overdue":
          return "status-overdue";
        default:
          return "";
      }
    }

    // Logout Function
    function logout() {
      signOut(auth)
        .then(() => {
          window.location.href = "/login";
        })
        .catch(error => {
          console.error("Logout Error:", error);
        });
    }

    return {
      username,
      role,
      totalRevenue,
      pendingClaims,
      outstandingPayments,
      invoices,
      logout,
      getStatusClass,
      filteredInvoices: computed(() => invoices.value),
    };
  },
};
</script>





<style scoped>
/* Overall Layout with Gradient Background */
.dashboard-wrapper {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  font-family: 'Poppins', sans-serif;
  color: #333;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  margin: 20px;
}

.profile-section {
  margin-bottom: 20px;
}

.profile-img-container {
  margin-bottom: 10px;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #388e3c;
}

.profile-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #388e3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.nav-links {
  width: 100%;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #388e3c;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  margin: 10px 0;
  transition: background 0.3s ease;
  text-decoration: none;
}

.nav-button:hover {
  background: #2e7d32;
}

/* Main Content Styles */
.dashboard-content {
  flex-grow: 1;
  padding: 40px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  margin: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 28px;
  color: #388e3c;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-bar {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  width: 200px;
}

/* Notifications */
.notifications {
  position: relative;
  font-size: 20px;
  cursor: pointer;
}

.notifications .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

/* User Profile in Header */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-img-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #388e3c;
}

.profile-placeholder-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #388e3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}
/* 
.logout-button {
  background: #d9534f;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.3s ease;
} */
/* Back Profile Button */
.logout-button {
  display: inline-block;
  margin-top: 5px;
  padding: 5px 5px;
  font-size: 16px;
  font-weight: 600;
  color: red;
  border: 2px solid red;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.logout-button:hover {
  background-color: #388e3c;
  color: #fff;
}

.logout-button:hover {
  background: #c9302c;
}

/* Dashboard Cards */
.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: calc(33% - 20px);
  min-width: 220px;
  text-align: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.03);
}

.card h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #388e3c;
}

/* Charts Section */
/* .charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #388e3c;
  transition: transform 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-3px);
}

.chart-card h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #388e3c;
}

.chart-placeholder {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  height: 250px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-style: italic;
} */

/* Transactions & Notifications */
.transactions-notifications {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
}

.transactions,
.system-notifications {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: calc(50% - 20px);
  min-width: 300px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.transactions table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.transactions th,
.transactions td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.system-notifications ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.system-notifications li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.system-notifications li:last-child {
  border-bottom: none;
}

/* Improved Table Styles */
.table-container {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.styled-table th, .styled-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.styled-table thead {
  background-color: #388e3c;
  color: white;
  font-weight: bold;
}

.styled-table tbody tr:hover {
  background-color: rgba(0, 128, 0, 0.1);
}

.status-paid {
  color: green;
  font-weight: bold;
}

.status-pending {
  color: orange;
  font-weight: bold;
}

.status-overdue {
  color: red;
  font-weight: bold;
}

/* View Button */
.view-btn {
  background: #388e3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-btn:hover {
  background: #2e7d32;
}

/* Responsive Table */
@media (max-width: 768px) {
  .styled-table th, .styled-table td {
    padding: 8px 10px;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .dashboard-wrapper {
    flex-direction: column;
    padding: 10px;
  }
  .sidebar {
    width: 100%;
    margin: 10px 0;
  }
  .dashboard-content {
    padding: 20px;
  }
  .dashboard-cards {
    flex-direction: column;
    align-items: center;
  }
  .card {
    width: 100%;
  }
  .transactions,
  .system-notifications {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  .sidebar {
    position: fixed;
    height: 100%;
    background: white;
    z-index: 1000;
  }
  .close-btn {
    display: block;
    font-size: 20px;
    background: none;
    border: none;
    cursor: pointer;
  }
  .dashboard-content {
    margin-left: 0;
  }
  .dashboard-cards {
    flex-direction: column;
    align-items: center;
  }
}
</style>