import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInsights, getSummary } from '../services/insight.service';

export const INSIGHT_KEYS = {
  insights: (meetingId) => ['insights', meetingId],
  summary: (meetingId) => ['summary', meetingId],
};

export const useInsights = (meetingId) =>
  useQuery({
    queryKey: INSIGHT_KEYS.insights(meetingId),
    queryFn: () => getInsights(meetingId),
    enabled: !!meetingId,
  });

export const useSummary = (meetingId) =>
  useQuery({
    queryKey: INSIGHT_KEYS.summary(meetingId),
    queryFn: () => getSummary(meetingId),
    enabled: !!meetingId,
  });
