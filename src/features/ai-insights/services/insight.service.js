import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';

export const getInsights = (meetingId) =>
  api.get(ENDPOINTS.AI.GET_INSIGHTS(meetingId)).then((r) => r.data.data);

export const getSummary = (meetingId) =>
  api.get(ENDPOINTS.AI.GET_SUMMARY(meetingId)).then((r) => r.data.data);
