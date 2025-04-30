import { createRouter, createWebHistory } from 'vue-router';

import Login from '../pages/login.vue';
import dashboard from '../pages/dashboard.vue';

const routes = [
  { path: '/', redirect: '/login'  },
  { path: '/login',name: 'Login',component: Login,  },
  { path: '/dashboard',name: 'Dashboard',component: dashboard,  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


