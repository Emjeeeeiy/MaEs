<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
    style="background-image: url('/MaEs_bg.png')"
  >
    <form
      @submit.prevent="resetPassword"
      class="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200"
    >
      <!-- Title -->
      <h2 class="text-3xl font-extrabold text-center text-green-800 mb-6 drop-shadow-sm">
        Reset Your Password
      </h2>

      <!-- Email Input -->
      <div class="mb-5">
        <label
          for="email"
          class="block text-sm font-medium text-gray-800 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="Enter your registered email"
          class="w-full px-4 py-2 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-sm bg-white"
        />
      </div>

      <!-- Messages -->
      <p v-if="message" class="text-sm font-medium text-green-700 text-center mb-4">
        {{ message }}
      </p>
      <p v-if="errorMessage" class="text-sm font-medium text-red-600 text-center mb-4">
        {{ errorMessage }}
      </p>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition duration-150"
      >
        Send Reset Link
      </button>

      <!-- Back to Login -->
      <div class="mt-5 text-center">
        <router-link
          to="/login"
          class="text-sm text-green-700 hover:underline font-medium"
        >
          Back to Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// Reactive state
const email = ref("");
const message = ref("");
const errorMessage = ref("");

// Reset password function
const resetPassword = async () => {
  const auth = getAuth();

  // --- Safety check ---
  if (!email.value) {
    errorMessage.value = "Please enter your email.";
    message.value = "";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.value, {
      url: "https://yourdomain.web.app/login", // 🔥 IMPORTANT: replace with your hosted domain or localhost URL
      handleCodeInApp: true,
    });

    message.value =
      "✅ Password reset link sent! Please check your email inbox or spam folder.";
    errorMessage.value = "";
  } catch (error) {
    console.error("Reset error:", error);

    if (error.code === "auth/user-not-found") {
      errorMessage.value = "This email is not registered. Try again.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage.value = "Invalid email address.";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage.value = "Network error. Check your connection.";
    } else {
      errorMessage.value =
        "Error sending reset link. Please try again later.";
    }

    message.value = "";
  }
};
</script>

<style scoped>
button,
a {
  transition: transform 0.15s ease, background-color 0.2s ease;
}
button:hover,
a:hover {
  transform: translateY(-2px);
}
</style>
