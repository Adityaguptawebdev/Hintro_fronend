import api from '../../../api/interceptors';
import { ENDPOINTS } from '../../../api/endpoints';

export const summarize = (meetingId, opts = {}) =>
  api.post(ENDPOINTS.AI.SUMMARIZE(meetingId), opts).then((r) => r.data.data);

export const extractActionItems = (meetingId, opts = {}) =>
  api.post(ENDPOINTS.AI.EXTRACT_ACTIONS(meetingId), opts).then((r) => r.data.data);

export const generateInsights = (meetingId, opts = {}) =>
  api.post(ENDPOINTS.AI.INSIGHTS(meetingId), opts).then((r) => r.data.data);

export const analyzeAll = (meetingId, opts = {}) =>
  api.post(ENDPOINTS.AI.ANALYZE_ALL(meetingId), opts).then((r) => r.data.data);
