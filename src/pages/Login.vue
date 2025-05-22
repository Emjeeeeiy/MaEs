<template>
  <div class="min-h-screen bg-gradient-to-br from-green-300 to-green-700">
    <!-- Topbar -->
    <login_topbar />

    <div class="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-60px)] px-4 py-12">
      <!-- Info Card -->
      <div class="w-full lg:w-1/2 max-w-xl bg-white p-8 rounded-lg shadow-md mb-8 lg:mb-0 lg:mr-8">
        <h2 class="text-3xl font-bold text-green-700 mb-4">Welcome to Our System</h2>
        <p class="text-gray-700 mb-4">
          This platform provides a secure and efficient environment for managing hospital billing, feedback, user roles, and more.
        </p>
        <ul class="list-disc list-inside text-gray-600">
          <li>Role-based access control</li>
          <li>Integrated billing feedback</li>
          <li>Responsive and secure design</li>
        </ul>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="loginUser" class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h2>

        <!-- Error Message -->
        <p v-if="errorMessage" class="mb-4 text-sm text-red-600 text-center">{{ errorMessage }}</p>

        <!-- Email -->
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

        <!-- Password -->
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
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import login_topbar from "@/components/login_topbar.vue";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showResendVerification = ref(false);
const showPassword = ref(false);
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
