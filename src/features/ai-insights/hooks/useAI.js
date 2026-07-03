import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { analyzeAll, generateInsights, extractActionItems } from '../services/ai.service';
import { MEETING_KEYS } from '../../meetings/hooks/useMeetings';

export const useAnalyzeAll = (meetingId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts) => analyzeAll(meetingId, opts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(meetingId) });
      toast.success('Analysis complete');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Analysis failed'),
  });
};

export const useGenerateInsights = (meetingId) =>
  useMutation({
    mutationFn: (opts) => generateInsights(meetingId, opts),
    onSuccess: () => toast.success('Insights generated'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });
