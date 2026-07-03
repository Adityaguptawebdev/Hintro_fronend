
import { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import api from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      setUser(data.data);
      return data.data;
    },
    enabled: isAuthenticated,
    retry: false,
    onError: () => logout(),
  });

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
