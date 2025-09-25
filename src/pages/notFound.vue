<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-800">
    <div class="text-center p-8 rounded-2xl shadow-lg bg-white max-w-md border border-gray-200">
      <!-- Icon / Logo Placeholder -->
      <div class="mb-6">
        <div class="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 shadow-inner">
          <span class="text-4xl font-bold text-blue-600">!</span>
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-7xl font-extrabold text-blue-600 tracking-tight">404</h1>
      <p class="text-lg mt-4 text-gray-600">
        Oops! The page you are looking for doesn’t exist in the system.
      </p>
      <p class="text-sm text-gray-500 mt-1">
        (Maybe it was moved, deleted, or mistyped.)
      </p>

      <!-- Button -->
      <router-link
        to="/"
        class="mt-8 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 hover:shadow-lg transition"
      >
        ⬅ Go Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>
