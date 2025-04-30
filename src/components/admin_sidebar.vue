<template>
    <div class="h-screen w-64 bg-gray-100 border-r shadow-lg flex flex-col">
      <!-- Header -->
      <div class="px-6 py-5 text-2xl font-bold text-green-700 border-b border-gray-300">
        MaEs
      </div>
  
      <!-- Profile Section -->
      <div class="flex flex-col items-center py-6 border-b border-gray-300">
        <div
          class="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full text-xl font-semibold"
        >
          A
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-800">{{ username }}</h3>
        <p class="text-sm text-gray-500 capitalize">{{ role }}</p>
      </div>
  
      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-4 space-y-2">
        <router-link
          to="/admin-management"
          class="block px-4 py-2 rounded text-gray-700 hover:bg-green-200 hover:text-green-900 transition font-medium"
        >
          Manage Users
        </router-link>
        <router-link
          to="/admin-invoices"
          class="block px-4 py-2 rounded text-gray-700 hover:bg-green-200 hover:text-green-900 transition font-medium"
        >
          Invoice Management
        </router-link>
        <router-link
          to="/claims-management"
          class="block px-4 py-2 rounded text-gray-700 hover:bg-green-200 hover:text-green-900 transition font-medium"
        >
          Claims Management
        </router-link>
      </nav>
  
      <!-- Logout -->
      <div class="px-4 py-4 border-t border-gray-300">
        <button
          @click="logout"
          class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 hover:text-red-800 rounded transition font-medium"
        >
          <i class="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { getAuth, signOut } from 'firebase/auth'
  
  const router = useRouter()
  
  const logout = async () => {
    const auth = getAuth()
    await signOut(auth)
    router.push('/login')
  }
  </script>
  