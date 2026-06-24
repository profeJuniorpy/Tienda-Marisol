<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Control de Stock</h1>
      <div class="flex gap-2">
        <button @click="ejecutarJobAlertas" class="btn-secondary text-sm">Generar alertas ahora</button>
        <button @click="abrirAjuste" class="btn-primary">Registrar ajuste</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6 gap-1">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="tabActivo = tab.id"
        :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', tabActivo === tab.id
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-gray-500 hover:text-gray-700']"
      >
        {{ tab.nombre }}
        <span v-if="tab.badge" class="ml-1.5 badge-rojo">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Tab: Por vencer -->
    <div v-if="tabActivo === 'vencer'">
      <div v-if="cargandoResumen" class="text-center py-10 text-gray-400 text-sm">Cargando...</div>
      <div v-else>
        <div v-if="lotesPorVencer.length === 0" class="card text-center py-10">
          <p class="text-gray-400 text-sm">No hay lotes próximos a vencer</p>
        </div>
        <div class="grid gap-3">
          <div
            v-for="lote in lotesPorVencer"
            :key="lote.id"
            :class="['card p-4 flex items-center justify-between', claseLote(lote)]"
          >
            <div class="flex items-center gap-3">
              <div :class="['h-3 w-3 rounded-full flex-shrink-0', punteLote(lote)]" />
              <div>
                <p class="font-medium text-sm text-gray-900">{{ lote.producto?.nombre }}</p>
                <p class="text-xs text-gray-500">
                  Lote {{ lote.numero_lote || `#${lote.id}` }} ·
                  Ingreso: {{ formatFecha(lote.fecha_ingreso) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-sm">{{ lote.cantidad_actual }} uds.</p>
              <p :class="['text-xs font-medium', textoLote(lote)]">
                {{ etiquetaVencimiento(lote) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Stock bajo -->
    <div v-if="tabActivo === 'stock_bajo'">
      <div v-if="cargandoResumen" class="text-center py-10 text-gray-400 text-sm">Cargando...</div>
      <div v-else>
        <div v-if="productosStockBajo.length === 0" class="card text-center py-10">
          <p class="text-gray-400 text-sm">Todos los productos tienen stock suficiente</p>
        </div>
        <div class="card p-0 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-3 text-left">Producto</th>
                <th class="px-4 py-3 text-left">Categoría</th>
                <th class="px-4 py-3 text-right">Stock actual</th>
                <th class="px-4 py-3 text-right">Mínimo</th>
                <th class="px-4 py-3 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="p in productosStockBajo" :key="p.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ p.nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ p.categoria?.nombre }}</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-red-600">{{ p.stock_actual }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600">{{ p.stock_minimo }}</td>
                <td class="px-4 py-3 text-right text-sm font-medium text-orange-600">
                  {{ p.stock_minimo - p.stock_actual > 0 ? `−${p.stock_minimo - p.stock_actual}` : 'OK' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab: Movimientos -->
    <div v-if="tabActivo === 'movimientos'">
      <!-- Filtros de movimientos -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input v-model="filtrosMov.desde" type="date" class="input" @change="cargarMovimientos" />
          <input v-model="filtrosMov.hasta" type="date" class="input" @change="cargarMovimientos" />
          <select v-model="filtrosMov.tipo" class="input" @change="cargarMovimientos">
            <option value="">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="ajuste">Ajustes</option>
            <option value="merma">Mermas</option>
          </select>
          <button @click="cargarMovimientos" class="btn-secondary text-sm">Buscar</button>
        </div>
      </div>

      <div class="card p-0 overflow-hidden">
        <div v-if="cargandoMov" class="text-center py-8 text-gray-400 text-sm">Cargando movimientos...</div>
        <table v-else class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Fecha</th>
              <th class="px-4 py-3 text-left">Producto</th>
              <th class="px-4 py-3 text-left">Tipo</th>
              <th class="px-4 py-3 text-right">Cantidad</th>
              <th class="px-4 py-3 text-right">Stock anterior</th>
              <th class="px-4 py-3 text-right">Stock nuevo</th>
              <th class="px-4 py-3 text-left">Motivo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="movimientos.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400 text-sm">Sin movimientos en el período</td>
            </tr>
            <tr v-for="m in movimientos" :key="m.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDateTime(m.created_at) }}</td>
              <td class="px-4 py-3 text-sm text-gray-900">{{ m.producto?.nombre }}</td>
              <td class="px-4 py-3">
                <span :class="badgeTipo(m.tipo)">{{ m.tipo }}</span>
              </td>
              <td class="px-4 py-3 text-right text-sm font-bold" :class="m.tipo === 'salida' || m.tipo === 'merma' ? 'text-red-600' : 'text-green-700'">
                {{ m.tipo === 'salida' || m.tipo === 'merma' ? '−' : '+' }}{{ m.cantidad }}
              </td>
              <td class="px-4 py-3 text-right text-sm text-gray-500">{{ m.stock_anterior }}</td>
              <td class="px-4 py-3 text-right text-sm font-medium">{{ m.stock_nuevo }}</td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ m.motivo || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalMov > movimientos.length" class="px-4 py-2 border-t text-xs text-gray-400 text-center">
          Mostrando {{ movimientos.length }} de {{ totalMov }} registros
        </div>
      </div>
    </div>

    <!-- Modal ajuste manual -->
    <Transition name="modal">
      <div v-if="modalAjuste" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-semibold">Ajuste de stock</h2>
            <button @click="modalAjuste = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="guardarAjuste" class="p-6 space-y-4">
            <div>
              <label class="label">Producto *</label>
              <input v-model="ajuste.busqueda" @input="buscarProductoAjuste" class="input"
                placeholder="Escribir nombre del producto..." autocomplete="off" />
              <div v-if="resultadosBusqueda.length" class="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                <button
                  v-for="p in resultadosBusqueda" :key="p.id"
                  type="button"
                  @click="seleccionarProducto(p)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
                >
                  {{ p.nombre }} <span class="text-gray-400">(stock: {{ p.stock_actual }})</span>
                </button>
              </div>
              <p v-if="ajuste.productoSeleccionado" class="mt-1 text-sm font-medium text-primary-700">
                ✓ {{ ajuste.productoSeleccionado.nombre }}
              </p>
            </div>
            <div>
              <label class="label">Tipo de movimiento *</label>
              <select v-model="ajuste.tipo" class="input" required>
                <option value="entrada">Entrada (sumar stock)</option>
                <option value="merma">Merma (restar stock)</option>
                <option value="ajuste">Ajuste (sumar stock)</option>
              </select>
            </div>
            <div>
              <label class="label">Cantidad *</label>
              <input v-model="ajuste.cantidad" type="number" min="1" class="input" required />
            </div>
            <div>
              <label class="label">Motivo</label>
              <input v-model="ajuste.motivo" class="input" placeholder="Ej: Rotura, conteo de inventario..." />
            </div>
            <div v-if="errorAjuste" class="text-xs text-red-600">{{ errorAjuste }}</div>
            <div class="flex justify-end gap-2 border-t pt-4">
              <button type="button" @click="modalAjuste = false" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="guardandoAjuste">
                {{ guardandoAjuste ? 'Guardando...' : 'Registrar ajuste' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const tabActivo         = ref('vencer');
const lotesPorVencer    = ref([]);
const productosStockBajo = ref([]);
const movimientos       = ref([]);
const totalMov          = ref(0);
const cargandoResumen   = ref(false);
const cargandoMov       = ref(false);
const modalAjuste       = ref(false);
const guardandoAjuste   = ref(false);
const errorAjuste       = ref('');
const resultadosBusqueda = ref([]);
let timerBusquedaAjuste;

const filtrosMov = ref({ desde: '', hasta: '', tipo: '' });
const ajuste = ref({ busqueda: '', productoSeleccionado: null, tipo: 'merma', cantidad: '', motivo: '' });

const tabs = computed(() => [
  { id: 'vencer',     nombre: 'Por vencer',       badge: lotesPorVencer.value.length || null },
  { id: 'stock_bajo', nombre: 'Stock bajo',        badge: productosStockBajo.value.length || null },
  { id: 'movimientos', nombre: 'Movimientos', badge: null }
]);

async function cargarResumen() {
  cargandoResumen.value = true;
  try {
    const { data } = await api.get('/stock/resumen');
    lotesPorVencer.value    = data.lotes_por_vencer;
    productosStockBajo.value = data.productos_stock_bajo;
  } finally { cargandoResumen.value = false; }
}

async function cargarMovimientos() {
  cargandoMov.value = true;
  try {
    const { data } = await api.get('/stock/movimientos', {
      params: { limite: 50, ...filtrosMov.value }
    });
    movimientos.value = data.movimientos;
    totalMov.value    = data.total;
  } finally { cargandoMov.value = false; }
}

function abrirAjuste() {
  ajuste.value = { busqueda: '', productoSeleccionado: null, tipo: 'merma', cantidad: '', motivo: '' };
  resultadosBusqueda.value = [];
  errorAjuste.value = '';
  modalAjuste.value = true;
}

async function buscarProductoAjuste() {
  clearTimeout(timerBusquedaAjuste);
  if (!ajuste.value.busqueda.trim()) { resultadosBusqueda.value = []; return; }
  timerBusquedaAjuste = setTimeout(async () => {
    const { data } = await api.get('/productos', { params: { busqueda: ajuste.value.busqueda, limite: 8 } });
    resultadosBusqueda.value = data.productos;
  }, 300);
}

function seleccionarProducto(p) {
  ajuste.value.productoSeleccionado = p;
  ajuste.value.busqueda = '';
  resultadosBusqueda.value = [];
}

async function guardarAjuste() {
  if (!ajuste.value.productoSeleccionado) { errorAjuste.value = 'Selecciona un producto'; return; }
  guardandoAjuste.value = true; errorAjuste.value = '';
  try {
    await api.post('/stock/ajuste', {
      producto_id: ajuste.value.productoSeleccionado.id,
      tipo:        ajuste.value.tipo,
      cantidad:    parseInt(ajuste.value.cantidad),
      motivo:      ajuste.value.motivo
    });
    modalAjuste.value = false;
    cargarResumen(); cargarMovimientos();
  } catch (err) {
    errorAjuste.value = err.response?.data?.error || 'Error al registrar el ajuste';
  } finally { guardandoAjuste.value = false; }
}

async function ejecutarJobAlertas() {
  try {
    await api.post('/stock/generar-alertas');
    alert('Alertas generadas correctamente.');
    cargarResumen();
  } catch (err) {
    alert(err.response?.data?.error || 'Error al generar alertas');
  }
}

function diasHasta(fechaStr) {
  if (!fechaStr) return null;
  return Math.ceil((new Date(fechaStr + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
}

function claseLote(l)  {
  const d = diasHasta(l.fecha_vencimiento);
  if (d === null)  return '';
  if (d <= 3)  return 'border-red-200 bg-red-50';
  if (d <= 7)  return 'border-orange-200 bg-orange-50';
  return 'border-green-200 bg-green-50';
}
function punteLote(l)  {
  const d = diasHasta(l.fecha_vencimiento);
  if (d === null) return 'bg-gray-300';
  if (d <= 3)  return 'bg-red-500';
  if (d <= 7)  return 'bg-orange-400';
  return 'bg-green-500';
}
function textoLote(l) {
  const d = diasHasta(l.fecha_vencimiento);
  if (d === null) return 'text-gray-400';
  if (d <= 3)  return 'text-red-600';
  if (d <= 7)  return 'text-orange-600';
  return 'text-green-700';
}

function etiquetaVencimiento(lote) {
  const d = diasHasta(lote.fecha_vencimiento);
  if (d === null) return 'Sin fecha';
  if (d < 0)  return `Vencido hace ${Math.abs(d)} día(s)`;
  if (d === 0) return 'Vence HOY';
  if (d <= 7)  return `Vence en ${d} día(s)`;
  return `Vence: ${formatFecha(lote.fecha_vencimiento)}`;
}

function badgeTipo(tipo) {
  const map = { entrada: 'badge-verde', salida: 'badge-rojo', ajuste: 'badge-azul', merma: 'badge-amarillo' };
  return map[tipo] || 'badge-gris';
}

function formatFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('es-PY', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

onMounted(() => { cargarResumen(); cargarMovimientos(); });
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
