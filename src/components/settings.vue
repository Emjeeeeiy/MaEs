<template>
  <div class="settings-wrapper">
    <div class="settings-card">
      <h1>Hospital Billing Settings</h1>
      <p class="subtitle">Configure your billing system preferences</p>

      <!-- Invoice Settings Section -->
      <section class="settings-section">
        <div class="section-header">
          <i class="fas fa-file-invoice"></i>
          <h2>Invoice Template</h2>
        </div>
        <div class="fields-grid">
          <div class="field">
            <label for="invoice-logo">Invoice Logo URL:</label>
            <input type="text" id="invoice-logo" v-model="settings.invoiceLogo" placeholder="Enter logo URL" />
          </div>
          <div class="field">
            <label for="invoice-footer">Invoice Footer Text:</label>
            <textarea id="invoice-footer" v-model="settings.invoiceFooter" placeholder="Enter footer text"></textarea>
          </div>
        </div>
      </section>

      <!-- Payment Settings Section -->
      <!-- <section class="settings-section">
        <div class="section-header">
          <i class="fas fa-credit-card"></i>
          <h2>Payment Settings</h2>
        </div>
        <div class="fields-grid">
          <div class="field">
            <label for="payment-gateway">Payment Gateway:</label>
            <select id="payment-gateway" v-model="settings.paymentGateway">
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="square">Square</option>
            </select>
          </div>
          <div class="field">
            <label for="transaction-fee">Transaction Fee (%):</label>
            <input type="number" id="transaction-fee" v-model.number="settings.transactionFee" placeholder="Enter fee percentage" />
          </div>
        </div>
      </section> -->

      <!-- Notification Settings Section -->
      <section class="settings-section">
        <div class="section-header">
          <i class="fas fa-bell"></i>
          <h2>Notification Settings</h2>
        </div>
        <div class="fields-grid">
          <div class="field">
            <label>
              <input type="checkbox" v-model="settings.emailNotifications" />
              Enable Email Notifications
            </label>
          </div>
          <div class="field">
            <label>
              <input type="checkbox" v-model="settings.smsNotifications" />
              Enable SMS Notifications
            </label>
          </div>
        </div>
      </section>

      <!-- Button Group -->
      <div class="button-group">
        <button @click="saveSettings" class="btn primary-btn">Save Settings</button>
      </div>

      <router-link to="/dashboard" class="nav-button">
        <i class="fas fa-tachometer-alt"></i> back
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'HospitalBillingSettings',
  setup() {
    // Settings state for the billing system
    const settings = ref({
      invoiceLogo: '',
      invoiceFooter: '',
      paymentGateway: 'stripe',
      transactionFee: 0,
      emailNotifications: true,
      smsNotifications: false,
    });

    const saveSettings = () => {
      // In a real-world scenario, save these settings to your backend or Firestore.
      console.log("Settings saved:", settings.value);
      alert("Settings saved successfully!");
    };

    const logout = () => {
      // Trigger logout logic (e.g., Firebase signOut and route redirection)
      alert("Logging out...");
    };

    return { settings, saveSettings, logout };
  },
};
</script>

<style scoped>
/* Overall Wrapper with Gradient Background and Poppins font */
.settings-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
  font-family: 'Poppins', sans-serif;
  color: #333;
  padding: 20px;
}

/* Centered Card Container */
.settings-card {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;
  text-align: center;
}

/* Headings & Subtitles */
.settings-card h1 {
  font-size: 28px;
  color: #388e3c;
  margin-bottom: 5px;
}
.subtitle {
  color: #555;
  margin-bottom: 30px;
}

/* Settings Sections */
.settings-section {
  margin-bottom: 30px;
  background: #f1f8e9;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #388e3c;
}
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.section-header i {
  font-size: 24px;
  color: #388e3c;
  margin-right: 10px;
}
.section-header h2 {
  font-size: 20px;
  color: #388e3c;
  margin: 0;
}

/* Grid for Input Fields */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 600px) {
  .fields-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.field label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}
.field input[type="text"],
.field input[type="number"],
.field textarea,
.field select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 15px;
  background: #f9fbe7;
  transition: border 0.2s ease;
}
.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: #2e7d32;
}

/* Button Group */
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
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
.primary-btn {
  background: #2e7d32;
  color: #fff;
}
.primary-btn:hover {
  background: #1b5e20;
}
</style>
