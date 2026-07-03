import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';

export const getNotifications = (params) =>
  api.get(ENDPOINTS.NOTIFICATIONS.LIST, { params }).then((r) => r.data.data);

export const markNotificationRead = (id) =>
  api.patch(ENDPOINTS.NOTIFICATIONS.READ(id)).then((r) => r.data.data);

export const markAllNotificationsRead = () =>
  api.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL).then((r) => r.data);
