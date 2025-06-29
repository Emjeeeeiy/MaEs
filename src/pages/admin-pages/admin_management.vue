<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Admin Sidebar -->
    <AdminSidebar class="w-64 border-r bg-white" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Admin Topbar -->
      <AdminTopbar />

      <!-- Page Content -->
      <div class="flex-1 p-6 space-y-6 overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-800">User Management</h2>

        <p v-if="errorMessage" class="text-red-600 font-medium">{{ errorMessage }}</p>

        <div
          v-if="users.length"
          class="bg-white shadow rounded-xl border border-gray-200"
        >
          <table class="w-full text-sm text-gray-800">
            <thead class="bg-green-100 text-gray-700 uppercase text-xs font-semibold tracking-wide">
              <tr>
                <th class="px-6 py-3 text-left">Username</th>
                <th class="px-6 py-3 text-left">Email</th>
                <th class="px-6 py-3 text-left">Role</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Last Active</th>
                <th class="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-t border-gray-200 hover:bg-gray-50 even:bg-gray-50"
              >
                <td class="px-6 py-4 font-medium">{{ user.username || "Unknown" }}</td>
                <td class="px-6 py-4">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <select
                    v-model="user.role"
                    @change="updateUserRole(user)"
                    class="bg-white border border-gray-300 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-green-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      user.status === 'deactivated'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    ]"
                  >
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ user.lastActive || "Never Logged In" }}</td>
                <td class="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button
                    v-if="user.status === 'active'"
                    @click="confirmDeactivation(user)"
                    class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs font-medium"
                  >
                    Deactivate
                  </button>
                  <button
                    v-if="user.status === 'deactivated'"
                    @click="confirmReactivation(user)"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
                  >
                    Reactivate
                  </button>
                  <button
                    @click="confirmDeletion(user.id)"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-gray-500 text-sm">No users found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import {
  getDoc,
  doc,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import AdminSidebar from "@/components/admin_sidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";

const users = ref([]);
const errorMessage = ref("");

const fetchUsers = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const adminRef = doc(db, "users", currentUser.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().role !== "admin") {
      throw new Error("Access denied. Admins only.");
    }

    const usersCollection = collection(db, "users");
    onSnapshot(usersCollection, (snapshot) => {
      users.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  } catch (error) {
    errorMessage.value = error.message;
  }
};

const updateUserRole = async (user) => {
  if (user.status === "deactivated") {
    alert("Cannot change role of a deactivated user.");
    return;
  }

  try {
    await updateDoc(doc(db, "users", user.id), { role: user.role });
    alert(`Role updated to ${user.role}`);
  } catch (error) {
    alert("Error updating role: " + error.message);
  }
};

const deactivateUser = async (user) => {
  try {
    await updateDoc(doc(db, "users", user.id), { status: "deactivated" });
    alert("User deactivated.");
  } catch (error) {
    alert("Error: " + error.message);
  }
};

const reactivateUser = async (user) => {
  try {
    await updateDoc(doc(db, "users", user.id), { status: "active" });
    alert("User reactivated.");
  } catch (error) {
    alert("Error: " + error.message);
  }
};

const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    alert("User deleted.");
  } catch (error) {
    alert("Error: " + error.message);
  }
};

const confirmDeactivation = (user) => {
  if (confirm(`Deactivate ${user.username}?`)) {
    deactivateUser(user);
  }
};

const confirmReactivation = (user) => {
  if (confirm(`Reactivate ${user.username}?`)) {
    reactivateUser(user);
  }
};

const confirmDeletion = (userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    deleteUser(userId);
  }
};

onMounted(fetchUsers);
</script>
