<template>
  <div class="h-screen w-64 bg-gray-800 text-white border-r shadow-lg flex flex-col">
    <!-- Header -->
    <div class="px-6 py-5 text-2xl font-bold text-green-500 border-b border-gray-700">
      MaEs
    </div>

    <!-- Profile Section -->
    <div class="flex flex-col items-center py-6 border-b border-gray-700">
      <div
        class="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full text-xl font-semibold"
      >
        A
      </div>
      <h3 class="mt-2 text-lg font-medium text-gray-200">{{ username }}</h3>
      <p class="text-sm text-gray-400 capitalize">{{ role }}</p>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-4 space-y-2">
      <router-link
        to="/admin-dashboard"
        class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
      >
        <HomeIcon class="w-5 h-5" />
        Admin Dashboard
      </router-link>
      <router-link
        to="/admin-management"
        class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
      >
        <UsersIcon class="w-5 h-5" />
        Manage Users
      </router-link>
      <router-link
        to="/admin-invoices"
        class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
      >
        <DocumentTextIcon class="w-5 h-5" />
        Invoice Management
      </router-link>
      <router-link
        to="/admin-claims"
        class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
      >
        <ClipboardDocumentCheckIcon class="w-5 h-5" />
        Claims Management
      </router-link>
      <router-link
        to="/admin-services"
        class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
      >
        <Cog6ToothIcon class="w-5 h-5" />
        Service Management
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="px-4 py-4 border-t border-gray-700">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white rounded transition font-medium"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'

// Heroicons
import { HomeIcon } from '@heroicons/vue/24/outline'
import { UsersIcon } from '@heroicons/vue/24/outline'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import { ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const logout = async () => {
  const auth = getAuth()
  await signOut(auth)
  router.push('/login')
}
</script>

<style scoped>
/* Background Color */
.bg-gray-800 {
  background-color: #2d3748;
}

/* Header */
.text-green-500 {
  color: #48bb78;
}

/* Profile Section */
.bg-green-600 {
  background-color: #38a169;
}

/* Navigation Links */
.text-gray-200 {
  color: #e2e8f0;
}

.hover\:bg-green-700:hover {
  background-color: #2f855a;
}

.text-gray-400 {
  color: #cbd5e0;
}

/* Logout Button */
.text-red-500 {
  color: #f56565;
}

.hover\:bg-red-600:hover {
  background-color: #e53e3e;
}
</style>
