<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">User Management</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Pamahalaan ang mga account, gampanin (roles), at access ng mga gumagamit sa system.</p>
        </div>
      </header>

      <div 
        v-if="errorMessage" 
        class="mb-6 flex items-center gap-2.5 p-3.5 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 text-red-700 dark:text-red-400 rounded-xl text-xs"
      >
        <AlertCircleIcon class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div 
        v-if="users.length" 
        class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-xs overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
                <th class="px-5 py-3.5 text-left font-medium">Username</th>
                <th class="px-5 py-3.5 text-left font-medium">Email</th>
                <th class="px-5 py-3.5 text-left font-medium">Role</th>
                <th class="px-5 py-3.5 text-left font-medium">Status</th>
                <th class="px-5 py-3.5 text-left font-medium">Last Active</th>
                <th class="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50 text-gray-700 dark:text-gray-300">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50/50 dark:hover:bg-[#222]/30 transition duration-150"
              >
                <td class="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                  <div class="flex items-center gap-2.5">
                    <div class="p-1.5 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 text-gray-400">
                      <User2Icon class="w-3.5 h-3.5" />
                    </div>
                    <span>{{ user.username || "Unknown" }}</span>
                  </div>
                </td>
                
                <td class="px-5 py-3.5 text-gray-500 dark:text-gray-400">{{ user.email }}</td>
                
                <td class="px-5 py-3.5">
                  <div class="relative inline-block w-28">
                    <select
                      v-model="user.role"
                      @change="updateUserRole(user)"
                      class="w-full appearance-none pl-2.5 pr-7 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-[#222] dark:hover:bg-[#2a2a2a] border border-gray-200/60 dark:border-gray-800 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDownIcon class="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </td>
                
                <td class="px-5 py-3.5">
                  <span
                    :class="user.status === 'deactivated' 
                      ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/10 dark:text-red-400 dark:border-red-900/20' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/20'"
                    class="inline-flex items-center px-2 py-0.5 border rounded-md font-medium text-[11px]"
                  >
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                
                <td class="px-5 py-3.5 text-gray-400 dark:text-gray-500">{{ formatLastActive(user.lastActive) }}</td>
                
                <td class="px-5 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      v-if="user.status === 'active'"
                      @click="confirmDeactivation(user)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222] hover:text-gray-900 dark:hover:text-white transition"
                    >
                      <SlashIcon class="w-3 h-3" /> 
                      <span>Deactivate</span>
                    </button>
                    
                    <button
                      v-if="user.status === 'deactivated'"
                      @click="confirmReactivation(user)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 border border-emerald-100 dark:border-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition"
                    >
                      <CheckCircleIcon class="w-3 h-3" /> 
                      <span>Reactivate</span>
                    </button>
                    
                    <button
                      @click="confirmDeletion(user.id)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 border border-transparent rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    >
                      <Trash2Icon class="w-3 h-3" /> 
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-xs">
        <div class="p-4 rounded-full bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 text-gray-400 mb-3">
          <UsersIcon class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Kasalukuyang walang rehistradong user sa system.</p>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { db } from "@/firebase";
import { getDoc, doc, collection, updateDoc, deleteDoc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import AdminLayout from "@/components/AdminLayout.vue";
import { 
  User2 as User2Icon, 
  Trash2 as Trash2Icon, 
  CheckCircle as CheckCircleIcon, 
  Slash as SlashIcon, 
  Users as UsersIcon,
  AlertCircle as AlertCircleIcon,
  ChevronDown as ChevronDownIcon
} from "lucide-vue-next";
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
