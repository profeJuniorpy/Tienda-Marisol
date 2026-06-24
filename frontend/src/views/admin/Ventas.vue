<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ventas</h1>
        <p class="text-sm text-gray-500 mt-1">Historial de todas las ventas</p>
      </div>
      <RouterLink to="/pos" class="btn-primary flex items-center gap-2 text-sm">
        <ComputerDesktopIcon class="h-4 w-4" /> Nueva venta
      </RouterLink>
    </div>

    <!-- Filtros -->
    <div class="card mb-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="label">Desde</label>
        <input v-model="filtros.desde" type="date" class="input" />
      </div>
      <div>
        <label class="label">Hasta</label>
        <input v-model="filtros.hasta" type="date" class="input" />
      </div>
      <div>
        <label class="label">Método de pago</label>
        <select v-model="filtros.metodo_pago" class="input">
          <option value="">Todos</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="qr">QR</option>
        </select>
      </div>
      <button @click="cargar" class="btn-primary text-sm">Buscar</button>
      <button @click="limpiarFiltros" class="btn-secondary text-sm">Limpiar</button>
    </div>

    <!-- Totales del período -->
    <div v-if="ventas.length > 0" class="grid grid-cols-3 gap-3 mb-4">
      <div class="card text-center">
        <p class="text-sm text-gray-500">Ventas</p>
        <p class="text-2xl font-bold text-gray-900">{{ total }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-gray-500">Monto total</p>
        <p class="text-2xl font-bold text-primary-700">{{ formatGs(totalMonto) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-sm text-gray-500">Promedio</p>
        <p class="text-2xl font-bold text-gray-700">{{ formatGs(totalMonto / (total || 1)) }}</p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <div v-else-if="ventas.length === 0" class="text-center py-12 text-gray-400">
        <ShoppingCartIcon class="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay ventas en el período seleccionado</p>
      </div>

      <div v-else>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th class="text-left px-4 py-3">N° Comprobante</th>
              <th class="text-left px-4 py-3">Cliente</th>
              <th class="text-left px-4 py-3">Fecha</th>
              <th class="text-left px-4 py-3">Método</th>
              <th class="text-right px-4 py-3">Total</th>
              <th class="text-center px-4 py-3">Estado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="v in ventas" :key="v.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-gray-600">
                {{ v.factura?.numero_comprobante || `VTA-${String(v.id).padStart(6,'0')}` }}
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ v.factura?.nombre_cliente || v.cliente?.nombre || 'Sin nombre' }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                {{ formatDateTime(v.created_at) }}
              </td>
              <td class="px-4 py-3">
                <span :class="badgeMetodo(v.metodo_pago)">{{ v.metodo_pago }}</span>
              </td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">
                {{ formatGs(v.total) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="badgeSifen(v.factura?.estado_sifen)">
                  {{ v.factura?.estado_sifen || 'pendiente' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="verDetalle(v)" class="text-xs text-primary-600 hover:underline">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p class="text-gray-500">{{ total }} registros</p>
          <div class="flex gap-1">
            <button
              v-for="p in paginas" :key="p"
              @click="cambiarPagina(p)"
              :class="['px-3 py-1 rounded text-sm', p === paginaActual ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle de venta -->
    <div v-if="ventaSeleccionada" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">
            Detalle de venta #{{ ventaSeleccionada.id }}
          </h3>
          <button @click="ventaSeleccionada = null" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div v-if="cargandoDetalle" class="flex justify-center py-10">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="detalleVenta" class="p-5 space-y-4">
          <!-- Info factura -->
          <div class="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <div class="flex justify-between">
              <span class="text-gray-500">Comprobante</span>
              <span class="font-mono font-semibold">{{ detalleVenta.factura?.numero_comprobante }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Cliente</span>
              <span>{{ detalleVenta.factura?.nombre_cliente || 'Sin nombre' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">RUC cliente</span>
              <span>{{ detalleVenta.factura?.ruc_cliente || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Estado SIFEN</span>
              <span :class="badgeSifen(detalleVenta.factura?.estado_sifen)">{{ detalleVenta.factura?.estado_sifen }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Método de pago</span>
              <span class="capitalize">{{ detalleVenta.metodo_pago }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fecha</span>
              <span>{{ formatDateTime(detalleVenta.created_at) }}</span>
            </div>
          </div>

          <!-- Ítems -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Productos vendidos</h4>
            <div class="divide-y divide-gray-100">
              <div v-for="d in detalleVenta.detalles" :key="d.id" class="flex justify-between py-2 text-sm">
                <div>
                  <p class="text-gray-800">{{ d.producto?.nombre }}</p>
                  <p class="text-xs text-gray-400">{{ formatGs(d.precio_unitario) }} × {{ d.cantidad }} · {{ d.tasa_iva }}</p>
                </div>
                <p class="font-semibold text-gray-900">{{ formatGs(d.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.iva_10 > 0">
              <span>IVA 10%</span><span>{{ formatGs(detalleVenta.iva_10) }}</span>
            </div>
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.iva_5 > 0">
              <span>IVA 5%</span><span>{{ formatGs(detalleVenta.iva_5) }}</span>
            </div>
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.descuento > 0">
              <span>Descuento</span><span>−{{ formatGs(detalleVenta.descuento) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
              <span>TOTAL</span><span>{{ formatGs(detalleVenta.total) }}</span>
            </div>
          </div>

          <!-- Anular -->
          <div v-if="detalleVenta.estado !== 'anulada'">
            <button @click="iniciarAnulacion" class="w-full btn-danger text-sm">
              Anular venta
            </button>
          </div>
          <div v-else class="text-center text-sm text-red-500 font-semibold">Venta ANULADA</div>
        </div>
      </div>
    </div>

    <!-- Modal anulación -->
    <div v-if="mostrarAnulacion" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="font-bold text-gray-900 mb-3">Anular venta</h3>
        <p class="text-sm text-gray-500 mb-4">Esta acción no revierte el stock automáticamente. Indica el motivo:</p>
        <textarea v-model="motivoAnulacion" rows="3" class="input w-full mb-4" placeholder="Motivo de anulación..." />
        <div class="flex gap-2">
          <button @click="mostrarAnulacion = false" class="btn-secondary flex-1 text-sm">Cancelar</button>
          <button @click="anularVenta" :disabled="!motivoAnulacion.trim()" class="btn-danger flex-1 text-sm">Confirmar anulación</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ComputerDesktopIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const ventas           = ref([]);
const total            = ref(0);
const paginaActual     = ref(1);
const cargando         = ref(false);
const ventaSeleccionada = ref(null);
const detalleVenta     = ref(null);
const cargandoDetalle  = ref(false);
const mostrarAnulacion = ref(false);
const motivoAnulacion  = ref('');

const filtros = ref({
  desde:       '',
  hasta:       '',
  metodo_pago: ''
});

const totalMonto = computed(() => ventas.value.reduce((s, v) => s + parseFloat(v.total || 0), 0));

const paginas = computed(() => {
  const n = Math.ceil(total.value / 20);
  return Array.from({ length: Math.min(n, 5) }, (_, i) => i + 1);
});

async function cargar(pagina = 1) {
  cargando.value = true;
  paginaActual.value = pagina;
  try {
    const params = { page: pagina, limit: 20 };
    if (filtros.value.desde)       params.desde       = filtros.value.desde;
    if (filtros.value.hasta)       params.hasta       = filtros.value.hasta;
    if (filtros.value.metodo_pago) params.metodo_pago = filtros.value.metodo_pago;
    const { data } = await api.get('/ventas', { params });
    ventas.value  = data.ventas  || [];
    total.value   = data.total   || 0;
  } finally {
    cargando.value = false;
  }
}

function cambiarPagina(p) { cargar(p); }

function limpiarFiltros() {
  filtros.value = { desde: '', hasta: '', metodo_pago: '' };
  cargar();
}

async function verDetalle(v) {
  ventaSeleccionada.value = v;
  cargandoDetalle.value   = true;
  detalleVenta.value      = null;
  try {
    const { data } = await api.get(`/ventas/${v.id}`);
    detalleVenta.value = data.venta;
  } finally {
    cargandoDetalle.value = false;
  }
}

function iniciarAnulacion() {
  motivoAnulacion.value  = '';
  mostrarAnulacion.value = true;
}

async function anularVenta() {
  if (!motivoAnulacion.value.trim()) return;
  try {
    await api.patch(`/ventas/${detalleVenta.value.id}/anular`, { motivo: motivoAnulacion.value });
    mostrarAnulacion.value  = false;
    ventaSeleccionada.value = null;
    await cargar();
  } catch (err) {
    alert(err.response?.data?.error || 'Error al anular la venta');
  }
}

function badgeMetodo(m) {
  const clases = {
    efectivo:      'badge-verde',
    tarjeta:       'badge-azul',
    transferencia: 'badge-amarillo',
    qr:            'badge-gris'
  };
  return clases[m] || 'badge-gris';
}

function badgeSifen(e) {
  if (e === 'aprobado')     return 'badge-verde';
  if (e === 'rechazado')    return 'badge-rojo';
  if (e === 'contingencia') return 'badge-amarillo';
  return 'badge-gris';
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatDateTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(() => cargar());
</script>
