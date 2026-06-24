<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mis pedidos</h1>
      <RouterLink to="/tienda" class="text-sm text-primary-600 hover:underline">Seguir comprando</RouterLink>
    </div>

    <!-- No logueado -->
    <div v-if="!clienteStore.estaAutenticado" class="text-center py-20 bg-white rounded-2xl border">
      <p class="text-gray-500 mb-4">Iniciá sesión para ver tus pedidos</p>
      <RouterLink to="/tienda/login" class="btn-primary">Ingresar</RouterLink>
    </div>

    <!-- Cargando -->
    <div v-else-if="cargando" class="flex justify-center py-16">
      <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Sin pedidos -->
    <div v-else-if="pedidos.length === 0" class="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <ClipboardDocumentListIcon class="h-16 w-16 mx-auto mb-3 text-gray-200" />
      <p class="text-gray-500">Todavía no realizaste ningún pedido</p>
      <RouterLink to="/tienda" class="btn-primary mt-4 inline-block">Ver productos</RouterLink>
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="space-y-4">
      <div
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Cabecera del pedido -->
        <div class="flex items-center justify-between p-5 border-b border-gray-50">
          <div>
            <div class="flex items-center gap-3">
              <p class="font-semibold text-gray-900">Pedido #{{ pedido.id }}</p>
              <span :class="badgeEstado(pedido.estado)">{{ etiquetaEstado(pedido.estado) }}</span>
            </div>
            <p class="text-sm text-gray-400 mt-0.5">{{ formatDateTime(pedido.created_at) }}</p>
          </div>

          <!-- Código de retiro -->
          <div class="text-right">
            <p class="text-xs text-gray-400">Código de retiro</p>
            <p class="text-lg font-bold text-primary-700 tracking-wider">{{ pedido.codigo_retiro }}</p>
          </div>
        </div>

        <!-- Slot -->
        <div v-if="pedido.slot" class="px-5 py-3 bg-primary-50 border-b border-primary-100">
          <p class="text-sm text-primary-700">
            <strong>Retiro:</strong> {{ formatFecha(pedido.slot.fecha) }}
            · {{ pedido.slot.hora_inicio }} – {{ pedido.slot.hora_fin }}
          </p>
        </div>

        <!-- Ítems del pedido -->
        <div class="p-5">
          <div class="space-y-1.5">
            <div
              v-for="d in pedido.detalles"
              :key="d.producto_id"
              class="flex justify-between text-sm text-gray-700"
            >
              <span>{{ d.nombre_snapshot }} × {{ d.cantidad }}</span>
              <span>{{ formatGs(d.subtotal) }}</span>
            </div>
          </div>
          <div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 mt-3 pt-3">
            <span>Total</span>
            <span class="text-primary-700">{{ formatGs(pedido.total) }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-2">Pago al momento del retiro</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline';
import { useClienteStore } from '@/stores/cliente.store';
import tiendaApi from '@/services/tiendaApi';

const clienteStore = useClienteStore();
const pedidos  = ref([]);
const cargando = ref(false);

async function cargar() {
  if (!clienteStore.estaAutenticado) return;
  cargando.value = true;
  try {
    const { data } = await tiendaApi.get('/tienda/pedidos/mis');
    pedidos.value = data.pedidos || [];
  } finally {
    cargando.value = false;
  }
}

const ESTADOS = {
  pendiente:  { label: 'Pendiente',          clase: 'badge-amarillo' },
  confirmado: { label: 'Confirmado',          clase: 'badge-azul' },
  listo:      { label: 'Listo para retirar', clase: 'badge-verde' },
  retirado:   { label: 'Retirado',           clase: 'badge-gris' },
  cancelado:  { label: 'Cancelado',          clase: 'badge-rojo' }
};

function badgeEstado(e)    { return ESTADOS[e]?.clase   || 'badge-gris'; }
function etiquetaEstado(e) { return ESTADOS[e]?.label   || e; }

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatFecha(f) {
  if (!f) return '';
  const d = new Date(f + 'T00:00:00');
  return d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(cargar);
</script>
