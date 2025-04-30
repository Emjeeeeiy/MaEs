import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './Router/router.js'
import Button from "primevue/button"
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';


createApp(App)
.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
.component('Button', Button)
.use(router)
.mount('#app')



