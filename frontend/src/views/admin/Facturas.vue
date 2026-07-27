<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Facturas</h1>
        <p class="text-sm text-gray-500 mt-1">Comprobantes electrónicos emitidos (SIFEN)</p>
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
        <label class="label">Estado SIFEN</label>
        <select v-model="filtros.estado" class="input">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="contingencia">Contingencia</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <button @click="cargar" class="btn-primary text-sm">Buscar</button>
      <button @click="limpiarFiltros" class="btn-secondary text-sm">Limpiar</button>
    </div>

    <!-- KPIs -->
    <div v-if="ventas.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="card text-center py-3">
        <p class="text-xs text-gray-500 mb-1">Total emitidas</p>
        <p class="text-xl font-bold text-gray-900">{{ total }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-xs text-gray-500 mb-1">Aprobadas</p>
        <p class="text-xl font-bold text-green-600">{{ contarEstado('aprobado') }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-xs text-gray-500 mb-1">Contingencia</p>
        <p class="text-xl font-bold text-amber-600">{{ contarEstado('contingencia') }}</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-xs text-gray-500 mb-1">Rechazadas</p>
        <p class="text-xl font-bold text-red-600">{{ contarEstado('rechazado') }}</p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <div v-else-if="ventas.length === 0" class="text-center py-12 text-gray-400">
        <DocumentTextIcon class="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay facturas en el período seleccionado</p>
      </div>

      <div v-else>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th class="text-left px-4 py-3">N° Comprobante</th>
              <th class="text-left px-4 py-3">Cliente</th>
              <th class="text-left px-4 py-3">RUC</th>
              <th class="text-left px-4 py-3">Fecha</th>
              <th class="text-left px-4 py-3">Método</th>
              <th class="text-right px-4 py-3">Total</th>
              <th class="text-center px-4 py-3">Estado SIFEN</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="v in ventas" :key="v.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-gray-700 font-semibold">
                {{ v.factura?.numero_comprobante || `CONT-${String(v.id).padStart(6, '0')}` }}
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ v.factura?.nombre_cliente || v.cliente?.nombre || 'Sin nombre' }}
              </td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                {{ v.factura?.ruc_cliente || '—' }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                {{ formatDateTime(v.created_at) }}
              </td>
              <td class="px-4 py-3">
                <span :class="badgeMetodo(v.metodo_pago)" class="capitalize">{{ v.metodo_pago }}</span>
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
                <button @click="verFactura(v)" class="text-xs text-primary-600 hover:underline">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p class="text-gray-500">{{ total }} comprobantes</p>
          <div class="flex gap-1">
            <button
              v-for="p in paginas" :key="p"
              @click="cambiarPagina(p)"
              :class="['px-3 py-1 rounded text-sm', p === paginaActual ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
            >{{ p }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal detalle / KUDE -->
    <div v-if="facturaSeleccionada" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">Comprobante electrónico</h3>
          <div class="flex items-center gap-2">
            <button @click="imprimir" class="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <PrinterIcon class="h-4 w-4" /> Imprimir
            </button>
            <button @click="facturaSeleccionada = null" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div v-if="cargandoDetalle" class="flex justify-center py-10">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="detalleVenta" id="kude-print" class="p-5 space-y-4">
          <!-- Encabezado KUDE -->
          <div class="text-center border-b pb-4">
            <p class="font-bold text-lg">{{ detalleVenta.factura?.emisor?.nombre || 'TIENDA MARISOL' }}</p>
            <p class="text-xs text-gray-500">RUC: {{ detalleVenta.factura?.emisor?.ruc || '80000000-1' }}</p>
            <p class="text-xs text-gray-500">{{ detalleVenta.factura?.emisor?.direccion || 'Mercado Nro. 1, Local 15, Coronel Oviedo' }}</p>
            <div class="mt-3 bg-gray-100 rounded-lg px-4 py-2 inline-block">
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Comprobante N°</p>
              <p class="font-mono font-bold text-base text-gray-900">
                {{ detalleVenta.factura?.numero_comprobante || `CONT-${String(detalleVenta.id).padStart(6, '0')}` }}
              </p>
            </div>
          </div>

          <!-- Estado SIFEN -->
          <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
            <span class="text-gray-500">Estado SIFEN</span>
            <span :class="badgeSifen(detalleVenta.factura?.estado_sifen)" class="text-xs">
              {{ detalleVenta.factura?.estado_sifen || 'pendiente' }}
            </span>
          </div>

          <!-- Datos del cliente -->
          <div class="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Datos del comprador</p>
            <div class="flex justify-between">
              <span class="text-gray-500">Nombre</span>
              <span class="font-medium">{{ detalleVenta.factura?.nombre_cliente || 'Sin nombre' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">RUC/CI</span>
              <span class="font-mono">{{ detalleVenta.factura?.ruc_cliente || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fecha</span>
              <span>{{ formatDateTime(detalleVenta.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Método de pago</span>
              <span class="capitalize">{{ detalleVenta.metodo_pago }}</span>
            </div>
          </div>

          <!-- Ítems -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Productos</p>
            <div class="divide-y divide-gray-100 border rounded-xl overflow-hidden">
              <div class="grid grid-cols-12 text-xs bg-gray-50 px-3 py-2 text-gray-500 font-medium">
                <span class="col-span-5">Descripción</span>
                <span class="col-span-2 text-right">P.Unit.</span>
                <span class="col-span-2 text-center">Cant.</span>
                <span class="col-span-1 text-center">IVA</span>
                <span class="col-span-2 text-right">Subtotal</span>
              </div>
              <div
                v-for="d in detalleVenta.detalles" :key="d.id"
                class="grid grid-cols-12 text-xs px-3 py-2.5"
              >
                <span class="col-span-5 text-gray-800">{{ d.producto?.nombre }}</span>
                <span class="col-span-2 text-right text-gray-600">{{ formatGs(d.precio_unitario) }}</span>
                <span class="col-span-2 text-center text-gray-600">{{ d.cantidad }}</span>
                <span class="col-span-1 text-center text-gray-400 text-xs">{{ d.tasa_iva === 'IVA_10' ? '10%' : d.tasa_iva === 'IVA_5' ? '5%' : '0%' }}</span>
                <span class="col-span-2 text-right font-semibold text-gray-900">{{ formatGs(d.subtotal) }}</span>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.iva_10 > 0">
              <span>IVA 10%</span><span>{{ formatGs(detalleVenta.iva_10) }}</span>
            </div>
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.iva_5 > 0">
              <span>IVA 5%</span><span>{{ formatGs(detalleVenta.iva_5) }}</span>
            </div>
            <div class="flex justify-between text-gray-500" v-if="detalleVenta.descuento > 0">
              <span>Descuento</span><span>−{{ formatGs(detalleVenta.descuento) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
              <span>TOTAL</span><span class="text-primary-700">{{ formatGs(detalleVenta.total) }}</span>
            </div>
          </div>

          <!-- CDC (si existe) -->
          <div v-if="detalleVenta.factura?.cdc" class="text-center">
            <p class="text-xs text-gray-400 mb-1">Código de Control (CDC)</p>
            <p class="font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded-lg">
              {{ detalleVenta.factura.cdc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import {
  DocumentTextIcon, ComputerDesktopIcon, XMarkIcon, PrinterIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';

const ventas            = ref([]);
const total             = ref(0);
const paginaActual      = ref(1);
const cargando          = ref(false);
const facturaSeleccionada = ref(null);
const detalleVenta      = ref(null);
const cargandoDetalle   = ref(false);

const filtros = ref({ desde: '', hasta: '', estado: '' });

const paginas = computed(() => {
  const n = Math.ceil(total.value / 20);
  return Array.from({ length: Math.min(n, 5) }, (_, i) => i + 1);
});

const contarEstado = (estado) =>
  ventas.value.filter(v => v.factura?.estado_sifen === estado).length;

async function cargar(pagina = 1) {
  cargando.value    = true;
  paginaActual.value = pagina;
  try {
    const params = { page: pagina, limit: 20 };
    if (filtros.value.desde) params.desde = filtros.value.desde;
    if (filtros.value.hasta) params.hasta = filtros.value.hasta;
    const { data } = await api.get('/ventas', { params });
    let rows = data.ventas || [];
    if (filtros.value.estado) {
      rows = rows.filter(v => (v.factura?.estado_sifen || 'pendiente') === filtros.value.estado);
    }
    ventas.value = rows;
    total.value  = filtros.value.estado ? rows.length : (data.total || 0);
  } finally {
    cargando.value = false;
  }
}

function cambiarPagina(p) { cargar(p); }

function limpiarFiltros() {
  filtros.value = { desde: '', hasta: '', estado: '' };
  cargar();
}

async function verFactura(v) {
  facturaSeleccionada.value = v;
  cargandoDetalle.value     = true;
  detalleVenta.value        = null;
  try {
    const { data } = await api.get(`/ventas/${v.id}`);
    detalleVenta.value = data.venta;
  } finally {
    cargandoDetalle.value = false;
  }
}

function imprimir() {
  const contenido = document.getElementById('kude-print')?.innerHTML;
  if (!contenido) return;
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Comprobante</title>
    <style>
      body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 400px; margin: auto; }
      .text-gray-500 { color: #6b7280; }
      .font-bold { font-weight: bold; }
    </style>
    </head><body>${contenido}</body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

function badgeMetodo(m) {
  const c = { efectivo: 'badge-verde', tarjeta: 'badge-azul', transferencia: 'badge-amarillo', qr: 'badge-gris' };
  return c[m] || 'badge-gris';
}

function badgeSifen(e) {
  if (e === 'aprobado')     return 'badge-verde';
  if (e === 'rechazado')    return 'badge-rojo';
  if (e === 'contingencia') return 'badge-amarillo';
  return 'badge-gris';
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', maximumFractionDigits: 0
  }).format(n || 0);
}

function formatDateTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('es-PY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

onMounted(() => cargar());
</script>
