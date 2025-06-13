<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- System Name / Logo -->
        <div class="text-xl font-bold text-green-700">MaEs</div>

        <!-- Auth Navigation -->
        <nav class="flex gap-6 items-center text-gray-700">
          <button
            @click="showLoginModal = true"
            class="hover:text-green-600 font-medium bg-transparent border border-green-600 rounded px-3 py-1 transition"
          >
            Login
          </button>
          <router-link to="/register" class="hover:text-green-600 font-medium">Register</router-link>
          <router-link to="/about" class="hover:text-green-600 text-sm hidden sm:inline">About</router-link>
        </nav>
      </div>
    </div>

    <!-- Modal Overlay -->
    <div
      v-if="showLoginModal"
      @click.self="showLoginModal = false"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
    >
      <!-- Modal Content -->
      <form
        @submit.prevent="loginUser"
        class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg relative"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="showLoginModal = false"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <!-- Heading -->
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h2>

        <!-- Error Message -->
        <p v-if="errorMessage" class="mb-4 text-sm text-red-600 text-center">{{ errorMessage }}</p>

        <!-- Email Field -->
        <div class="mb-4">
          <label class="block mb-1 text-gray-700">Email</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your email"
          />
        </div>

        <!-- Password Field -->
        <div class="mb-4 relative">
          <label class="block mb-1 text-gray-700">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your password"
          />
          <button
            type="button"
            @click="toggleShowPassword"
            class="absolute inset-y-0 right-3 text-sm text-green-600"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <!-- Resend Verification -->
        <button
          v-if="showResendVerification"
          @click="resendVerification"
          type="button"
          class="w-full mb-4 text-sm text-green-700 hover:underline"
        >
          Resend Verification Email
        </button>

        <!-- Login Button -->
        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>

        <!-- Google Sign-In -->
        <button
          @click="loginWithGoogle"
          type="button"
          class="w-full mt-4 bg-white border border-gray-300 py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-100 transition"
        >
          <img
            src="@/assets/google-icon.png"
            alt="Google Logo"
            class="w-5 h-5"
          />
          <span class="text-gray-700">Sign in with Google</span>
        </button>

        <router-link
          to="/reset_password"
          class="text-gray-800 text-sm hover:text-green-600 block mt-3 text-center"
        >
          Forgot Password?
        </router-link>
      </form>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showResendVerification = ref(false);
const showPassword = ref(false);
const showLoginModal = ref(false);

const router = useRouter();
const auth = getAuth();

const loginUser = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    if (!user.emailVerified) {
      errorMessage.value = "Please verify your email before logging in.";
      showResendVerification.value = true;
      await signOut(auth);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.status === "deactivated") {
        errorMessage.value = "Your account has been deactivated. Contact support.";
        await signOut(auth);
        return;
      }

      if (userData.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
      showLoginModal.value = false;
    } else {
      errorMessage.value = "User data not found.";
    }
  } catch (error) {
    errorMessage.value = "Invalid email or password.";
  }
};

const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      errorMessage.value = "User not registered. Please register first.";
      await signOut(auth);
      return;
    }

    const userData = userSnap.data();
    if (userData.status === "deactivated") {
      errorMessage.value = "Your account has been deactivated. Contact support.";
      await signOut(auth);
      return;
    }

    if (userData.role === "admin") {
      router.push("/admin-dashboard");
    } else {
      router.push("/dashboard");
    }
    showLoginModal.value = false;
  } catch (error) {
    errorMessage.value = "Google Sign-In Failed: " + error.message;
  }
};

const resendVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      errorMessage.value = "Verification email sent!";
    }
  } catch (error) {
    errorMessage.value = "Error sending verification email.";
  }
};

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>
