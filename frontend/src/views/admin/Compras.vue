<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Compras a proveedores</h1>
        <p class="text-sm text-gray-500 mt-1">Registro de entradas de stock</p>
      </div>
      <button @click="abrirNuevaCompra" class="btn-primary">+ Registrar compra</button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="label">Proveedor</label>
          <select v-model="filtros.proveedor_id" class="input text-sm w-44" @change="cargar()">
            <option value="">Todos</option>
            <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="label">Desde</label>
          <input v-model="filtros.desde" type="date" class="input text-sm" @change="cargar()" />
        </div>
        <div>
          <label class="label">Hasta</label>
          <input v-model="filtros.hasta" type="date" class="input text-sm" @change="cargar()" />
        </div>
        <button @click="limpiarFiltros" class="btn-secondary text-sm">Limpiar</button>
      </div>
    </div>

    <!-- Tabla de historial -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <div v-else-if="compras.length === 0" class="text-center py-12 text-gray-400">
        <ShoppingBagIcon class="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay compras registradas</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Fecha</th>
            <th class="text-left px-4 py-3">Proveedor</th>
            <th class="text-left px-4 py-3">N° Factura</th>
            <th class="text-center px-4 py-3">Ítems</th>
            <th class="text-right px-4 py-3">Total</th>
            <th class="text-center px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="c in compras" :key="c.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-700">{{ formatFecha(c.fecha_compra || c.created_at) }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ c.proveedor?.nombre || '—' }}</td>
            <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ c.numero_factura || '—' }}</td>
            <td class="px-4 py-3 text-center text-gray-600">{{ c.detalles?.length ?? '—' }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ formatGs(c.total) }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="claseEstado(c.estado)">{{ c.estado }}</span>
            </td>
            <td class="px-4 py-3">
              <button @click="verDetalle(c)" class="text-xs text-primary-600 hover:underline">Ver detalle</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="flex justify-center gap-2 pt-4 border-t">
        <button v-for="p in totalPaginas" :key="p"
          @click="pagina = p; cargar()"
          :class="['px-3 py-1 text-sm rounded-lg border', pagina === p ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-600 border-gray-200 hover:border-primary-300']">
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Modal detalle -->
    <div v-if="compraDetalle" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">Compra #{{ compraDetalle.id }}</h3>
          <button @click="compraDetalle = null"><XMarkIcon class="h-5 w-5 text-gray-400" /></button>
        </div>
        <div class="p-5 space-y-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4 space-y-1.5">
            <div class="flex justify-between"><span class="text-gray-500">Proveedor</span><span class="font-medium">{{ compraDetalle.proveedor?.nombre }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Fecha</span><span>{{ formatFecha(compraDetalle.fecha_compra) }}</span></div>
            <div v-if="compraDetalle.numero_factura" class="flex justify-between"><span class="text-gray-500">N° Factura</span><span class="font-mono">{{ compraDetalle.numero_factura }}</span></div>
            <div v-if="compraDetalle.observaciones" class="flex justify-between"><span class="text-gray-500">Observaciones</span><span>{{ compraDetalle.observaciones }}</span></div>
          </div>
          <div>
            <h4 class="font-semibold text-gray-700 mb-2">Ítems recibidos</h4>
            <div class="divide-y divide-gray-100">
              <div v-for="d in compraDetalle.detalles" :key="d.id" class="flex justify-between py-2.5">
                <div>
                  <p class="text-gray-800 font-medium">{{ d.producto?.nombre }}</p>
                  <p class="text-xs text-gray-400">{{ d.cantidad }} unid. × {{ formatGs(d.precio_unitario) }}</p>
                </div>
                <span class="font-semibold text-gray-900">{{ formatGs(d.subtotal) }}</span>
              </div>
            </div>
            <div class="flex justify-between font-bold text-gray-900 border-t pt-3 mt-1">
              <span>Total</span>
              <span class="text-primary-700">{{ formatGs(compraDetalle.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nueva compra -->
    <div v-if="modalCompra" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h3 class="font-bold text-gray-900">Registrar compra a proveedor</h3>
          <button @click="modalCompra = false"><XMarkIcon class="h-5 w-5 text-gray-400" /></button>
        </div>

        <form @submit.prevent="registrarCompra" class="p-5 space-y-5">
          <!-- Cabecera de la compra -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="label">Proveedor <span class="text-red-500">*</span></label>
              <select v-model="compra.proveedor_id" class="input" required>
                <option value="">Seleccionar...</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="label">Fecha de compra <span class="text-red-500">*</span></label>
              <input v-model="compra.fecha_compra" type="date" class="input" required />
            </div>
            <div>
              <label class="label">N° de factura</label>
              <input v-model="compra.numero_factura" class="input" placeholder="Opcional" />
            </div>
            <div class="sm:col-span-3">
              <label class="label">Observaciones</label>
              <input v-model="compra.observaciones" class="input" placeholder="Opcional" />
            </div>
          </div>

          <!-- Ítems -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-700">Productos recibidos</h4>
              <button type="button" @click="agregarItem" class="btn-secondary text-xs">+ Agregar producto</button>
            </div>

            <div v-if="compra.items.length === 0" class="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Agrega al menos un producto para continuar
            </div>

            <div class="space-y-3">
              <div v-for="(item, idx) in compra.items" :key="idx"
                class="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-6 gap-3 items-start">

                <!-- Búsqueda de producto -->
                <div class="col-span-2 sm:col-span-2">
                  <label class="label text-xs">Producto <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input v-model="item.busqueda" @input="buscarProducto(idx)"
                      class="input text-sm" placeholder="Buscar producto..." autocomplete="off" />
                    <div v-if="item.sugerencias?.length"
                      class="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                      <button v-for="prod in item.sugerencias" :key="prod.id" type="button"
                        @click="seleccionarProducto(idx, prod)"
                        class="w-full text-left px-3 py-2 text-xs hover:bg-primary-50 border-b last:border-0">
                        <span class="font-medium">{{ prod.nombre }}</span>
                        <span class="text-gray-400 ml-2">Stock: {{ prod.stock_actual }}</span>
                      </button>
                    </div>
                    <p v-if="item.producto_id" class="text-xs text-primary-700 mt-1 font-medium">
                      ✓ {{ item.nombre_producto }}
                    </p>
                  </div>
                </div>

                <!-- Cantidad -->
                <div>
                  <label class="label text-xs">Cantidad <span class="text-red-500">*</span></label>
                  <input v-model="item.cantidad" type="number" min="1" class="input text-sm" required />
                </div>

                <!-- Precio unitario -->
                <div>
                  <label class="label text-xs">Costo unit. (Gs)</label>
                  <input v-model="item.precio_unitario" type="number" min="0" class="input text-sm" placeholder="0" />
                </div>

                <!-- Fecha vencimiento -->
                <div>
                  <label class="label text-xs">Vencimiento</label>
                  <input v-model="item.fecha_vencimiento" type="date" class="input text-sm" />
                </div>

                <!-- Botón quitar -->
                <div class="flex items-end">
                  <button type="button" @click="quitarItem(idx)"
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full flex justify-center">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>

                <!-- Subtotal -->
                <div v-if="item.precio_unitario && item.cantidad" class="col-span-2 sm:col-span-6 text-right text-xs text-gray-500">
                  Subtotal: <span class="font-semibold text-gray-800">{{ formatGs(item.precio_unitario * item.cantidad) }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div v-if="compra.items.length > 0" class="flex justify-end mt-4 pr-1">
              <div class="bg-primary-50 border border-primary-200 rounded-xl px-5 py-3 text-right">
                <p class="text-xs text-primary-600 mb-0.5">Total de la compra</p>
                <p class="text-xl font-bold text-primary-800">{{ formatGs(totalCompra) }}</p>
              </div>
            </div>
          </div>

          <p v-if="errorCompra" class="text-sm text-red-600 bg-red-50 rounded-lg p-3">{{ errorCompra }}</p>

          <div class="flex gap-3 pt-2 border-t">
            <button type="button" @click="modalCompra = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" :disabled="registrando || compra.items.length === 0" class="btn-primary flex-1">
              {{ registrando ? 'Registrando...' : 'Confirmar compra y actualizar stock' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ShoppingBagIcon, XMarkIcon, TrashIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

// ─── Estado ──────────────────────────────────────────────────────────────────
const compras      = ref([]);
const proveedores  = ref([]);
const cargando     = ref(false);
const compraDetalle = ref(null);
const modalCompra  = ref(false);
const registrando  = ref(false);
const errorCompra  = ref('');
const pagina       = ref(1);
const total        = ref(0);
const limite       = 15;

const filtros = ref({ proveedor_id: '', desde: '', hasta: '' });

const totalPaginas = computed(() => Math.ceil(total.value / limite));

const totalCompra = computed(() =>
  compra.value.items.reduce((s, i) =>
    s + (parseFloat(i.precio_unitario) || 0) * (parseInt(i.cantidad) || 0), 0)
);

const COMPRA_VACIA = () => ({
  proveedor_id: '',
  fecha_compra: new Date().toISOString().split('T')[0],
  numero_factura: '',
  observaciones: '',
  items: []
});
const compra = ref(COMPRA_VACIA());

// ─── Cargar ───────────────────────────────────────────────────────────────────
async function cargar() {
  cargando.value = true;
  try {
    const params = { pagina: pagina.value, limite };
    if (filtros.value.proveedor_id) params.proveedor_id = filtros.value.proveedor_id;
    if (filtros.value.desde) params.desde = filtros.value.desde;
    if (filtros.value.hasta) params.hasta = filtros.value.hasta;
    const { data } = await api.get('/compras', { params });
    compras.value = data.compras || [];
    total.value   = data.total   || 0;
  } finally {
    cargando.value = false;
  }
}

async function cargarProveedores() {
  const { data } = await api.get('/proveedores');
  proveedores.value = Array.isArray(data) ? data : (data.proveedores || []);
}

function limpiarFiltros() {
  filtros.value = { proveedor_id: '', desde: '', hasta: '' };
  pagina.value = 1;
  cargar();
}

// ─── Detalle ─────────────────────────────────────────────────────────────────
async function verDetalle(c) {
  try {
    const { data } = await api.get(`/compras/${c.id}`);
    compraDetalle.value = data;
  } catch {
    compraDetalle.value = c;
  }
}

// ─── Nueva compra ─────────────────────────────────────────────────────────────
function abrirNuevaCompra() {
  compra.value    = COMPRA_VACIA();
  errorCompra.value = '';
  modalCompra.value = true;
}

function agregarItem() {
  compra.value.items.push({
    producto_id: null, nombre_producto: '',
    busqueda: '', sugerencias: [],
    cantidad: 1, precio_unitario: '', fecha_vencimiento: ''
  });
}

function quitarItem(idx) {
  compra.value.items.splice(idx, 1);
}

const timers = {};
async function buscarProducto(idx) {
  clearTimeout(timers[idx]);
  const q = compra.value.items[idx].busqueda;
  if (!q.trim()) { compra.value.items[idx].sugerencias = []; return; }
  timers[idx] = setTimeout(async () => {
    const { data } = await api.get('/productos', { params: { busqueda: q, limite: 6 } });
    compra.value.items[idx].sugerencias = data.productos || [];
  }, 280);
}

function seleccionarProducto(idx, prod) {
  const item = compra.value.items[idx];
  item.producto_id     = prod.id;
  item.nombre_producto = prod.nombre;
  item.busqueda        = '';
  item.sugerencias     = [];
  if (!item.precio_unitario && prod.precio_costo) {
    item.precio_unitario = prod.precio_costo;
  }
}

async function registrarCompra() {
  const sinProducto = compra.value.items.some(i => !i.producto_id);
  if (sinProducto) {
    errorCompra.value = 'Todos los ítems deben tener un producto seleccionado';
    return;
  }

  registrando.value = true;
  errorCompra.value = '';
  try {
    await api.post('/compras', {
      proveedor_id:   compra.value.proveedor_id || null,
      fecha_compra:   compra.value.fecha_compra,
      numero_factura: compra.value.numero_factura || null,
      observaciones:  compra.value.observaciones  || null,
      items: compra.value.items.map(i => ({
        producto_id:       i.producto_id,
        cantidad:          parseInt(i.cantidad),
        precio_unitario:   parseFloat(i.precio_unitario) || 0,
        fecha_vencimiento: i.fecha_vencimiento || null
      }))
    });
    modalCompra.value = false;
    await cargar();
  } catch (err) {
    errorCompra.value = err.response?.data?.error || 'Error al registrar la compra';
  } finally {
    registrando.value = false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatFecha(d) {
  if (!d) return '—';
  return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-PY', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function claseEstado(e) {
  const m = { recibida: 'badge-verde', pendiente: 'badge-amarillo', cancelada: 'badge-rojo' };
  return m[e] || 'badge-gris';
}

onMounted(async () => {
  await Promise.all([cargar(), cargarProveedores()]);
});
</script>
