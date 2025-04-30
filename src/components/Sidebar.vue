<template>
    <div class="h-screen w-64 bg-white border-r shadow-md flex flex-col">
      <div class="px-6 py-4 text-xl font-semibold text-gray-800 border-b">
        MaEs
      </div>
      <nav class="flex flex-col gap-2 px-6 py-4 text-gray-700">
        <router-link to="/profile-display" class="nav-button">
          <i class="fas fa-user mr-2"></i> Profile
        </router-link>
        <router-link to="/payments" class="nav-button">
          <i class="fas fa-credit-card mr-2"></i> Payments
        </router-link>
        <router-link to="/invoices" class="nav-button">
          <i class="fas fa-file-invoice mr-2"></i> Invoices
        </router-link>
        <router-link to="/billing" class="nav-button">
          <i class="fas fa-clipboard-check mr-2"></i> Billing
        </router-link>
        <router-link to="/reports" class="nav-button">
          <i class="fas fa-chart-bar mr-2"></i> Reports
        </router-link>
        <router-link to="/settings" class="nav-button">
          <i class="fas fa-cog mr-2"></i> Settings
        </router-link>
      </nav>
      <div class="mt-auto px-6 py-4 border-t">
        <button
          @click="logout"
          class="w-full text-left text-red-600 hover:underline"
        >
          Logout
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
  

  