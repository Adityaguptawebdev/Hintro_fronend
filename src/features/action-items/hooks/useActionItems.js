import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getActionItems,
  createActionItem,
  updateActionItemStatus,
  getOverdueActionItems,
} from '../services/actionItem.service';

export const ACTION_ITEM_KEYS = {
  all: ['action-items'],
  lists: () => [...ACTION_ITEM_KEYS.all, 'list'],
  list: (params) => [...ACTION_ITEM_KEYS.lists(), params],
  overdue: () => [...ACTION_ITEM_KEYS.all, 'overdue'],
};

export const useActionItems = (params = {}) =>
  useQuery({
    queryKey: ACTION_ITEM_KEYS.list(params),
    queryFn: () => getActionItems(params),
  });

export const useOverdueActionItems = () =>
  useQuery({
    queryKey: ACTION_ITEM_KEYS.overdue(),
    queryFn: getOverdueActionItems,
  });

export const useCreateActionItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createActionItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTION_ITEM_KEYS.lists() });
      toast.success('Action item created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create action item'),
  });
};

export const useUpdateActionItemStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateActionItemStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTION_ITEM_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ACTION_ITEM_KEYS.overdue() });
      toast.success('Status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });
};
