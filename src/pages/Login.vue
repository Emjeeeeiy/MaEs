<template>
  <div class="min-h-screen bg-gradient-to-br from-green-300 to-green-700">
    <!-- Topbar -->
    <login_topbar />

    <div
      class="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-60px)] px-4 py-12"
    >
      <!-- Info Card with transparent blur -->
      <div
        class="w-full lg:w-1/2 max-w-xl bg-white/30 backdrop-blur-md border border-white/30 p-8 rounded-lg shadow-md mb-8 lg:mb-0 lg:mr-8 text-white"
      >
        <h2 class="text-3xl font-bold mb-4">Welcome</h2>
        <p class="mb-4">
          This platform provides a secure and efficient environment for managing hospital billing, feedback, user roles, and more.
        </p>
        <ul class="list-disc list-inside mb-6 space-y-1">
          <li>Role-based access control</li>
          <li>Integrated billing feedback</li>
          <li>Responsive and secure design</li>
        </ul>
      </div>
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
  signInWithPopup,
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
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
