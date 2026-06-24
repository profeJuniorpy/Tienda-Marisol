import axios from 'axios';

// Instancia separada para la tienda pública
// Usa 'cliente_token' en lugar del 'access_token' del panel admin
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const tiendaApi = axios.create({ baseURL: BASE });

tiendaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cliente_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

tiendaApi.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cliente_token');
      localStorage.removeItem('cliente');
    }
    return Promise.reject(error);
  }
);

export default tiendaApi;
