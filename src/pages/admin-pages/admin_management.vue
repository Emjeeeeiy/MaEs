<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm">
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(100vh-4rem)] custom-scrollbar">
        <!-- Error Message -->
        <div v-if="errorMessage" class="border border-red-400 bg-red-100 text-red-800 p-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- User Table -->
        <div v-if="users.length" class="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-200 text-gray-800 text-xs font-bold uppercase">
              <tr>
                <th class="px-4 py-2 text-left border-b border-gray-300">Username</th>
                <th class="px-4 py-2 text-left border-b border-gray-300">Email</th>
                <th class="px-4 py-2 text-left border-b border-gray-300">Role</th>
                <th class="px-4 py-2 text-left border-b border-gray-300">Status</th>
                <th class="px-4 py-2 text-left border-b border-gray-300">Last Active</th>
                <th class="px-4 py-2 text-left border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-b border-gray-200 hover:bg-gray-50 transition">
                <td class="px-4 py-2">{{ user.username || "Unknown" }}</td>
                <td class="px-4 py-2">{{ user.email }}</td>
                <td class="px-4 py-2">
                  <select
                    v-model="user.role"
                    @change="updateUserRole(user)"
                    class="border border-gray-400 text-sm px-2 py-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-4 py-2">
                  <span :class="user.status === 'deactivated' ? 'text-red-600' : 'text-green-600'">
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                <td class="px-4 py-2">{{ formatLastActive(user.lastActive) }}</td>
                <td class="px-4 py-2 space-x-2">
                  <button
                    v-if="user.status === 'active'"
                    @click="confirmDeactivation(user)"
                    class="px-2 py-1 border border-gray-400 text-xs rounded hover:bg-gray-100 transition"
                  >
                    Deactivate
                  </button>
                  <button
                    v-if="user.status === 'deactivated'"
                    @click="confirmReactivation(user)"
                    class="px-2 py-1 border border-gray-400 text-xs rounded hover:bg-gray-100 transition"
                  >
                    Reactivate
                  </button>
                  <button
                    @click="confirmDeletion(user.id)"
                    class="px-2 py-1 border border-red-400 text-xs rounded text-red-600 hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users -->
        <div v-else class="flex flex-col items-center justify-center mt-12 text-gray-600">
          <svg
            class="w-16 h-16 mb-4"
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
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import { getDoc, doc, collection, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
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
  if (confirm(`Deactivate ${user.username}?`)) deactivateUser(user);
};
const confirmReactivation = (user) => {
  if (confirm(`Reactivate ${user.username}?`)) reactivateUser(user);
};
const confirmDeletion = (userId) => {
  if (confirm("Are you sure you want to delete this user?")) deleteUser(userId);
};

onMounted(fetchUsers);
</script>
