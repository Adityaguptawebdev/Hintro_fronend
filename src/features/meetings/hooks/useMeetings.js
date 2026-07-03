import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMeetings, getMeeting, createMeeting, updateMeeting, deleteMeeting } from '../services/meeting.service';

export const MEETING_KEYS = {
  all: ['meetings'],
  lists: () => [...MEETING_KEYS.all, 'list'],
  list: (params) => [...MEETING_KEYS.lists(), params],
  details: () => [...MEETING_KEYS.all, 'detail'],
  detail: (id) => [...MEETING_KEYS.details(), id],
};

export const useMeetings = (params = {}) =>
  useQuery({
    queryKey: MEETING_KEYS.list(params),
    queryFn: () => getMeetings(params),
    keepPreviousData: true,
  });

export const useMeeting = (id) =>
  useQuery({
    queryKey: MEETING_KEYS.detail(id),
    queryFn: () => getMeeting(id),
    enabled: !!id,
  });

export const useCreateMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEETING_KEYS.lists() });
      toast.success('Meeting created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create meeting'),
  });
};

export const useUpdateMeeting = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateMeeting(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(MEETING_KEYS.detail(id), updated);
      qc.invalidateQueries({ queryKey: MEETING_KEYS.lists() });
      toast.success('Meeting updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

export const useDeleteMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEETING_KEYS.lists() });
      toast.success('Meeting deleted');
    },
  });
};
