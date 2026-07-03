import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      toast.error(error);
      navigate('/login', { replace: true });
      return;
    }

    if (!accessToken || !refreshToken) {
      toast.error('Sign-in failed — missing tokens');
      navigate('/login', { replace: true });
      return;
    }

    // user is fetched separately by AuthProvider once isAuthenticated flips true
    setAuth(null, accessToken, refreshToken);
    navigate('/dashboard', { replace: true });
  }, [params, navigate, setAuth]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
      <div className="size-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
