import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notification.service';
import { useNotificationStore } from '@/store/notification.store';

export const NOTIFICATION_KEYS = {
  all: ['notifications'],
  list: (params) => [...NOTIFICATION_KEYS.all, params],
};

export const useNotifications = (params = {}, queryOptions = {}) => {
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  const query = useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => getNotifications(params),
    ...queryOptions,
  });

  useEffect(() => {
    if (query.data?.items) {
      setNotifications(query.data.items);
    }
  }, [query.data, setNotifications]);

  return query;
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  const markRead = useNotificationStore((s) => s.markRead);

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_, id) => {
      markRead(id);
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark as read'),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      markAllRead();
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      toast.success('All notifications marked as read');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark all as read'),
  });
};
