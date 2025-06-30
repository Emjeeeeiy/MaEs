<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2 shrink-0">
          <img src="/MaEs_logo2.png" alt="MaEs Logo" class="w-8 h-8 object-contain" />
          <span class="text-xl font-bold text-green-700">MaEs</span>
        </div>

        <!-- Center: Navigation -->
        <nav class="hidden sm:flex gap-6 items-center text-gray-700">
          <button
            @click="showLoginModal = true"
            class="hover:text-green-600 font-medium border border-green-600 px-3 py-1 rounded transition"
          >
            Login
          </button>
          <router-link to="/register" class="hover:text-green-600 font-medium">Register</router-link>
          <router-link to="/about" class="hover:text-green-600 font-medium">About</router-link>
        </nav>

        <!-- Right: Social Icons -->
        <nav class="flex gap-4 items-center text-gray-600">
          <a href="https://www.facebook.com" target="_blank" class="hover:text-green-600" aria-label="Facebook">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12.07C22 6.477 17.523 2 12 2S2 6.477 2 12.07c0 5.012 3.657 9.163 8.438 9.877v-6.995H7.898v-2.882h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.464h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.882h-2.33v6.995C18.343 21.233 22 17.082 22 12.07z"/></svg>
          </a>
          <a href="https://www.instagram.com" target="_blank" class="hover:text-green-600" aria-label="Instagram">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 1.5A4.26 4.26 0 0 0 3.5 7.75v8.5A4.26 4.26 0 0 0 7.75 20.5h8.5A4.26 4.26 0 0 0 20.5 16.25v-8.5A4.26 4.26 0 0 0 16.25 3.5h-8.5Zm8 2.25a.75.75 0 1 1 1.5 0v1.5a.75.75 0 1 1-1.5 0Zm-4.25 1a4.75 4.75 0 1 1 0 9.5a4.75 4.75 0 0 1 0-9.5Zm0 1.5a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 0 0 0-6.5Z"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" class="hover:text-green-600" aria-label="X / Twitter">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 4.26c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37a8.59 8.59 0 0 1-2.73 1.04a4.28 4.28 0 0 0-7.29 3.9A12.15 12.15 0 0 1 3 3.16a4.28 4.28 0 0 0 1.33 5.72A4.25 4.25 0 0 1 2.8 8.3v.05a4.28 4.28 0 0 0 3.44 4.19a4.28 4.28 0 0 1-1.92.07a4.28 4.28 0 0 0 4 2.97a8.58 8.58 0 0 1-5.32 1.84A8.72 8.72 0 0 1 2 17.7a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.55A8.67 8.67 0 0 0 22 4.26Z"/></svg>
          </a>
        </nav>
      </div>
    </div>

    <!-- Login Modal -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
    >
      <form @submit.prevent="loginUser" class="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
        <button
          type="button"
          @click="showLoginModal = false"
          class="absolute top-2 right-3 text-2xl text-gray-600 hover:text-black"
        >
          &times;
        </button>

        <h2 class="text-xl font-bold text-center mb-4">Login</h2>

        <p v-if="errorMessage" class="text-sm text-red-600 mb-2 text-center">
          {{ errorMessage }}
        </p>

        <label class="block mb-2 text-sm">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="Email"
          class="w-full border px-3 py-2 mb-4 rounded text-sm"
        />

        <label class="block mb-2 text-sm">Password</label>
        <div class="relative mb-4">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            placeholder="Password"
            class="w-full border px-3 py-2 rounded text-sm"
          />
          <button
            type="button"
            @click="toggleShowPassword"
            class="absolute inset-y-0 right-3 text-green-600 text-xs"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <button
          v-if="showResendVerification"
          @click="resendVerification"
          type="button"
          class="text-sm text-green-700 hover:underline w-full mb-4"
        >
          Resend Verification Email
        </button>

        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>

        <button
          type="button"
          @click="loginWithGoogle"
          class="w-full mt-4 flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-100 transition"
        >
          <img src="@/assets/google-icon.png" alt="Google" class="w-5 h-5" />
          <span class="text-gray-700 text-sm">Sign in with Google</span>
        </button>

        <router-link
          to="/reset_password"
          class="block mt-3 text-center text-sm text-gray-800 hover:text-green-600"
        >
          Forgot Password?
        </router-link>
      </form>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const showResendVerification = ref(false);
const showPassword = ref(false);
const showLoginModal = ref(false);

const router = useRouter();
const auth = getAuth();

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const loginUser = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    if (!user.emailVerified) {
      errorMessage.value = 'Please verify your email.';
      showResendVerification.value = true;
      await signOut(auth);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.status === 'deactivated') {
        errorMessage.value = 'Account deactivated.';
        await signOut(auth);
        return;
      }

      router.push(userData.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      showLoginModal.value = false;
    } else {
      errorMessage.value = 'User data not found.';
    }
  } catch (err) {
    errorMessage.value = 'Invalid email or password.';
  }
};

const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      errorMessage.value = 'User not registered.';
      await signOut(auth);
      return;
    }

    const userData = userSnap.data();
    if (userData.status === 'deactivated') {
      errorMessage.value = 'Account deactivated.';
      await signOut(auth);
      return;
    }

    router.push(userData.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    showLoginModal.value = false;
  } catch (err) {
    errorMessage.value = 'Google login failed.';
  }
};

const resendVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      errorMessage.value = 'Verification email sent!';
    }
  } catch (err) {
    errorMessage.value = 'Error sending email.';
  }
};
</script>
