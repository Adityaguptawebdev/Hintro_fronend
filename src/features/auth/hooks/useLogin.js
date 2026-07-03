import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken);
      navigate(from, { replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
};
