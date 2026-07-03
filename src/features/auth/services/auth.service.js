import api from '../../../api/interceptors';
import { ENDPOINTS } from '../../../api/endpoints';

export const register = (data) => api.post(ENDPOINTS.AUTH.REGISTER, data).then((r) => r.data.data);
export const login = (data) => api.post(ENDPOINTS.AUTH.LOGIN, data).then((r) => r.data.data);
export const logout = () => api.post(ENDPOINTS.AUTH.LOGOUT);
export const getMe = () => api.get(ENDPOINTS.AUTH.ME).then((r) => r.data.data);
export const changePassword = (data) => api.patch(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
