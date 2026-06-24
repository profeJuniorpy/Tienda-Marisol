import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useClienteStore = defineStore('cliente', () => {
  const cliente       = ref(JSON.parse(localStorage.getItem('cliente') || 'null'));
  const accessToken   = ref(localStorage.getItem('cliente_token') || null);

  const estaAutenticado = computed(() => !!accessToken.value && !!cliente.value);

  function guardarSesion(data) {
    cliente.value     = data.cliente;
    accessToken.value = data.accessToken;
    localStorage.setItem('cliente',       JSON.stringify(data.cliente));
    localStorage.setItem('cliente_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('cliente_refresh', data.refreshToken);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login-cliente', { email, password });
    guardarSesion(data);
    return data;
  }

  async function registro(datos) {
    const { data } = await api.post('/auth/registro-cliente', datos);
    guardarSesion(data);
    return data;
  }

  function cerrarSesion() {
    cliente.value     = null;
    accessToken.value = null;
    localStorage.removeItem('cliente');
    localStorage.removeItem('cliente_token');
    localStorage.removeItem('cliente_refresh');
  }

  return { cliente, accessToken, estaAutenticado, login, registro, cerrarSesion };
});
