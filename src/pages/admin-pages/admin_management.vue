<template>
    <div class="flex min-h-screen bg-gray-100">
      <!-- Admin Sidebar -->
      <AdminSidebar class="w-64 border-r bg-white" />
  
      <!-- Main content -->
      <div class="flex-1 p-6 space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">Admin Management</h2>
        <p v-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
  
        <div v-if="users.length" class="overflow-x-auto bg-white shadow rounded-lg">
          <table class="min-w-full text-sm text-left border-collapse text-gray-800">
            <thead class="bg-gray-200 text-gray-800 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-3">Username</th>
                <th class="px-6 py-3">Email</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Last Active</th>
                <th class="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-t bg-white hover:bg-gray-50">
                <td class="px-6 py-4 text-gray-800">{{ user.username || "Unknown" }}</td>
                <td class="px-6 py-4 text-gray-800">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <select
                    v-model="user.role"
                    @change="updateUserRole(user)"
                    class="bg-white border border-gray-300 text-gray-800 rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="user.status === 'deactivated' ? 'text-red-600 font-semibold' : 'text-green-600 font-medium'"
                  >
                    {{ user.status === 'deactivated' ? 'Deactivated' : 'Active' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-800">{{ user.lastActive || "Never Logged In" }}</td>
                <td class="px-6 py-4 space-x-2">
                  <button
                    v-if="user.status === 'active'"
                    @click="confirmDeactivation(user)"
                    class="text-sm text-yellow-700 font-medium hover:underline"
                  >
                    Deactivate
                  </button>
                  <button
                    v-if="user.status === 'deactivated'"
                    @click="confirmReactivation(user)"
                    class="text-sm text-green-700 font-medium hover:underline"
                  >
                    Reactivate
                  </button>
                  <button
                    @click="confirmDeletion(user.id)"
                    class="text-sm text-red-700 font-medium hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <p v-else class="text-gray-500">No users found.</p>
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
  