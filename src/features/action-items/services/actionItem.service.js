import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';

export const getActionItems = (params) =>
  api.get(ENDPOINTS.ACTION_ITEMS.LIST, { params }).then((r) => r.data.data);

export const createActionItem = (data) =>
  api.post(ENDPOINTS.ACTION_ITEMS.CREATE, data).then((r) => r.data.data);

export const updateActionItemStatus = (id, status) =>
  api.patch(ENDPOINTS.ACTION_ITEMS.UPDATE_STATUS(id), { status }).then((r) => r.data.data);

export const getOverdueActionItems = () =>
  api.get(ENDPOINTS.ACTION_ITEMS.OVERDUE).then((r) => r.data.data);
