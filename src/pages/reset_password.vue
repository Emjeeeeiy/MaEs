<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
    style="background-image: url('/MaEs_bg.png')"
  >
    <form
      @submit.prevent="resetPassword"
      class="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-green-700 mb-6">Reset Your Password</h2>

      <!-- Email Input -->
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="Enter your registered email"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      <!-- Messages -->
      <p v-if="message" class="text-sm text-green-700 text-center mb-4">{{ message }}</p>
      <p v-if="errorMessage" class="text-sm text-red-600 text-center mb-4">{{ errorMessage }}</p>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition duration-150"
      >
        Send Reset Link
      </button>

      <!-- Back to Login -->
      <div class="mt-5 text-center">
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
    errorMessage.value =
      "Error resetting password. Please enter a valid registered email.";
    message.value = "";
    console.error("Reset error:", error);
  }
};
</script>

<style scoped>
button,
a {
  transition: transform 0.15s ease;
}
button:hover,
a:hover {
  transform: translateY(-2px);
}
</style>
