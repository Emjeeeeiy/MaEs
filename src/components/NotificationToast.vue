<template>
  <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full sm:w-80">
    <TransitionGroup name="toast">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="p-4 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 pointer-events-auto cursor-pointer border backdrop-blur-md transition-all duration-300"
        :class="toastClasses(n.type)"
        @click="remove(n.id)"
      >
        <div class="shrink-0">
          <CheckCircle v-if="n.type === 'success'" class="w-5 h-5" />
          <AlertCircle v-else-if="n.type === 'error'" class="w-5 h-5" />
          <Info v-else-if="n.type === 'info'" class="w-5 h-5" />
          <AlertTriangle v-else class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <p class="leading-tight">{{ n.message }}</p>
        </div>
        <button @click.stop="remove(n.id)" class="opacity-50 hover:opacity-100 transition-opacity">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications';
import { useRoute } from 'vue-router';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next';
import { computed } from 'vue';

const { notifications, remove } = useNotifications();
const route = useRoute();

const isAdmin = computed(() => route.path.startsWith('/admin'));

const toastClasses = (type) => {
  if (isAdmin.value) {
    // Admin Design: Dark & Sharp (matches Admin Sidebar)
    switch (type) {
      case 'success': return 'bg-[#2d2d2d] border-green-500/50 text-green-400';
      case 'error': return 'bg-[#2d2d2d] border-red-500/50 text-red-400';
      case 'warning': return 'bg-[#2d2d2d] border-amber-500/50 text-amber-400';
      case 'info': return 'bg-[#2d2d2d] border-blue-500/50 text-blue-400';
      default: return 'bg-[#2d2d2d] border-gray-500/50 text-gray-400';
    }
  } else {
    // User Design: Modern & Rounded (matches User Layout)
    switch (type) {
      case 'success': return 'bg-white/90 border-teal-100 text-teal-700';
      case 'error': return 'bg-white/90 border-rose-100 text-rose-700';
      case 'warning': return 'bg-white/90 border-amber-100 text-amber-700';
      case 'info': return 'bg-white/90 border-sky-100 text-sky-700';
      default: return 'bg-white/90 border-slate-100 text-slate-700';
    }
  }
};
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
.toast-enter-from { 
  opacity: 0; 
  transform: translateX(30px) scale(0.9); 
}
.toast-leave-to { 
  opacity: 0; 
  transform: translateX(30px) scale(0.9); 
}
</style>
