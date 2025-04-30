<template>
    <header class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo / Title -->
          <div class="text-xl font-bold text-green-700">
            Dashboard
          </div>
  
          <nav class="flex gap-6 text-gray-700 font-medium">
            <router-link to="/dashboard" class="hover:text-green-600">Dashboard</router-link>
            <router-link to="/profile" class="hover:text-green-600">Profile</router-link>
            <router-link to="/report" class="hover:text-green-600">Reports</router-link>
          </nav>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  </script>
  