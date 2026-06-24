<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Alertas</h1>
        <p class="text-sm text-gray-500 mt-1">{{ alertasStore.totalNoLeidas }} sin leer</p>
      </div>
      <div class="flex gap-2">
        <button @click="generarAlertas" class="btn-secondary text-sm">Generar alertas ahora</button>
        <button v-if="alertasStore.totalNoLeidas > 0" @click="alertasStore.marcarTodasLeidas()" class="btn-primary text-sm">
          Marcar todas como leídas
        </button>
      </div>
    </div>

    <!-- Filtro -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="f in filtros" :key="f.valor"
        @click="filtroActivo = f.valor"
        :class="['px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
          filtroActivo === f.valor
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
      >
        {{ f.nombre }}
      </button>
    </div>

    <div v-if="cargando" class="text-center py-10 text-gray-400">Cargando alertas...</div>

    <div v-else-if="alertasFiltradas.length === 0" class="card text-center py-12">
      <div class="text-5xl mb-3">🔔</div>
      <p class="text-gray-400">No hay alertas {{ filtroActivo !== 'todas' ? 'de este tipo' : '' }}</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="alerta in alertasFiltradas"
        :key="alerta.id"
        :class="[
          'rounded-xl border p-4 transition-all cursor-pointer hover:shadow-sm',
          alerta.leida ? 'bg-white border-gray-100' : claseAlerta(alerta.tipo)
        ]"
        @click="alertasStore.marcarLeida(alerta.id)"
      >
        <div class="flex items-start gap-3">
          <div :class="['h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', iconoBg(alerta.tipo)]">
            <span class="text-sm">{{ iconoTipo(alerta.tipo) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span :class="['text-xs font-semibold uppercase tracking-wide', badgeTipo(alerta.tipo)]">
                {{ etiquetaTipo(alerta.tipo) }}
              </span>
              <span v-if="!alerta.leida" class="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
            </div>
            <p class="text-sm text-gray-700 mt-1 leading-relaxed">{{ alerta.mensaje }}</p>
            <p class="text-xs text-gray-400 mt-1.5">{{ formatDateTime(alerta.created_at) }}</p>
          </div>
          <div v-if="!alerta.leida" class="text-xs text-gray-400 whitespace-nowrap mt-1">Clic para marcar leída</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAlertasStore } from '@/stores/alertas.store';
import api from '@/services/api';

const alertasStore = useAlertasStore();
const cargando     = ref(false);
const filtroActivo = ref('todas');

const filtros = [
  { valor: 'todas',       nombre: 'Todas' },
  { valor: 'vencimiento', nombre: 'Vencimientos' },
  { valor: 'stock_minimo', nombre: 'Stock bajo' },
  { valor: 'pedido_nuevo', nombre: 'Pedidos' }
];

const alertasFiltradas = computed(() => {
  if (filtroActivo.value === 'todas') return alertasStore.alertas;
  return alertasStore.alertas.filter(a => a.tipo === filtroActivo.value);
});

async function generarAlertas() {
  try {
    await api.post('/stock/generar-alertas');
    await alertasStore.cargar();
    alert('Alertas generadas correctamente.');
  } catch (err) {
    alert(err.response?.data?.error || 'Error al generar alertas');
  }
}

function claseAlerta(tipo) {
  if (tipo === 'vencimiento') return 'bg-orange-50 border-orange-200';
  if (tipo === 'stock_minimo') return 'bg-red-50 border-red-200';
  return 'bg-blue-50 border-blue-200';
}

function iconoBg(tipo) {
  if (tipo === 'vencimiento') return 'bg-orange-100';
  if (tipo === 'stock_minimo') return 'bg-red-100';
  return 'bg-blue-100';
}

function iconoTipo(tipo) {
  if (tipo === 'vencimiento') return '⏰';
  if (tipo === 'stock_minimo') return '📦';
  return '🛍️';
}

function etiquetaTipo(tipo) {
  if (tipo === 'vencimiento') return 'Vencimiento';
  if (tipo === 'stock_minimo') return 'Stock bajo';
  return 'Pedido nuevo';
}

function badgeTipo(tipo) {
  if (tipo === 'vencimiento') return 'text-orange-600';
  if (tipo === 'stock_minimo') return 'text-red-600';
  return 'text-blue-600';
}

function formatDateTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('es-PY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

onMounted(async () => {
  cargando.value = true;
  await alertasStore.cargar();
  cargando.value = false;
});
</script>
