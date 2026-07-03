import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';

export const updatePreferences = (data) =>
  api.patch(ENDPOINTS.AUTH.UPDATE_PREFERENCES, data).then((r) => r.data.data);
