import api from '../../../api/interceptors';
import { ENDPOINTS } from '../../../api/endpoints';

export const getMeetings = (params) =>
  api.get(ENDPOINTS.MEETINGS.LIST, { params }).then((r) => r.data.data);

export const getMeeting = (id) =>
  api.get(ENDPOINTS.MEETINGS.GET(id)).then((r) => r.data.data);

export const createMeeting = (data) =>
  api.post(ENDPOINTS.MEETINGS.CREATE, data).then((r) => r.data.data);

export const updateMeeting = (id, data) =>
  api.patch(ENDPOINTS.MEETINGS.UPDATE(id), data).then((r) => r.data.data);

export const deleteMeeting = (id) =>
  api.delete(ENDPOINTS.MEETINGS.DELETE(id));
