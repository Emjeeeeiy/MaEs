import { ref } from 'vue';

const notifications = ref([]);

export function useNotifications() {
  const notify = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    notifications.value.push({ id, message, type });
    setTimeout(() => {
      remove(id);
    }, duration);
  };

  const remove = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const success = (message, duration) => notify(message, 'success', duration);
  const error = (message, duration) => notify(message, 'error', duration);
  const info = (message, duration) => notify(message, 'info', duration);
  const warning = (message, duration) => notify(message, 'warning', duration);

  return {
    notifications,
    notify,
    remove,
    success,
    error,
    info,
    warning,
  };
}
