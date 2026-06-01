<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative antialiased font-sans">

    <main class="flex-1 px-4 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full">

      <div class="order-2 md:order-1 w-full max-w-md">

        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showPopup"
            class="mb-4 flex items-center gap-2.5 bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-xl"
          >
            <Loader2
              v-if="!loginSuccess"
              class="h-4 w-4 text-emerald-600 animate-spin"
            />
            <CheckCircle
              v-else
              class="h-4 w-4 text-emerald-600"
            />
            <span class="text-slate-700 text-xs font-semibold tracking-wide">
              {{ loginSuccess ? "Login Successful" : "Verifying system credentials..." }}
            </span>
          </div>
        </transition>

        <div class="border border-slate-200/60 rounded-2xl p-6 sm:p-8 bg-white shadow-sm">

          <div class="mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p class="text-slate-400 text-xs mt-1">
              Access your medical node and patient billing ecosystem.
            </p>
          </div>

          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
            <span>⚠️</span> <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="loginUser" class="space-y-4">

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div class="relative">
                <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="name@hospital.com"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  class="text-xs text-emerald-700 font-medium hover:text-emerald-600 transition"
                  @click="forgotPasswordModal = true"
                >
                  Forgot Password?
                </button>
              </div>
              
              <div class="relative">
                <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
                <button
                  type="button"
                  @click="toggleShowPassword"
                  class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="!email || !password"
              :class="[
                'w-full font-semibold py-3 rounded-xl text-sm transition-all shadow-sm mt-2',
                !email || !password
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:-translate-y-px'
              ]"
            >
              Sign In
            </button>
          </form>

          <div class="flex items-center justify-center text-slate-300 text-xs uppercase font-bold tracking-widest my-5">
            <span class="border-t border-slate-200 w-full"></span>
            <span class="mx-3 text-slate-400">or</span>
            <span class="border-t border-slate-200 w-full"></span>
          </div>

          <button
            @click="signInWithGoogle"
            class="w-full border border-slate-200 bg-white hover:bg-slate-50 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-slate-700 text-sm transition shadow-sm"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              class="h-4 w-4"
              alt="Google Icon"
            />
            Continue with Google
          </button>

          <p class="mt-6 text-xs text-center text-slate-500">
            Don’t have an operational account?
            <router-link
              to="/register"
              class="text-emerald-700 font-bold hover:underline ml-0.5"
            >
              Register Unit
            </router-link>
          </p>

        </div>
      </div>

      <div class="order-1 md:order-2 max-w-md text-center md:text-left space-y-4">

        <div class="flex justify-center md:justify-start">
          <img
            src="/MaEs_logo2.png"
            alt="MaEs Logo"
            class="h-16 w-16 rounded-full border border-slate-200 shadow-sm"
          />
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Maria Estrella General Hospital, Inc.
          </h2>
          <p class="text-slate-500 text-sm sm:text-base font-light leading-relaxed">
            A secure cloud architecture engineered for rapid digital hospital management, modern invoicing, and transparent financial operations.
          </p>
        </div>
        
        <div class="pt-2 flex justify-center md:justify-start opacity-75">
          <HeartbeatLine />
        </div>
      </div>

    </main>

    <AppFooter />

    <transition name="fade">
      <div
        v-if="forgotPasswordModal"
        class="fixed inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-md z-50 p-4"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 relative space-y-4">
          <div class="text-center">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Enter your credentials below to request a security recovery link.
            </p>
          </div>
          
          <div>
            <input
              type="email"
              v-model="forgotEmail"
              placeholder="name@hospital.com"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
          
          <p v-if="forgotMessage" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center font-medium">
            {{ forgotMessage }}
          </p>
          <p v-if="forgotError" class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 text-center font-medium">
            {{ forgotError }}
          </p>
          
          <div class="flex gap-3 pt-2">
            <button
              @click="sendForgotPassword"
              class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Send Reset Link
            </button>
            <button
              @click="forgotPasswordModal = false"
              class="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-all"
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useTawk } from "@/composables/useTawk";
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

import HeartbeatLine from "@/components/HeartbeatLine.vue";
import AppFooter from "@/components/AppFooter.vue";

import { useNotifications } from "@/composables/useNotifications";

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
const { loadTawk, unloadTawk } = useTawk();
const { success, error: notifyError } = useNotifications();

onMounted(() => {
  loadTawk();
});

onUnmounted(() => {
  unloadTawk();
});

const loginUser = async () => {
  if (!email.value || !password.value) return;
  
  errorMessage.value = "";
  showPopup.value = true;
  loginSuccess.value = false;
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
    if (!user.emailVerified) {
      errorMessage.value = "Please check your inbox and verify your email address.";
      notifyError(errorMessage.value);
      await signOut(auth);
      showPopup.value = false;
      return;
    }
    await routeByRole(user.uid);
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      errorMessage.value = "Invalid email or password.";
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage.value = "Too many failed attempts. Please try again later.";
    } else {
      errorMessage.value = "An error occurred during sign in.";
    }
    notifyError(errorMessage.value);
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
  } catch (err) {
    console.error(err);
    errorMessage.value = "Google sign-in failed.";
    notifyError(errorMessage.value);
    showPopup.value = false;
  }
};

const routeByRole = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      errorMessage.value = "User profile not found.";
      notifyError(errorMessage.value);
      showPopup.value = false;
      return;
    }
    const data = snap.data();
    if (data.status === "deactivated") {
      errorMessage.value = "This account has been deactivated.";
      notifyError(errorMessage.value);
      await signOut(auth);
      showPopup.value = false;
      return;
    }
    loginSuccess.value = true;
    success(`Welcome back, ${data.username || 'User'}!`);
    setTimeout(() => {
      showPopup.value = false;
      router.push(data.role === "admin" ? "/admin-dashboard" : "/dashboard");
    }, 1000);
  } catch (err) {
    console.error(err);
    errorMessage.value = "Failed to fetch user role.";
    notifyError(errorMessage.value);
    showPopup.value = false;
  }
};

const sendForgotPassword = async () => {
  forgotMessage.value = "";
  forgotError.value = "";
  if (!forgotEmail.value) {
    forgotError.value = "Please specify a registered account email.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, forgotEmail.value.trim());
    forgotMessage.value = "✅ Reset tracking token sent! Please inspect your email inbox.";
    forgotEmail.value = "";
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      forgotError.value = "Identity records do not contain this email.";
    } else if (err.code === "auth/invalid-email") {
      forgotError.value = "Improperly formatted email string.";
    } else {
      forgotError.value = "Cryptographic hand-off failed. Try again later.";
    }
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>