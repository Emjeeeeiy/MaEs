import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import Login from '@/pages/login.vue';
import Register from '../pages/register.vue';
import reset_password from '../pages/reset_password.vue';
import Dashboard from '../pages/user-pages/dashboard.vue';
import Payments from '../pages/user-pages/payments.vue';
import Billing from '../pages/user-pages/billing.vue';
import Invoices from '../pages/user-pages/invoices.vue';
import AdminDashboard from '../pages/admin-pages/admin_dasboard.vue';
import AdminInvoices from '../pages/admin-pages/admin_invoices.vue';
import admin_management from '../pages/admin-pages/admin_management.vue';
import settings from '../pages/user-pages/settings.vue';
import profile from '../pages/user-pages/profile.vue';
import report from '../pages/user-pages/report.vue';
import admin_services from '../pages/admin-pages/admin_services.vue';
import edit_profile from '../pages/user-pages/edit_profile.vue';
import admin_feedback from '../pages/admin-pages/admin_feedback.vue';
import appointment from '../pages/user-pages/appointment.vue';
import admin_appointment from '../pages/admin-pages/admin_appointment.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/reset_password', name: 'ResetPassword', component: reset_password },

  // User Routes
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/payments', name: 'Payments', component: Payments },
  { path: '/billing', name: 'Billing', component: Billing },
  { path: '/invoices', name: 'Invoices', component: Invoices },
  { path: '/settings', name: 'Settings', component: settings },
  { path: '/profile', name: 'Profile', component: profile },
  { path : '/report', name: 'Report', component: report },
  { path: '/edit_profile', name: 'EditProfile', component: edit_profile }, 
  { path: '/appointment', name: 'Appointment', component: appointment }, 

  // Admin Routes
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-invoices', name: 'AdminInvoices', component: AdminInvoices, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-management', name: 'AdminManagement', component: admin_management, meta: { requiresAdmin: true, role: 'admin' },},  
  { path: '/admin-services', name: 'AdminServices', component: admin_services, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-feedback', name: 'AdminFeedback', component: admin_feedback, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-appointment', name: 'AdminAppointment', component: admin_appointment, meta: { requiresAdmin: true, role: 'admin' },},

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 Navigation Guard for Admin Access
router.beforeEach(async (to, from, next) => {
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (!requiresAdmin) return next();

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return next('/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;

    if (role === 'admin') {
      next();
    } else {
      next('/dashboard'); // Redirect regular users
    }
  } catch (err) {
    console.error('Route guard error:', err);
    next('/login');
  }
});

export default router;