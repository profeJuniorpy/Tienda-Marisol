<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pedidos online</h1>
        <p class="text-sm text-gray-500 mt-1">{{ total }} pedidos en total</p>
      </div>
      <!-- Buscar por código retiro -->
      <div class="flex gap-2 items-center">
        <div class="relative">
          <MagnifyingGlassIcon class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="busqueda" @keydown.enter="cargar()" type="text"
            placeholder="Código retiro..." class="input pl-9 text-sm w-44" />
        </div>
        <button @click="cargar()" class="btn-primary text-sm">Buscar</button>
        <button @click="generarSlots" class="btn-secondary text-sm">+ Generar slots</button>
      </div>
    </div>

    <!-- Tabs de estado -->
    <div class="flex gap-1.5 mb-4 overflow-x-auto pb-1">
      <button
        v-for="tab in TABS" :key="tab.valor"
        @click="estadoFiltro = tab.valor; cargar()"
        :class="['px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-colors', estadoFiltro === tab.valor ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
      >
        {{ tab.nombre }}
      </button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <div v-else-if="pedidos.length === 0" class="text-center py-12 text-gray-400">
        <ClipboardDocumentListIcon class="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay pedidos {{ estadoFiltro ? `con estado "${ESTADOS[estadoFiltro]}"` : '' }}</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Pedido</th>
            <th class="text-left px-4 py-3">Cliente</th>
            <th class="text-left px-4 py-3">Retiro</th>
            <th class="text-center px-4 py-3">Código</th>
            <th class="text-right px-4 py-3">Total</th>
            <th class="text-center px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in pedidos" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div>
                <p class="font-medium text-gray-800">#{{ p.id }}</p>
                <p class="text-xs text-gray-400">{{ formatDateTime(p.created_at) }}</p>
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="text-gray-700">{{ p.cliente?.nombre || p.nombre_contacto || '—' }}</p>
              <p class="text-xs text-gray-400">{{ p.cliente?.email }}</p>
            </td>
            <td class="px-4 py-3">
              <div v-if="p.slot">
                <p class="text-gray-700">{{ formatFechaCorta(p.slot.fecha) }}</p>
                <p class="text-xs text-primary-600 font-medium">{{ p.slot.hora_inicio }} – {{ p.slot.hora_fin }}</p>
              </div>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="font-mono font-bold text-primary-700 text-sm tracking-wider">{{ p.codigo_retiro }}</span>
            </td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ formatGs(p.total) }}</td>
            <td class="px-4 py-3 text-center">
              <!-- Selector de estado directo -->
              <select
                :value="p.estado"
                @change="cambiarEstado(p, $event.target.value)"
                :disabled="p.estado === 'retirado' || p.estado === 'cancelado'"
                :class="['text-xs border-0 rounded-lg font-medium px-2 py-1 cursor-pointer appearance-none', claseSelectEstado(p.estado)]"
              >
                <option v-for="(label, val) in ESTADOS" :key="val" :value="val">{{ label }}</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <button @click="verDetalle(p)" class="text-xs text-primary-600 hover:underline">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal detalle pedido -->
    <div v-if="pedidoSeleccionado" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">Pedido #{{ pedidoSeleccionado.id }}</h3>
          <button @click="pedidoSeleccionado = null" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Código de retiro -->
          <div class="bg-primary-700 text-white rounded-xl p-4 text-center">
            <p class="text-xs opacity-75 mb-1">Código de retiro</p>
            <p class="text-3xl font-bold tracking-widest">{{ pedidoSeleccionado.codigo_retiro }}</p>
          </div>

          <!-- Info -->
          <div class="text-sm space-y-1.5 bg-gray-50 rounded-xl p-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Cliente</span>
              <span>{{ pedidoSeleccionado.cliente?.nombre || pedidoSeleccionado.nombre_contacto || 'Sin nombre' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Email</span>
              <span>{{ pedidoSeleccionado.cliente?.email || '—' }}</span>
            </div>
            <div class="flex justify-between" v-if="pedidoSeleccionado.slot">
              <span class="text-gray-500">Retiro</span>
              <span>{{ formatFechaCorta(pedidoSeleccionado.slot.fecha) }} {{ pedidoSeleccionado.slot.hora_inicio }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Estado</span>
              <span :class="badgeEstado(pedidoSeleccionado.estado)">{{ ESTADOS[pedidoSeleccionado.estado] }}</span>
            </div>
          </div>

          <!-- Ítems -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Productos</h4>
            <div class="divide-y divide-gray-100">
              <div v-for="d in pedidoSeleccionado.detalles" :key="d.producto_id"
                class="flex justify-between py-2 text-sm">
                <span class="text-gray-700">{{ d.nombre_snapshot }} × {{ d.cantidad }}</span>
                <span class="font-medium">{{ formatGs(d.subtotal) }}</span>
              </div>
            </div>
            <div class="flex justify-between font-bold text-gray-900 border-t pt-2 mt-1">
              <span>Total</span>
              <span class="text-primary-700">{{ formatGs(pedidoSeleccionado.total) }}</span>
            </div>
          </div>

          <!-- Cambiar estado -->
          <div v-if="pedidoSeleccionado.estado !== 'retirado' && pedidoSeleccionado.estado !== 'cancelado'">
            <p class="text-xs text-gray-500 mb-2">Cambiar estado:</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="(label, val) in ESTADOS" :key="val"
                @click="cambiarEstadoYActualizar(pedidoSeleccionado, val)"
                :class="['text-sm py-2 rounded-xl border font-medium transition-colors', pedidoSeleccionado.estado === val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const pedidos          = ref([]);
const total            = ref(0);
const cargando         = ref(false);
const estadoFiltro     = ref('');
const busqueda         = ref('');
const pedidoSeleccionado = ref(null);

const ESTADOS = {
  pendiente:  'Pendiente',
  confirmado: 'Confirmado',
  listo:      'Listo para retirar',
  retirado:   'Retirado',
  cancelado:  'Cancelado'
};

const TABS = [
  { valor: '',           nombre: 'Todos' },
  { valor: 'pendiente',  nombre: 'Pendientes' },
  { valor: 'confirmado', nombre: 'Confirmados' },
  { valor: 'listo',      nombre: 'Listos' },
  { valor: 'retirado',   nombre: 'Retirados' },
  { valor: 'cancelado',  nombre: 'Cancelados' }
];

async function cargar() {
  cargando.value = true;
  try {
    const params = {};
    if (estadoFiltro.value) params.estado   = estadoFiltro.value;
    if (busqueda.value)     params.busqueda  = busqueda.value;
    const { data } = await api.get('/pedidos', { params });
    pedidos.value = data.pedidos || [];
    total.value   = data.total   || 0;
  } finally {
    cargando.value = false;
  }
}

async function cambiarEstado(pedido, nuevoEstado) {
  if (pedido.estado === nuevoEstado) return;
  try {
    await api.patch(`/pedidos/${pedido.id}/estado`, { estado: nuevoEstado });
    pedido.estado = nuevoEstado;
  } catch (err) {
    alert(err.response?.data?.error || 'Error al cambiar el estado');
    await cargar();
  }
}

async function cambiarEstadoYActualizar(pedido, nuevoEstado) {
  await cambiarEstado(pedido, nuevoEstado);
  pedidoSeleccionado.value = { ...pedido, estado: nuevoEstado };
}

function verDetalle(p) {
  pedidoSeleccionado.value = p;
}

async function generarSlots() {
  if (!confirm('¿Generar slots de retiro para los próximos 7 días?')) return;
  try {
    const { data } = await api.post('/slots/generar-semana', { dias: 7 });
    alert(`${data.mensaje}`);
  } catch (err) {
    alert(err.response?.data?.error || 'Error al generar slots');
  }
}

function claseSelectEstado(e) {
  const mapa = {
    pendiente:  'bg-yellow-100 text-yellow-800',
    confirmado: 'bg-blue-100 text-blue-800',
    listo:      'bg-green-100 text-green-800',
    retirado:   'bg-gray-100 text-gray-600',
    cancelado:  'bg-red-100 text-red-700'
  };
  return mapa[e] || 'bg-gray-100 text-gray-600';
}

function badgeEstado(e) {
  const mapa = {
    pendiente:  'badge-amarillo',
    confirmado: 'badge-azul',
    listo:      'badge-verde',
    retirado:   'badge-gris',
    cancelado:  'badge-rojo'
  };
  return mapa[e] || 'badge-gris';
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatDateTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatFechaCorta(f) {
  if (!f) return '';
  const d = new Date(f + 'T00:00:00');
  return d.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short' });
}

onMounted(cargar);
</script>
