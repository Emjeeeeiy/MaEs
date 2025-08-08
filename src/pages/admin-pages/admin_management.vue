<template>
  <div class="min-h-screen bg-[#1a1a1a] text-gray-200">
    <!-- Fixed Topbar -->
    <div class="fixed top-0 left-0 right-0 z-40">
      <AdminTopbar />
    </div>

    <div class="flex pt-16 h-[calc(100vh-4rem)]"> <!-- 4rem = topbar height -->
      <!-- Sidebar (Fixed height after topbar) -->
      <div class="w-64 h-full border-r border-gray-800 bg-[#1a1a1a] shadow-md overflow-y-auto">
        <AdminSidebar />
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Error -->
        <div
          v-if="errorMessage"
          class="bg-red-900 border border-red-600 text-red-300 p-4 rounded-lg shadow-sm animate-pulse"
        >
          {{ errorMessage }}
        </div>

        <!-- User Table -->
        <div
          v-if="users.length"
          class="bg-[#222] border border-gray-700 rounded-xl shadow-xl overflow-hidden"
        >
          <table class="w-full text-sm">
            <thead class="bg-green-900 text-green-300 uppercase text-xs font-bold tracking-wide">
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
                class="border-t border-gray-700 hover:bg-[#2c2c2c] even:bg-[#1d1d1d] transition-all duration-200"
              >
                <td class="px-6 py-4 font-semibold text-white">{{ user.username || "Unknown" }}</td>
                <td class="px-6 py-4 text-sm text-gray-300">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <select
                    v-model="user.role"
                    @change="updateUserRole(user)"
                    class="bg-[#111] border border-gray-600 text-sm rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold inline-block',
                      user.status === 'deactivated'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-green-800 text-green-300'
                    ]"
                  >
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-400">
                  {{ formatLastActive(user.lastActive) }}
                </td>
                <td class="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button
                    v-if="user.status === 'active'"
                    @click="confirmDeactivation(user)"
                    class="px-3 py-1 bg-yellow-700 text-yellow-100 rounded hover:bg-yellow-600 text-xs font-medium transition"
                    title="Deactivate"
                  >
                    Deactivate
                  </button>
                  <button
                    v-if="user.status === 'deactivated'"
                    @click="confirmReactivation(user)"
                    class="px-3 py-1 bg-green-700 text-green-100 rounded hover:bg-green-600 text-xs font-medium transition"
                    title="Reactivate"
                  >
                    Reactivate
                  </button>
                  <button
                    @click="confirmDeletion(user.id)"
                    class="px-3 py-1 bg-red-800 text-red-100 rounded hover:bg-red-700 text-xs font-medium transition"
                    title="Delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users -->
        <div v-else class="flex flex-col items-center justify-center mt-12 text-gray-400">
          <svg
            class="w-16 h-16 mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z"
            />
          </svg>
          <p class="text-sm">No users found in the system.</p>
        </div>
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

// Format timestamp for lastActive
const formatLastActive = (lastActive) => {
  if (!lastActive) return "Never";
  return new Date(lastActive).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Fetch users
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

// Role update
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

// Status actions
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

// Confirm dialogs
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
