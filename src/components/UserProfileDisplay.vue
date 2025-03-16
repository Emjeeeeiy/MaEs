<template>
  <div class="profile-page">
    <div class="profile-card">
      <h2>Profile</h2>
      <!-- Profile Picture or Placeholder -->
      <div class="profile-img-container">
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="Profile Picture"
          class="profile-img"
        />
        <div v-else class="profile-placeholder">
          {{ username.charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- Profile Details -->
      <div class="profile-details">
        <p><strong>Username:</strong> {{ username || "Not provided" }}</p>
        <p><strong>Email:</strong> {{ email || "Not provided" }}</p>
        <p><strong>Complete Name:</strong> {{ completeName || "Not provided" }}</p>
        <p><strong>Age:</strong> {{ age || "Not provided" }}</p>
        <p><strong>Birthday:</strong> {{ birthday || "Not provided" }}</p>
        <p><strong>Cellphone Number:</strong> {{ cellphone || "Not provided" }}</p>
        <p><strong>Gender:</strong> {{ gender || "Not provided" }}</p>
        <p><strong>Address:</strong> {{ address || "Not provided" }}</p>
        <p>
          <strong>Account Status:</strong>
          <span :class="status === 'active' ? 'active' : 'deactivated'">{{ status }}</span>
        </p>
      </div>
      <p class="tagline">Manage your account information</p>

      <router-link to="/edit-profile" class="edit-profile-button">
        Edit Profile
      </router-link>

      <hr/>
      <router-link to="/dashboard" class="nav-button">
        <i class="fas fa-tachometer-alt"></i> back
      </router-link>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default {
  name: "UserProfileDisplay",
  setup() {
    const username = ref("");
    const email = ref("");
    const completeName = ref("");
    const age = ref("");
    const birthday = ref("");
    const cellphone = ref("");
    const gender = ref("");
    const address = ref("");
    const profileImageUrl = ref("");
    const status = ref("");
    const errorMessage = ref("");

    onMounted(async () => {
      const user = auth.currentUser;
      if (!user) {
        errorMessage.value = "User is not authenticated.";
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          username.value = data.username || "";
          email.value = data.email || "";
          completeName.value = data.completeName || "";
          age.value = data.age || "";
          birthday.value = data.birthday || "";
          cellphone.value = data.cellphone || "";
          gender.value = data.gender || "";
          address.value = data.address || "";
          profileImageUrl.value = data.profileImageUrl || "";
          status.value = data.status || "active";
        } else {
          errorMessage.value = "User profile not found.";
        }
      } catch (error) {
        errorMessage.value = "Error fetching profile data.";
      }
    });

    return {
      username,
      email,
      completeName,
      age,
      birthday,
      cellphone,
      gender,
      address,
      profileImageUrl,
      status,
      errorMessage,
    };
  },
};
</script>

<style scoped>
/* Overall background with gradient matching the login design */
.profile-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  font-family: 'Poppins', sans-serif;
  padding: 20px;
}

/* Profile Card Styling */
.profile-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* Headings & Tagline */
h2 {
  color: #388e3c;
  font-size: 32px;
  margin-bottom: 10px;
}
.tagline {
  color: #555;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Profile Image Styles */
.profile-img-container {
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
}
.profile-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #388e3c;
}
.profile-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #388e3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Profile Details */
.profile-details {
  text-align: left;
  background: #f1f8e9;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #388e3c;
  margin-bottom: 20px;
}
.profile-details p {
  font-size: 16px;
  margin: 10px 0;
  line-height: 1.5;
}

/* Status Colors */
.active {
  color: green;
  font-weight: bold;
}
.deactivated {
  color: red;
  font-weight: bold;
}

/* Edit Profile Button */
.edit-profile-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #388e3c;
  border: 2px solid #388e3c;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.edit-profile-button:hover {
  background-color: #388e3c;
  color: #fff;
}
/* Back Profile Button */
.nav-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #388e3c;
  border: 2px solid #388e3c;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.nav-button:hover {
  background-color: #388e3c;
  color: #fff;
}

/* Error Message */
.error-message {
  margin-top: 20px;
  font-size: 16px;
  color: red;
}
</style>
