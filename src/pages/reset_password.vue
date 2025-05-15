<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-green-700">
    <form @submit.prevent="resetPassword" class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>

      <!-- Email Input -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-700">Email</label>
        <input
          type="email"
          v-model="email"
          required
          placeholder="Enter your email"
          class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Message -->
      <p v-if="message" class="text-sm text-center text-green-700 mb-4">{{ message }}</p>
      <p v-if="errorMessage" class="text-sm text-center text-red-600 mb-4">{{ errorMessage }}</p>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Send Reset Email
      </button>

      <!-- Back to Login -->
      <div class="text-center mt-4">
        <router-link to="/login" class="text-sm text-green-700 hover:underline">
          Back to Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const email = ref("");
const message = ref("");
const errorMessage = ref("");

const resetPassword = async () => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email.value);
    message.value = "Password reset link sent!";
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = "Error resetting password. Make sure the email is valid.";
    message.value = "";
    console.error("Reset error:", error);
  }
};
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>
