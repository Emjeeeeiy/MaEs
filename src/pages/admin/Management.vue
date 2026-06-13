<template>
  <div class="flex flex-col min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-14">
      <!-- Sidebar -->
      <aside>
        <AdminSidebar />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 h-[calc(100vh-3.5rem)] custom-scrollbar">
        <!-- Error Message -->
        <div v-if="errorMessage" class="border border-red-400 bg-red-100 text-red-800 p-2 rounded text-sm">
          {{ errorMessage }}
        </div>

        <!-- Users Table -->
        <div v-if="users.length" class="border border-gray-300 bg-white rounded-lg shadow-sm overflow-hidden">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-200 text-gray-800 text-xs font-semibold uppercase">
              <tr>
                <th class="px-3 py-2 text-left border-b border-gray-300">Username</th>
                <th class="px-3 py-2 text-left border-b border-gray-300">Email</th>
                <th class="px-3 py-2 text-left border-b border-gray-300">Role</th>
                <th class="px-3 py-2 text-left border-b border-gray-300">Status</th>
                <th class="px-3 py-2 text-left border-b border-gray-300">Last Active</th>
                <th class="px-3 py-2 text-left border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td class="px-3 py-2 flex items-center gap-2">
                  <User2Icon class="w-4 h-4 text-gray-500" />
                  <span>{{ user.username || "Unknown" }}</span>
                </td>
                <td class="px-3 py-2">{{ user.email }}</td>
                <td class="px-3 py-2">
                  <select
                    v-model="user.role"
                    @change="updateUserRole(user)"
                    class="border border-gray-300 text-xs px-2 py-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-3 py-2">
                  <span
                    :class="user.status === 'deactivated' ? 'text-red-600' : 'text-green-600'"
                    class="font-medium text-xs"
                  >
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-xs">{{ formatLastActive(user.lastActive) }}</td>
                <td class="px-3 py-2 flex gap-1">
                  <button
                    v-if="user.status === 'active'"
                    @click="confirmDeactivation(user)"
                    class="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-100 transition"
                  >
                    <SlashIcon class="w-3 h-3" /> Deactivate
                  </button>
                  <button
                    v-if="user.status === 'deactivated'"
                    @click="confirmReactivation(user)"
                    class="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-green-600 text-xs hover:bg-green-50 transition"
                  >
                    <CheckCircleIcon class="w-3 h-3" /> Reactivate
                  </button>
                  <button
                    @click="confirmDeletion(user.id)"
                    class="flex items-center gap-1 px-2 py-1 border border-red-400 text-red-600 rounded text-xs hover:bg-red-100 transition"
                  >
                    <Trash2Icon class="w-3 h-3" /> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center mt-12 text-gray-500">
          <UsersIcon class="w-12 h-12 mb-2 text-gray-400" />
          <p class="text-sm">No users found in the system.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { db } from "@/firebase";
import { getDoc, doc, collection, updateDoc, deleteDoc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import AdminSidebar from "@/components/AdminSidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";
import { User2Icon, Trash2Icon, CheckCircleIcon, SlashIcon, UsersIcon } from "lucide-vue-next";
import { useNotifications } from "@/composables/useNotifications";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const users = ref([]);
const errorMessage = ref("");
const { success, error: notifyError } = useNotifications();

// Format timestamp
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
  if (!user.value) return;

  try {
    const adminRef = doc(db, "users", user.value.uid);
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
    notifyError(error.message);
  }
};

// Role update
const updateUserRole = async (userObj) => {
  if (userObj.status === "deactivated") {
    notifyError("Cannot change role of a deactivated user.");
    return;
  }
  try {
    await updateDoc(doc(db, "users", userObj.id), { role: userObj.role });

    // Send Notification to User
    await addDoc(collection(db, 'notifications'), {
      userEmail: userObj.email,
      type: 'role-updated',
      message: `Your account role has been updated to ${userObj.role}.`,
      createdAt: serverTimestamp(),
      read: false
    })

    success(`Role updated to ${userObj.role}`);
  } catch (error) {
    notifyError("Error updating role: " + error.message);
  }
};

// Status actions
const deactivateUser = async (userObj) => {
  try {
    await updateDoc(doc(db, "users", userObj.id), { status: "deactivated" });

    // Send Notification to User
    await addDoc(collection(db, 'notifications'), {
      userEmail: userObj.email,
      type: 'status-updated',
      message: `Your account status has been set to deactivated.`,
      createdAt: serverTimestamp(),
      read: false
    })

    success("User deactivated successfully.");
  } catch (error) {
    notifyError("Error: " + error.message);
  }
};

const reactivateUser = async (userObj) => {
  try {
    await updateDoc(doc(db, "users", userObj.id), { status: "active" });

    // Send Notification to User
    await addDoc(collection(db, 'notifications'), {
      userEmail: userObj.email,
      type: 'status-updated',
      message: `Your account status has been reactivated.`,
      createdAt: serverTimestamp(),
      read: false
    })

    success("User reactivated successfully.");
  } catch (error) {
    notifyError("Error: " + error.message);
  }
};

const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    success("User deleted successfully.");
  } catch (error) {
    notifyError("Error: " + error.message);
  }
};

// Confirm dialogs
const confirmDeactivation = (userObj) => {
  if (confirm(`Deactivate ${userObj.username}?`)) deactivateUser(userObj);
};
const confirmReactivation = (userObj) => {
  if (confirm(`Reactivate ${userObj.username}?`)) reactivateUser(userObj);
};
const confirmDeletion = (userId) => {
  if (confirm("Are you sure you want to delete this user?")) deleteUser(userId);
};

onMounted(fetchUsers);
watch(user, fetchUsers);
</script>

<style scoped>
/* Optional: tighter hover transitions for table rows */
table tbody tr:hover {
  transition: background-color 0.2s ease;
}
</style>
