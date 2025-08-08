<template>
  <aside class="h-full flex flex-col bg-[#1a1a1a] text-white">
    <!-- Profile Header -->
    <div class="flex flex-col items-center py-6 border-b border-gray-700 px-4">
      <div
        class="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold"
      >
        A
      </div>
      <h2 class="mt-2 text-lg font-semibold">{{ username }}</h2>
      <p class="text-sm text-gray-400">{{ role }}</p>
    </div>

    <!-- Menu Items with Scroll -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      <!-- Main Section -->
      <div>
        <h3 class="text-xs uppercase text-gray-500 font-semibold mb-2">Main</h3>
        <ul class="space-y-2">
          <li>
            <RouterLink
              to="/admin-dashboard"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <LayoutDashboard class="w-5 h-5" />
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-management"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Users class="w-5 h-5" />
              <span>Users</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Manage Section -->
      <div>
        <h3 class="text-xs uppercase text-gray-500 font-semibold mb-2">Manage</h3>
        <ul class="space-y-2">
          <li>
            <RouterLink
              to="/admin-invoices"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <FileText class="w-5 h-5" />
              <span>Invoice</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-services"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Settings class="w-5 h-5" />
              <span>Service</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Others Section -->
      <div>
        <h3 class="text-xs uppercase text-gray-500 font-semibold mb-2">Others</h3>
        <ul class="space-y-2">
          <li>
            <RouterLink
              to="/admin-appointment"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Calendar class="w-5 h-5" />
              <span>Appointment</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-result"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <BarChart class="w-5 h-5" />
              <span>Result</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-rfa"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <MessageSquare class="w-5 h-5" />
              <span>Request for Assistance</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Logout Button (Sticky Footer) -->
    <div class="px-4 py-4 border-t border-gray-700">
      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition"
      >
        <LogOut class="w-4 h-4" />
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import { getAuth, signOut } from "firebase/auth";

// Lucide icons
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  BarChart,
  MessageSquare,
  LogOut,
} from "lucide-vue-next";

const router = useRouter();

const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  router.push("/login");
};

// Replace with actual user info if dynamic
const username = "Admin";
const role = "Administrator";
</script>

<style scoped>
aside::-webkit-scrollbar {
  width: 6px;
}
aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
</style>
