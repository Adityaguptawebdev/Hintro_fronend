import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updatePreferences } from '../services/settings.service';
import { useAuthStore } from '@/store/auth.store';

export const useUpdatePreferences = () => {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (user) => {
      setUser(user);
      toast.success('Preferences saved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save preferences'),
  });
};
