import { Api } from './generated/Api';
import { useAuthStore } from '../store/authStore';

/**
 * Single shared instance of the swagger-generated API client.
 * The security worker injects the current JWT from the auth store on every request.
 */
export const api = new Api({
  baseURL: '',
  securityWorker: () => {
    const token = useAuthStore.getState().token;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  },
});

// Automatically log the user out on 401 responses.
api.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
