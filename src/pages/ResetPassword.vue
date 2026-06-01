<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased font-sans">
    <main class="flex-grow flex items-center justify-center px-4 py-12">
      <form
        @submit.prevent="resetPassword"
        class="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 bg-white shadow-sm border border-slate-200/60"
      >
        <div class="text-center">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Enter your email to receive a secure recovery link.
          </p>
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
          <span>⚠️</span> <span>{{ errorMessage }}</span>
        </div>

        <div v-if="message" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
          <span>✅</span> <span>{{ message }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div class="relative">
            <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="name@hospital.com"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || !email"
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          Send Reset Link
        </button>

        <p class="text-xs text-center text-slate-500">
          Remembered your password?
          <router-link to="/login" class="text-emerald-700 font-bold hover:underline ml-0.5">
            Sign In
          </router-link>
        </p>
      </form>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Mail, RefreshCw } from "lucide-vue-next";
import { useNotifications } from "@/composables/useNotifications";
import AppFooter from "@/components/AppFooter.vue";

const email = ref("");
const message = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const { success, error: notifyError } = useNotifications();

const resetPassword = async () => {
  if (!email.value) return;

  isSubmitting.value = true;
  message.value = "";
  errorMessage.value = "";

  try {
    await sendPasswordResetEmail(getAuth(), email.value.trim());
    message.value = "Password reset link sent! Please check your inbox.";
    success(message.value);
    email.value = "";
  } catch (error) {
    console.error("Reset error:", error);
    if (error.code === "auth/user-not-found") {
      errorMessage.value = "This email is not registered.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage.value = "Invalid email address.";
    } else {
      errorMessage.value = "Error sending reset link. Please try again.";
    }
    notifyError(errorMessage.value);
  } finally {
    isSubmitting.value = false;
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
