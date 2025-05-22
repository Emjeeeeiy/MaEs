<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- System Name / Logo -->
        <div class="text-xl font-bold text-green-700">
          MaEs
        </div>

        <!-- Auth Navigation -->
        <nav class="flex gap-6 items-center text-gray-700">
          <!-- <router-link to="/login" class="hover:text-green-600 font-medium">Login</router-link> -->
          <router-link to="/register" class="hover:text-green-600 font-medium">Register</router-link>
          <router-link to="/reset_password" class="hover:text-green-600 text-sm">Forgot Password?</router-link>
          <router-link to="/about" class="hover:text-green-600 text-sm hidden sm:inline">About</router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>