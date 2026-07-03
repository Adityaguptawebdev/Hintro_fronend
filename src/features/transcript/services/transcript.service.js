import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';

export const getTranscript = (meetingId) =>
  api.get(ENDPOINTS.TRANSCRIPTS.GET(meetingId)).then((r) => r.data.data);

export const saveTranscript = (meetingId, data) =>
  api.post(ENDPOINTS.TRANSCRIPTS.CREATE(meetingId), data).then((r) => r.data.data);

export const deleteTranscript = (meetingId) =>
  api.delete(ENDPOINTS.TRANSCRIPTS.DELETE(meetingId));
