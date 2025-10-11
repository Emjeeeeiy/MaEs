<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center"
    style="background-image: url('/MaEs_bg.png');"
  >
    <form
      @submit.prevent="registerUser"
      class="w-full max-w-md bg-white/85 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-left"
    >
      <!-- Title -->
      <h2 class="text-2xl font-bold text-green-700 mb-2">Create Account</h2>
      <p class="text-sm text-gray-600 mb-5">
        Join us and manage your hospital billing seamlessly.
      </p>

      <!-- Error Message -->
      <p v-if="errorMessage" class="mb-4 text-sm text-red-600">{{ errorMessage }}</p>

      <!-- Username -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-800 mb-1">Username</label>
        <input
          type="text"
          v-model="username"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your username"
        />
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-800 mb-1">Email</label>
        <input
          type="email"
          v-model="email"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your email"
        />
      </div>

      <!-- Password -->
      <div class="mb-4 relative">
        <label class="block text-sm font-medium text-gray-800 mb-1">Password</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm pr-10 bg-gray-100/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Create a password"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 mt-6"
        >
          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
      </div>

      <!-- Confirm Password -->
      <div class="mb-5 relative">
        <label class="block text-sm font-medium text-gray-800 mb-1">Confirm Password</label>
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm pr-10 bg-gray-100/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 mt-6"
        >
          <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
      </div>

      <!-- ✅ Password Validation List -->
      <ul class="mb-5 text-sm space-y-1">
        <li :class="passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'">
          • Must contain at least one uppercase and one lowercase letter
        </li>
        <li :class="passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'">
          • Must contain at least one number
        </li>
        <li :class="passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'">
          • Must contain at least one special character (!@#$%^&*)
        </li>
        <li :class="passwordValidation.minLength ? 'text-green-600' : 'text-red-500'">
          • Must be at least 8 characters long
        </li>
        <li :class="passwordsMatch ? 'text-green-600' : 'text-red-500'">
          • Passwords must match
        </li>
      </ul>

      <!-- ✅ Terms and Privacy Checkboxes -->
      <div class="mb-5 space-y-3 text-sm text-gray-700">
        <label class="flex items-start gap-2">
          <input type="checkbox" v-model="acceptedTerms" class="mt-1" />
          <span>
            I agree to the
            <button
              type="button"
              @click="showTermsModal = true"
              class="text-green-700 hover:underline font-semibold"
            >
              Terms and Conditions
            </button>
          </span>
        </label>

        <label class="flex items-start gap-2">
          <input type="checkbox" v-model="acceptedPrivacy" class="mt-1" />
          <span>
            I accept the
            <button
              type="button"
              @click="showPrivacyModal = true"
              class="text-green-700 hover:underline font-semibold"
            >
              Data Privacy Policy
            </button>
          </span>
        </label>
      </div>

      <!-- Register Button -->
      <button
        type="submit"
        :disabled="!acceptedTerms || !acceptedPrivacy || !isPasswordValid"
        class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
      >
        Register
      </button>

      <!-- Divider -->
      <div class="my-5 flex items-center justify-between">
        <hr class="w-full border-gray-300" />
        <span class="text-sm text-gray-500 px-2">or</span>
        <hr class="w-full border-gray-300" />
      </div>

      <!-- Google Registration -->
      <button
        @click="registerWithGoogle"
        type="button"
        class="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <img src="@/assets/google-icon.png" alt="Google" class="w-5 h-5" />
        <span class="text-sm text-gray-800 font-medium">Continue with Google</span>
      </button>

      <!-- Back to login -->
      <p class="mt-5 text-sm text-gray-700">
        Already have an account?
        <router-link to="/login" class="text-green-700 font-semibold hover:underline">
          Login
        </router-link>
      </p>

      <!-- Back to Home -->
      <div class="mt-3">
        <router-link
          to="/"
          class="inline-block text-sm text-gray-700 hover:text-green-700 hover:underline transition"
        >
          ← Back to Home
        </router-link>
      </div>
    </form>

    <!-- 💬 Terms Modal -->
    <div v-if="showTermsModal" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div class="bg-white p-6 rounded-2xl max-w-2xl w-full shadow-lg max-h-[80vh] overflow-y-auto text-left">
        <h3 class="text-lg font-semibold mb-3 text-green-700">Terms and Conditions</h3>
        <div class="text-sm text-gray-700 space-y-4">
          <p><strong>1. Acceptance of Terms:</strong> By registering, you agree to comply with the hospital’s policies and this system’s operational guidelines. If you disagree, do not proceed with registration.</p>
          <p><strong>2. Eligibility and Registration:</strong> Only authorized hospital staff may create an account. You must provide complete, accurate, and updated information during registration.</p>
          <p><strong>3. User Responsibilities:</strong> Users must ensure that all patient and hospital data entered are accurate. Misuse or falsification may lead to account suspension or termination.</p>
          <p><strong>4. Confidentiality and Security:</strong> You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
          <p><strong>5. Data Integrity:</strong> Users shall not intentionally modify, delete, or corrupt system data. Any breach may lead to legal or disciplinary action.</p>
          <p><strong>6. Account Termination:</strong> Your account may be terminated automatically if employment ends or if you violate any of these terms.</p>
          <p><strong>7. Amendments:</strong> The hospital reserves the right to modify these Terms at any time. Continued use of the system implies acceptance of any updates.</p>
        </div>
        <div class="mt-4 text-right">
          <button
            @click="showTermsModal = false"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- 💬 Privacy Modal -->
    <div v-if="showPrivacyModal" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div class="bg-white p-6 rounded-2xl max-w-2xl w-full shadow-lg max-h-[80vh] overflow-y-auto text-left">
        <h3 class="text-lg font-semibold mb-3 text-green-700">Data Privacy Policy</h3>
        <div class="text-sm text-gray-700 space-y-4">
          <p><strong>1. Collection of Data:</strong> We collect personal information such as your name, email, and employment details for registration and account management.</p>
          <p><strong>2. Use of Data:</strong> Collected information is used only for hospital billing operations, communication, and system access authorization.</p>
          <p><strong>3. Data Protection:</strong> We apply industry-standard security measures to protect your personal data from unauthorized access or misuse.</p>
          <p><strong>4. Data Sharing:</strong> Your data will not be shared with external parties without your consent, except as required by law or hospital policy.</p>
          <p><strong>5. Data Retention:</strong> Personal information will be retained only for as long as necessary for hospital administration and legal compliance.</p>
          <p><strong>6. User Rights:</strong> You may request to access, correct, or delete your personal information by contacting the hospital administrator.</p>
          <p><strong>7. Consent:</strong> By registering, you consent to the collection and processing of your data as described in this policy.</p>
        </div>
        <div class="mt-4 text-right">
          <button
            @click="showPrivacyModal = false"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const acceptedTerms = ref(false);
const acceptedPrivacy = ref(false);
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);

const router = useRouter();
const auth = getAuth();

// ✅ Password validation
const passwordValidation = computed(() => ({
  hasUppercase: /[A-Z]/.test(password.value) && /[a-z]/.test(password.value),
  hasNumber: /\d/.test(password.value),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password.value),
  minLength: password.value.length >= 8
}));

const passwordsMatch = computed(() => password.value === confirmPassword.value);

const isPasswordValid = computed(
  () =>
    passwordValidation.value.hasUppercase &&
    passwordValidation.value.hasNumber &&
    passwordValidation.value.hasSpecial &&
    passwordValidation.value.minLength &&
    passwordsMatch.value
);

const registerUser = async () => {
  if (!isPasswordValid.value) {
    errorMessage.value = "Please meet all password requirements before registering.";
    return;
  }

  if (!acceptedTerms.value || !acceptedPrivacy.value) {
    errorMessage.value = "Please accept the Terms and Privacy Policy before proceeding.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username.value });
    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      username: username.value,
      email: email.value,
      role: "user",
      status: "active"
    });

    alert("Registration successful! Please check your email for verification.");
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    errorMessage.value = `Registration failed: ${error.message}`;
  }
};

const registerWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      errorMessage.value = "User already registered. Please login.";
      await signOut(auth);
      router.push("/login");
      return;
    }

    await setDoc(userRef, {
      username: user.displayName,
      email: user.email,
      role: "user",
      status: "active"
    });

    alert("Registration successful!");
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Google Registration Failed: " + error.message;
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

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
>
