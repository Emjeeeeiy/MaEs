<template>
  <div class="min-h-screen bg-white text-gray-800 flex flex-col relative">

    <!-- MAIN -->
    <main class="flex-1 px-3 py-6 flex flex-col md:flex-row items-center justify-center gap-12">

      <!-- LOGIN CARD -->
      <div class="order-2 md:order-1 w-full max-w-md">

        <!-- POPUP -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="showPopup"
            class="mb-3 flex items-center gap-1 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg"
          >
            <Loader2
              v-if="!loginSuccess"
              class="h-4 w-4 text-green-600 animate-spin"
            />
            <CheckCircle
              v-else
              class="h-4 w-4 text-green-600"
            />
            <span class="text-green-700 text-xs font-medium">
              {{ loginSuccess ? "Login Successful" : "Logging in..." }}
            </span>
          </div>
        </transition>

        <!-- CARD -->
        <div class="border border-gray-300 rounded-lg p-6 bg-white">

          <h2 class="text-xl font-bold text-green-700 mb-4 text-center">
            Log in
          </h2>

          <p v-if="errorMessage" class="text-red-600 text-xs mb-3 text-center">
            {{ errorMessage }}
          </p>

          <form @submit.prevent="loginUser" class="space-y-3">

            <!-- EMAIL -->
            <div>
              <label class="block text-xs font-medium mb-1">Email</label>
              <div class="relative">
                <Mail class="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Enter your email"
                  class="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- PASSWORD -->
            <div>
              <label class="block text-xs font-medium mb-1">Password</label>
              <div class="relative">
                <Lock class="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full border border-gray-300 rounded-md pl-8 pr-8 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  @click="toggleShowPassword"
                  class="absolute right-2 top-2.5 text-gray-500"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>

              <div class="text-right mt-1">
                <button
                  type="button"
                  class="text-xs text-green-700 hover:underline"
                  @click="forgotPasswordModal = true"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <!-- LOGIN -->
            <button
              type="submit"
              :disabled="!email || !password"
              :class="[ 
                'w-full font-semibold py-2 rounded-md text-sm',
                !email || !password
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white'
              ]"
            >
              Login
            </button>
          </form>

          <div class="flex items-center justify-center text-gray-500 text-sm my-3">
            <span class="border-t w-1/4"></span>
            <span class="mx-2">or</span>
            <span class="border-t w-1/4"></span>
          </div>

          <button
            @click="signInWithGoogle"
            class="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              class="h-4 w-4"
            />
            Continue with Google
          </button>

          <p class="mt-4 text-xs text-center">
            Don’t have an account?
            <router-link
              to="/register"
              class="text-green-700 font-semibold hover:underline"
            >
              Register
            </router-link>
          </p>

        </div>
      </div>

      <!-- INFO -->
      <div class="order-1 md:order-2 max-w-md text-center md:text-left">
        <h2 class="text-2xl font-bold text-green-700 mb-2">
          Maria Estrella General Hospital, Inc.
        </h2>
        <p class="text-gray-600 mb-4">
          A secure hospital management and billing system designed to improve patient care.
        </p>
        <HeartbeatLine />
      </div>

    </main>

    <!-- FOOTER COMPONENT -->
    <AppFooter />

    <!-- FORGOT PASSWORD MODAL -->
    <transition name="fade">
      <div
        v-if="forgotPasswordModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg border border-gray-200 relative">
          <h3 class="text-xl font-bold text-green-700 mb-4 text-center">
            Reset Password
          </h3>
          <input
            type="email"
            v-model="forgotEmail"
            placeholder="Enter your registered email"
            class="w-full px-4 py-2 border rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:outline-none mb-3"
          />
          <p v-if="forgotMessage" class="text-sm text-green-600 text-center mb-2">
            {{ forgotMessage }}
          </p>
          <p v-if="forgotError" class="text-sm text-red-500 text-center mb-2">
            {{ forgotError }}
          </p>
          <div class="flex gap-2">
            <button
              @click="sendForgotPassword"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
            >
              Send Reset Link
            </button>
            <button
              @click="forgotPasswordModal = false"
              class="flex-1 border border-gray-300 hover:bg-gray-100 py-2 rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-vue-next";

import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import HeartbeatLine from "@/components/heartbeat_line.vue";
import AppFooter from "@/components/footeroutside.vue";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const showPopup = ref(false);
const loginSuccess = ref(false);
const forgotPasswordModal = ref(false);

const forgotEmail = ref("");
const forgotMessage = ref("");
const forgotError = ref("");

const toggleShowPassword = () => (showPassword.value = !showPassword.value);

const auth = getAuth();
const router = useRouter();

const loginUser = async () => {
  errorMessage.value = "";
  showPopup.value = true;
  loginSuccess.value = false;
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.value, password.value);
    if (!user.emailVerified) {
      errorMessage.value = "Please verify your email.";
      await signOut(auth);
      showPopup.value = false;
      return;
    }
    await routeByRole(user.uid);
  } catch {
    errorMessage.value = "Invalid email or password.";
    showPopup.value = false;
  }
};

const signInWithGoogle = async () => {
  errorMessage.value = "";
  showPopup.value = true;
  loginSuccess.value = false;
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    await routeByRole(user.uid);
  } catch {
    errorMessage.value = "Google sign-in failed.";
    showPopup.value = false;
  }
};

const routeByRole = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    errorMessage.value = "User data not found.";
    showPopup.value = false;
    return;
  }
  const data = snap.data();
  if (data.status === "deactivated") {
    errorMessage.value = "Account deactivated.";
    await signOut(auth);
    showPopup.value = false;
    return;
  }
  loginSuccess.value = true;
  setTimeout(() => {
    showPopup.value = false;
    router.push(data.role === "admin" ? "/admin-dashboard" : "/dashboard");
  }, 1200);
};

// Forgot Password Modal Logic
const sendForgotPassword = async () => {
  forgotMessage.value = "";
  forgotError.value = "";
  if (!forgotEmail.value) {
    forgotError.value = "Please enter your email.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, forgotEmail.value.trim());
    forgotMessage.value = "✅ Password reset link sent! Check your inbox.";
    forgotEmail.value = "";
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      forgotError.value = "This email is not registered.";
    } else if (err.code === "auth/invalid-email") {
      forgotError.value = "Invalid email address.";
    } else {
      forgotError.value = "Error sending reset link. Try again later.";
    }
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
