import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useAlertasStore = defineStore('alertas', () => {
  const alertas       = ref([]);
  const totalNoLeidas = ref(0);

  async function cargar() {
    try {
      const { data } = await api.get('/stock/alertas');
      alertas.value       = data;
      totalNoLeidas.value = data.filter(a => !a.leida).length;
    } catch { /* silencioso */ }
  }

  async function marcarLeida(id) {
    await api.put(`/stock/alertas/${id}/leer`);
    const alerta = alertas.value.find(a => a.id === id);
    if (alerta) {
      alerta.leida = true;
      totalNoLeidas.value = Math.max(0, totalNoLeidas.value - 1);
    }
  }

  async function marcarTodasLeidas() {
    await api.put('/stock/alertas/leer-todas');
    alertas.value.forEach(a => a.leida = true);
    totalNoLeidas.value = 0;
  }

  return { alertas, totalNoLeidas, cargar, marcarLeida, marcarTodasLeidas };
});
