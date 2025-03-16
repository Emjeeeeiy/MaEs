<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h2>Log In</h2><br><br>
      <form @submit.prevent="loginUser">
        <div class="input-group">
          <input type="email" v-model="email" placeholder="Email" required />
        </div>
        <div class="input-group password-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
            required
          />
          <button type="button" @click="toggleShowPassword" class="toggle-password-btn">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <button type="submit" class="btn primary-btn">Login</button>
        <button @click="loginWithGoogle" type="button" class="btn google-btn">
          <img src="@/assets/google-icon.png" alt="Google Logo" /> Sign in with Google
        </button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <button v-if="showResendVerification" @click="resendVerification" class="btn link-btn">
        Resend Verification Email
      </button>
      <hr/>
      <router-link to="/reset-password" class="link">Forgot Password?</router-link>
      <p class="register-msg">
        Don't have an account? <router-link to="/register" class="link">Register here</router-link>
      </p>
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
      // Redirect based on role
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

<style scoped>
/* Overall background with gradient */
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
}

/* Card Container */
.login-container {
  background: rgba(255, 255, 255, 0.97);
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

/* Headings & Tagline */
h2 {
  color: #2e7d32;
  margin-bottom: 5px;
  font-size: 36px;
}
.tagline {
  margin-bottom: 25px;
  font-size: 16px;
  color: #555;
}

/* Input Group Styling */
.input-group {
  margin-bottom: 20px;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
  background: #f9fbe7;
}
input:focus {
  border-color: #2e7d32;
}

/* Password Input with Toggle Button */
.password-group {
  position: relative;
}
.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #388e3c;
  font-weight: bold;
  cursor: pointer;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  margin-bottom: 15px;
  transition: background 0.3s, transform 0.2s;
}
.primary-btn {
  background-color: #388e3c;
  color: white;
}
.primary-btn:hover {
  background-color: #2e7d32;
  transform: scale(1.02);
}
.google-btn {
  background-color: #f1f1f1;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}
.google-btn:hover {
  background-color: #e0e0e0;
  transform: scale(1.02);
}
.google-btn img {
  width: 22px;
  margin-right: 10px;
}

/* Link Buttons and Messages */
.link-btn {
  background: none;
  color: #2e7d32;
  font-size: 14px;
  padding: 0;
  margin-bottom: 10px;
}
.link {
  color: #2e7d32;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.register-msg {
  font-size: 14px;
  color: #555;
}

/* Error Message */
.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 10px;
}
</style>
