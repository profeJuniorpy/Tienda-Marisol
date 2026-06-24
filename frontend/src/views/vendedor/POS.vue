<template>
  <div class="flex h-[calc(100vh-4rem)] gap-0 -m-6">

    <!-- ───── Panel izquierdo: búsqueda + resultados ───── -->
    <div class="flex flex-col w-1/2 border-r border-gray-200 bg-white">

      <!-- Barra de búsqueda -->
      <div class="p-4 border-b border-gray-100 bg-gray-50">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref="inputBusqueda"
              v-model="busqueda"
              @input="buscarProductos"
              @keydown.enter="agregarPrimeroDelResultado"
              type="text"
              placeholder="Buscar por nombre o código de barras..."
              class="input pl-10 w-full"
              autofocus
            />
          </div>
          <button
            @click="toggleScanner"
            :class="['px-3 py-2 rounded-lg border text-sm font-medium transition-colors', scannerActivo ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400']"
            title="Escaner de cámara"
          >
            <CameraIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Área del escaner de cámara -->
        <div v-if="scannerActivo" class="mt-3">
          <div id="scanner-viewport" class="w-full h-36 rounded-lg overflow-hidden bg-black relative">
            <p class="absolute inset-0 flex items-center justify-center text-white text-xs opacity-70">Apuntá la cámara al código de barras</p>
          </div>
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div class="flex-1 overflow-y-auto p-3">
        <div v-if="buscando" class="flex justify-center py-8">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="busqueda && resultados.length === 0" class="text-center py-8 text-gray-400 text-sm">
          Sin resultados para "{{ busqueda }}"
        </div>

        <div v-else-if="resultados.length > 0" class="grid grid-cols-2 gap-2">
          <button
            v-for="p in resultados"
            :key="p.id"
            @click="agregarAlCarrito(p)"
            :disabled="p.stock_actual <= 0"
            :class="['text-left p-3 rounded-xl border transition-all', p.stock_actual > 0 ? 'hover:border-primary-400 hover:bg-primary-50 bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed']"
          >
            <div class="flex gap-2">
              <img v-if="p.imagen_url" :src="p.imagen_url" class="h-12 w-12 object-cover rounded-lg flex-shrink-0" />
              <div v-else class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <CubeIcon class="h-6 w-6 text-gray-300" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ p.nombre }}</p>
                <p class="text-xs text-gray-500">Stock: {{ p.stock_actual }} {{ p.unidad_medida }}</p>
                <p class="text-base font-bold text-primary-700 mt-0.5">{{ formatGs(p.precio_venta) }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Estado vacío inicial -->
        <div v-else class="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400">
          <ComputerDesktopIcon class="h-16 w-16 mb-3 opacity-20" />
          <p class="text-sm">Buscá un producto o escaneá un código</p>
        </div>
      </div>
    </div>

    <!-- ───── Panel derecho: carrito + totales ───── -->
    <div class="flex flex-col w-1/2 bg-white">

      <!-- Header carrito -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCartIcon class="h-5 w-5 text-primary-600" />
          Carrito
          <span v-if="carrito.length > 0" class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{{ carrito.length }} ítem{{ carrito.length !== 1 ? 's' : '' }}</span>
        </h2>
        <button v-if="carrito.length > 0" @click="vaciarCarrito" class="text-xs text-red-500 hover:text-red-700">
          Vaciar
        </button>
      </div>

      <!-- Ítems del carrito -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center h-full text-gray-300 py-16">
          <ShoppingCartIcon class="h-16 w-16 mb-3 opacity-30" />
          <p class="text-sm">El carrito está vacío</p>
        </div>

        <div v-else>
          <div
            v-for="item in carrito"
            :key="item.producto_id"
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
          >
            <!-- Nombre -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.nombre }}</p>
              <p class="text-xs text-gray-500">{{ formatGs(item.precio_unitario) }} c/u · {{ item.tasa_iva }}</p>
            </div>

            <!-- Cantidad -->
            <div class="flex items-center gap-1">
              <button @click="decrementar(item)" class="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary-400 hover:text-primary-600 text-lg leading-none">−</button>
              <input
                type="number"
                v-model.number="item.cantidad"
                @change="validarCantidad(item)"
                min="1"
                class="w-12 text-center text-sm font-bold border-0 focus:ring-0 p-0"
              />
              <button @click="incrementar(item)" class="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary-400 hover:text-primary-600 text-lg leading-none">+</button>
            </div>

            <!-- Subtotal -->
            <div class="text-right w-24">
              <p class="text-sm font-bold text-gray-900">{{ formatGs(item.precio_unitario * item.cantidad) }}</p>
            </div>

            <!-- Eliminar -->
            <button @click="quitarDelCarrito(item.producto_id)" class="text-gray-300 hover:text-red-400 transition-colors ml-1">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de totales + cobro -->
      <div class="border-t border-gray-200 p-4 space-y-3">
        <!-- Descuento -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-500 flex-1">Descuento (Gs.)</label>
          <input
            v-model.number="descuento"
            type="number"
            min="0"
            class="w-32 text-right input py-1 text-sm"
            placeholder="0"
          />
        </div>

        <!-- Datos factura -->
        <div class="border border-dashed border-gray-200 rounded-lg p-3 space-y-2">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Datos del comprobante</p>
          <input v-model="datosFactura.nombre_cliente" type="text" placeholder="Nombre del cliente" class="input text-sm w-full py-1.5" />
          <input v-model="datosFactura.ruc_cliente"    type="text" placeholder="RUC (opcional)" class="input text-sm w-full py-1.5" />
        </div>

        <!-- Método de pago -->
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="m in metodosPago" :key="m.valor"
            @click="metodoPago = m.valor"
            :class="['py-2 rounded-lg text-xs font-medium border transition-colors', metodoPago === m.valor ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
          >
            {{ m.icono }} {{ m.nombre }}
          </button>
        </div>

        <!-- Totales IVA -->
        <div class="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{{ formatGs(totales.subtotal) }}</span>
          </div>
          <div v-if="totales.iva10 > 0" class="flex justify-between text-gray-500">
            <span>IVA 10%</span>
            <span>{{ formatGs(totales.iva10) }}</span>
          </div>
          <div v-if="totales.iva5 > 0" class="flex justify-between text-gray-500">
            <span>IVA 5%</span>
            <span>{{ formatGs(totales.iva5) }}</span>
          </div>
          <div v-if="descuento > 0" class="flex justify-between text-red-500">
            <span>Descuento</span>
            <span>−{{ formatGs(descuento) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
            <span>TOTAL</span>
            <span class="text-primary-700">{{ formatGs(totalFinal) }}</span>
          </div>
        </div>

        <!-- Botón confirmar -->
        <button
          @click="confirmarVenta"
          :disabled="carrito.length === 0 || procesando"
          class="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all"
          :class="carrito.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:scale-95'"
        >
          <span v-if="procesando" class="flex items-center justify-center gap-2">
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </span>
          <span v-else>Confirmar venta · {{ formatGs(totalFinal) }}</span>
        </button>
      </div>
    </div>

    <!-- ───── Modal de comprobante ───── -->
    <div v-if="ventaConfirmada" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Éxito -->
          <div class="text-center mb-4">
            <div class="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon class="h-8 w-8 text-green-600" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">Venta registrada</h2>
            <p class="text-sm text-gray-500 mt-1">
              Comprobante {{ ventaConfirmada.factura.numero_comprobante }}
              <span :class="['ml-1 text-xs font-semibold', estadoSifenClass(ventaConfirmada.factura.estado_sifen)]">
                ({{ ventaConfirmada.factura.estado_sifen }})
              </span>
            </p>
          </div>

          <!-- Resumen KuDE -->
          <div id="kude-print" class="border border-gray-200 rounded-xl p-4 text-sm font-mono space-y-1">
            <p class="text-center font-bold text-base">{{ ventaConfirmada.factura.emisor?.nombre }}</p>
            <p class="text-center text-xs text-gray-500">RUC: {{ ventaConfirmada.factura.emisor?.ruc }}</p>
            <p class="text-center text-xs text-gray-500 mb-3">{{ ventaConfirmada.factura.emisor?.direccion }}</p>
            <p class="text-center text-xs font-semibold mb-2">COMPROBANTE N° {{ ventaConfirmada.factura.numero_comprobante }}</p>

            <div class="border-t pt-2 space-y-1">
              <div v-for="item in ventaConfirmada.items" :key="item.producto_id" class="flex justify-between text-xs">
                <span class="flex-1 truncate pr-2">{{ item.nombre || item.producto_id }} x{{ item.cantidad }}</span>
                <span>{{ formatGs(item.precio_unitario * item.cantidad) }}</span>
              </div>
            </div>

            <div class="border-t pt-2 space-y-0.5 text-xs text-gray-600">
              <div class="flex justify-between" v-if="ventaConfirmada.factura.iva_10 > 0">
                <span>IVA 10%</span><span>{{ formatGs(ventaConfirmada.factura.iva_10) }}</span>
              </div>
              <div class="flex justify-between" v-if="ventaConfirmada.factura.iva_5 > 0">
                <span>IVA 5%</span><span>{{ formatGs(ventaConfirmada.factura.iva_5) }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 text-sm pt-1">
                <span>TOTAL</span><span>{{ formatGs(ventaConfirmada.factura.total) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Método de pago</span><span class="capitalize">{{ ventaConfirmada.venta.metodo_pago }}</span>
              </div>
            </div>

            <p class="text-center text-xs text-gray-400 mt-2 border-t pt-2">
              Cliente: {{ ventaConfirmada.factura.nombre_cliente }}<br>
              {{ new Date(ventaConfirmada.venta.created_at).toLocaleString('es-PY') }}
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-2 mt-4">
            <button @click="imprimirKuDE" class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
              <PrinterIcon class="h-4 w-4" /> Imprimir
            </button>
            <button @click="nuevaVenta" class="btn-primary flex-1 text-sm">
              Nueva venta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  MagnifyingGlassIcon, CameraIcon, ShoppingCartIcon, XMarkIcon,
  ComputerDesktopIcon, CubeIcon, CheckCircleIcon, PrinterIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';

// ─── Estado ───────────────────────────────────────────────────────────────────

const inputBusqueda  = ref(null);
const busqueda       = ref('');
const resultados     = ref([]);
const buscando       = ref(false);
const carrito        = ref([]);
const descuento      = ref(0);
const metodoPago     = ref('efectivo');
const procesando     = ref(false);
const ventaConfirmada = ref(null);
const scannerActivo  = ref(false);
const datosFactura   = ref({ nombre_cliente: '', ruc_cliente: '' });

let debounceTimer = null;
let Quagga        = null;

// ─── Métodos de pago ──────────────────────────────────────────────────────────

const metodosPago = [
  { valor: 'efectivo',     nombre: 'Efectivo',    icono: '💵' },
  { valor: 'tarjeta',      nombre: 'Tarjeta',     icono: '💳' },
  { valor: 'transferencia', nombre: 'Transfer.',  icono: '🏦' },
  { valor: 'qr',           nombre: 'QR',          icono: '📱' }
];

// ─── Totales ──────────────────────────────────────────────────────────────────

const totales = computed(() => {
  let subtotal = 0, iva10 = 0, iva5 = 0;
  for (const item of carrito.value) {
    const base = item.precio_unitario * item.cantidad;
    subtotal  += base;
    if (item.tasa_iva === 'IVA_10') iva10 += base * 10 / 110;
    if (item.tasa_iva === 'IVA_5')  iva5  += base *  5 / 105;
  }
  return {
    subtotal: Math.round(subtotal),
    iva10:    Math.round(iva10),
    iva5:     Math.round(iva5)
  };
});

const totalFinal = computed(() => Math.max(0, totales.value.subtotal - (descuento.value || 0)));

// ─── Búsqueda de productos ────────────────────────────────────────────────────

function buscarProductos() {
  clearTimeout(debounceTimer);
  if (!busqueda.value.trim()) { resultados.value = []; return; }
  buscando.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const { data } = await api.get('/productos', { params: { busqueda: busqueda.value, limit: 20 } });
      resultados.value = data.productos || [];
    } finally {
      buscando.value = false;
    }
  }, 300);
}

function agregarPrimeroDelResultado() {
  if (resultados.value.length > 0 && resultados.value[0].stock_actual > 0) {
    agregarAlCarrito(resultados.value[0]);
  }
}

// ─── Gestión del carrito ──────────────────────────────────────────────────────

function agregarAlCarrito(producto) {
  const existente = carrito.value.find(i => i.producto_id === producto.id);
  if (existente) {
    if (existente.cantidad < producto.stock_actual) existente.cantidad++;
  } else {
    carrito.value.push({
      producto_id:     producto.id,
      nombre:          producto.nombre,
      precio_unitario: parseFloat(producto.precio_venta),
      tasa_iva:        producto.tasa_iva || 'IVA_10',
      cantidad:        1,
      stock_max:       producto.stock_actual
    });
  }
  // Limpiar búsqueda para siguiente producto
  busqueda.value   = '';
  resultados.value = [];
  inputBusqueda.value?.focus();
}

function incrementar(item) {
  if (item.cantidad < item.stock_max) item.cantidad++;
}

function decrementar(item) {
  if (item.cantidad > 1) item.cantidad--;
  else quitarDelCarrito(item.producto_id);
}

function validarCantidad(item) {
  if (!item.cantidad || item.cantidad < 1) item.cantidad = 1;
  if (item.cantidad > item.stock_max) item.cantidad = item.stock_max;
}

function quitarDelCarrito(productoId) {
  carrito.value = carrito.value.filter(i => i.producto_id !== productoId);
}

function vaciarCarrito() {
  carrito.value  = [];
  descuento.value = 0;
  datosFactura.value = { nombre_cliente: '', ruc_cliente: '' };
}

// ─── Confirmar venta ──────────────────────────────────────────────────────────

async function confirmarVenta() {
  if (carrito.value.length === 0 || procesando.value) return;
  procesando.value = true;

  try {
    const payload = {
      items: carrito.value.map(i => ({
        producto_id:     i.producto_id,
        cantidad:        i.cantidad,
        precio_unitario: i.precio_unitario,
        tasa_iva:        i.tasa_iva,
        nombre:          i.nombre
      })),
      metodo_pago:   metodoPago.value,
      descuento:     descuento.value || 0,
      datos_factura: {
        nombre_cliente: datosFactura.value.nombre_cliente || 'Sin nombre',
        ruc_cliente:    datosFactura.value.ruc_cliente    || null
      }
    };

    const { data } = await api.post('/ventas', payload);
    ventaConfirmada.value = data;
    carrito.value         = [];
    descuento.value       = 0;
    datosFactura.value    = { nombre_cliente: '', ruc_cliente: '' };
  } catch (err) {
    const msg = err.response?.data?.error || 'Error al procesar la venta';
    alert(msg);
  } finally {
    procesando.value = false;
  }
}

function nuevaVenta() {
  ventaConfirmada.value = null;
  inputBusqueda.value?.focus();
}

// ─── Imprimir KuDE ────────────────────────────────────────────────────────────

function imprimirKuDE() {
  const contenido = document.getElementById('kude-print')?.innerHTML;
  if (!contenido) return;
  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Comprobante</title>
<style>
  body { font-family: monospace; font-size: 12px; margin: 16px; }
  .total { font-weight: bold; font-size: 14px; }
  hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
</style></head><body>${contenido}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// ─── Escaner de cámara ────────────────────────────────────────────────────────

async function toggleScanner() {
  if (scannerActivo.value) {
    pararScanner();
    return;
  }

  scannerActivo.value = true;
  await new Promise(r => setTimeout(r, 200)); // esperar que el div exista

  try {
    if (!Quagga) {
      const mod = await import('@ericblade/quagga2');
      Quagga = mod.default;
    }

    Quagga.init({
      inputStream: {
        type:       'LiveStream',
        target:     document.getElementById('scanner-viewport'),
        constraints: { facingMode: 'environment' }
      },
      decoder: { readers: ['ean_reader', 'code_128_reader', 'upc_reader'] }
    }, (err) => {
      if (err) { console.error('Quagga init error:', err); pararScanner(); return; }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const codigo = result.codeResult.code;
      if (codigo) {
        busqueda.value = codigo;
        buscarProductos();
        pararScanner();
      }
    });
  } catch (e) {
    console.error('Scanner error:', e);
    pararScanner();
  }
}

function pararScanner() {
  if (Quagga) {
    try { Quagga.stop(); } catch {}
  }
  scannerActivo.value = false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function estadoSifenClass(estado) {
  if (estado === 'aprobado')     return 'text-green-600';
  if (estado === 'rechazado')    return 'text-red-600';
  if (estado === 'contingencia') return 'text-orange-500';
  return 'text-gray-500';
}

onUnmounted(() => {
  pararScanner();
  clearTimeout(debounceTimer);
});

onMounted(() => {
  inputBusqueda.value?.focus();
});
</script>
