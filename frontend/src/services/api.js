import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Adjuntar el token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejar errores 401: refrescar token o cerrar sesión
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._reintentado) {
      original._reintentado = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh-token', { refresh_token: refreshToken });
          localStorage.setItem('access_token',  data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          limpiarSesion();
        }
      } else {
        limpiarSesion();
      }
    }

    return Promise.reject(error);
  }
);

function limpiarSesion() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
}

export default api;
