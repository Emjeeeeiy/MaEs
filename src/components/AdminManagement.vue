<template>
  <div class="admin-container">
    <h2>Admin Management</h2>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="users.length">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username || "Unknown" }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select v-model="user.role" @change="updateUserRole(user)" class="role-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>
              <span :class="{ deactivated: user.status === 'deactivated' }">
                {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
              </span>
            </td>
            <td>{{ user.lastActive || "Never Logged In" }}</td>
            <td>
              <button v-if="user.status === 'active'" @click="confirmDeactivation(user)" class="deactivate-btn">
                Deactivate
              </button>
              <button v-if="user.status === 'deactivated'" @click="confirmReactivation(user)" class="reactivate-btn">
                Reactivate
              </button>
              <button @click="confirmDeletion(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else>No users found.</p>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import { getDoc, doc, collection, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export default {
  setup() {
    const users = ref([]);
    const errorMessage = ref("");

    const fetchUsers = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Not authenticated");
        }

        // Check if the current user is an admin
        const adminRef = doc(db, "users", currentUser.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists() || adminSnap.data().role !== "admin") {
          throw new Error("Access denied. Admins only.");
        }

        // Fetch ALL users
        const usersCollection = collection(db, "users");
        onSnapshot(usersCollection, (snapshot) => {
          users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const updateUserRole = async (user) => {
      if (user.status === "deactivated") {
        alert("Cannot change role of a deactivated user. Reactivate first.");
        return;
      }

      try {
        await updateDoc(doc(db, "users", user.id), { role: user.role });
        alert(`User role updated to ${user.role}`);
      } catch (error) {
        alert("Error updating role: " + error.message);
      }
    };

    const deactivateUser = async (user) => {
      try {
        await updateDoc(doc(db, "users", user.id), { status: "deactivated" });
        alert("User has been deactivated.");
      } catch (error) {
        alert("Error deactivating user: " + error.message);
      }
    };

    const reactivateUser = async (user) => {
      try {
        await updateDoc(doc(db, "users", user.id), { status: "active" });
        alert("User has been reactivated.");
      } catch (error) {
        alert("Error reactivating user: " + error.message);
      }
    };

    const deleteUser = async (userId) => {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted successfully.");
      } catch (error) {
        alert("Error deleting user: " + error.message);
      }
    };

    const confirmDeactivation = (user) => {
      if (confirm(`Are you sure you want to deactivate ${user.username}?`)) {
        deactivateUser(user);
      }
    };

    const confirmReactivation = (user) => {
      if (confirm(`Are you sure you want to reactivate ${user.username}?`)) {
        reactivateUser(user);
      }
    };

    const confirmDeletion = (userId) => {
      if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        deleteUser(userId);
      }
    };

    onMounted(fetchUsers);

    return { users, errorMessage, updateUserRole, confirmDeactivation, confirmReactivation, confirmDeletion };
  },
};
</script>

<style scoped>
/* ✅ Matches Dark Dashboard Theme */
body {
  background-color: #1e1e2f;
  color: #f4f4f4;
  font-family: 'Arial', sans-serif;
}

/* Ensure admin container is centered with proper spacing */
.admin-container {
  background-color: #23233a;
  color: #f4f4f4;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  max-width: 80%;
  margin: 40px auto;
  text-align: center;
}

/* ✅ Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #2c2c48;
  color: #f4f4f4;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  border-bottom: 1px solid #444;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #38385a;
  color: #f4c542;
  font-weight: bold;
}

td {
  background-color: #2c2c48;
}

.deactivated {
  color: #ff4d4d;
  font-weight: bold;
}

/* ✅ Select Dropdown */
.role-select {
  background: #3b3b5c;
  color: white;
  border: 1px solid #505080;
  padding: 5px;
  border-radius: 5px;
}

/* ✅ Button Styles */
.deactivate-btn,
.reactivate-btn,
.delete-btn {
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: 0.3s ease-in-out;
}

.deactivate-btn {
  background-color: #ff9500;
  color: white;
}

.deactivate-btn:hover {
  background-color: #e68500;
}

.reactivate-btn {
  background-color: #28a745;
  color: white;
}

.reactivate-btn:hover {
  background-color: #218838;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

/* ✅ Error Message */
.error-message {
  color: red;
  font-weight: bold;
}
</style>
