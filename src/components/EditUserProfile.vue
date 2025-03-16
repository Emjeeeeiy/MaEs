<template>
  <div class="edit-profile-page">
    <div class="edit-profile-card">
      <h2>Edit Your Profile</h2>
      <p class="tagline">Update your information and manage your account</p>

      <!-- User Info Update Form -->
      <form @submit.prevent="updateProfileInfo" class="form-section">
        <div class="input-group">
          <input type="text" v-model="completeName" placeholder="Complete Name" required />
        </div>
        <div class="input-group">
          <input type="number" v-model="age" placeholder="Age" required />
        </div>
        <div class="input-group">
          <input type="date" v-model="birthday" required />
        </div>
        <div class="input-group">
          <input type="text" v-model="cellphone" placeholder="Cellphone Number" required />
        </div>
        <div class="input-group">
          <select v-model="gender" required>
            <option disabled value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div class="input-group">
          <input type="text" v-model="address" placeholder="Complete Address" required />
        </div>
        <button type="submit" class="btn primary-btn" :disabled="isLoading">
          Update Profile Info
        </button>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <hr />

      <!-- Profile Picture Upload Form -->
      <h3>Update Profile Picture</h3>
      <div class="form-section">
        <input type="file" @change="handleFileUpload" accept="image/*" />
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="Profile Picture Preview"
          class="profile-img-preview"
        />
        <button @click="updateProfileImage" class="btn primary-btn" :disabled="isLoading">
          Upload Profile Picture
        </button>
        <p v-if="uploadMessage" class="success-message">{{ uploadMessage }}</p>
        <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
      </div>

      <hr />

      <!-- Account Deactivation -->
      <h3>Deactivate Account</h3>
      <button class="btn deactivate-btn" @click="showDeactivateModal = true">
        Deactivate Account
      </button>

      <!-- Deactivation Confirmation Modal -->
      <div v-if="showDeactivateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>Confirm Deactivation</h3>
          <p>Please enter your password to proceed.</p>
          <input type="password" v-model="password" placeholder="Enter password" />
          <p v-if="deactivateError" class="error-message">{{ deactivateError }}</p>
          <div class="modal-buttons">
            <button @click="confirmDeactivation" class="btn primary-btn">Confirm</button>
            <button @click="closeModal" class="btn secondary-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: "EditUserProfile",
  setup() {
    const completeName = ref("");
    const age = ref("");
    const birthday = ref("");
    const cellphone = ref("");
    const gender = ref("");
    const address = ref("");
    const profileImageUrl = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const uploadMessage = ref("");
    const uploadError = ref("");
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const router = useRouter();
    const user = auth.currentUser;
    const showDeactivateModal = ref(false);
    const password = ref("");
    const deactivateError = ref("");

    onMounted(async () => {
      if (!user) {
        router.push("/login");
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        completeName.value = data.completeName || "";
        age.value = data.age || "";
        birthday.value = data.birthday || "";
        cellphone.value = data.cellphone || "";
        gender.value = data.gender || "";
        address.value = data.address || "";
        profileImageUrl.value = data.profileImageUrl || "";
      }
    });

    const updateProfileInfo = async () => {
      if (!user) {
        errorMessage.value = "User is not authenticated.";
        return;
      }
      isLoading.value = true;
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          completeName: completeName.value,
          age: age.value,
          birthday: birthday.value,
          cellphone: cellphone.value,
          gender: gender.value,
          address: address.value,
        });
        successMessage.value = "Profile updated successfully!";
        setTimeout(() => router.push("/profile-display"), 2000);
      } catch (error) {
        errorMessage.value = "Failed to update profile info.";
      } finally {
        isLoading.value = false;
      }
    };

    const handleFileUpload = (event) => {
      selectedFile.value = event.target.files[0];
    };

    const updateProfileImage = async () => {
      if (!user) {
        uploadError.value = "User is not authenticated.";
        return;
      }
      if (!selectedFile.value) {
        uploadError.value = "Please select an image to upload.";
        return;
      }
      isLoading.value = true;
      try {
        const fileRef = storageRef(storage, `profile_pictures/${user.uid}-${Date.now()}`);
        await uploadBytes(fileRef, selectedFile.value);
        const imageUrl = await getDownloadURL(fileRef);
        if (!imageUrl) throw new Error("Upload failed.");
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { profileImageUrl: imageUrl });
        profileImageUrl.value = imageUrl;
        uploadMessage.value = "Profile picture updated!";
      } catch (error) {
        uploadError.value = "Failed to upload profile picture.";
      } finally {
        isLoading.value = false;
      }
    };

    const confirmDeactivation = async () => {
      if (!password.value.trim()) {
        deactivateError.value = "Please enter your password.";
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, user.email, password.value);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { status: "deactivated" });
        alert("Your account has been deactivated.");
        auth.signOut();
        router.push("/login");
      } catch (error) {
        deactivateError.value = "Incorrect password. Please try again.";
      }
    };

    const closeModal = () => {
      showDeactivateModal.value = false;
      password.value = "";
      deactivateError.value = "";
    };

    return {
      completeName,
      age,
      birthday,
      cellphone,
      gender,
      address,
      profileImageUrl,
      errorMessage,
      successMessage,
      uploadMessage,
      uploadError,
      isLoading,
      handleFileUpload,
      updateProfileInfo,
      updateProfileImage,
      showDeactivateModal,
      confirmDeactivation,
      closeModal,
      password,
      deactivateError,
    };
  },
};
</script>

<style scoped>
/* Overall background with gradient similar to login design */
.edit-profile-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  padding: 20px;
  font-family: 'Poppins', sans-serif;
}

/* Centered card container */
.edit-profile-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* Headings & Tagline */
.edit-profile-card h2 {
  color: #388e3c;
  font-size: 32px;
  margin-bottom: 5px;
}
.tagline {
  color: #555;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Form Section */
.form-section {
  margin-bottom: 30px;
  text-align: left;
}
.input-group {
  margin-bottom: 15px;
}
.input-group input,
.input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  font-size: 15px;
  background: #f9fbe7;
  transition: border 0.2s;
}
.input-group input:focus,
.input-group select:focus {
  border-color: #2e7d32;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  margin-top: 10px;
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
.deactivate-btn {
  background-color: #d32f2f;
  color: white;
}
.deactivate-btn:hover {
  background-color: #c62828;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.modal-content input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  background: #f9fbe7;
  transition: border 0.2s;
}
.modal-content input:focus {
  border-color: #2e7d32;
}
.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Success & Error Messages */
.success-message {
  color: green;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>
