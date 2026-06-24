import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const usuario  = ref(JSON.parse(localStorage.getItem('usuario') || 'null'));
  const token    = ref(localStorage.getItem('access_token') || null);
  const cargando = ref(false);
  const error    = ref(null);

  const estaAutenticado = computed(() => !!token.value && !!usuario.value);
  const esAdmin         = computed(() => usuario.value?.rol === 'admin');
  const esVendedor      = computed(() => ['admin', 'vendedor'].includes(usuario.value?.rol));

  async function login(email, password) {
    cargando.value = true;
    error.value    = null;
    try {
      const { data } = await api.post('/auth/login-admin', { email, password });
      usuario.value = data.usuario;
      token.value   = data.accessToken;
      localStorage.setItem('access_token',  data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('usuario',       JSON.stringify(data.usuario));
      return true;
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión';
      return false;
    } finally {
      cargando.value = false;
    }
  }

  function cerrarSesion() {
    usuario.value = null;
    token.value   = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
  }

  return { usuario, token, cargando, error, estaAutenticado, esAdmin, esVendedor, login, cerrarSesion };
});
