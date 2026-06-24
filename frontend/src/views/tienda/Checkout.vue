<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Elegir horario de retiro</h1>

    <!-- Carrito vacío -->
    <div v-if="carritoStore.estaVacio" class="text-center py-16 text-gray-400">
      <p>Tu carrito está vacío.</p>
      <RouterLink to="/tienda" class="btn-primary mt-4 inline-block">Ver productos</RouterLink>
    </div>

    <!-- Pedido confirmado -->
    <div v-else-if="pedidoConfirmado" class="text-center">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon class="h-10 w-10 text-green-600" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Pedido confirmado</h2>
        <p class="text-gray-500 text-sm mb-6">Te enviamos una confirmación a tu email.</p>

        <!-- Código retiro destacado -->
        <div class="bg-primary-700 text-white rounded-2xl p-6 mb-6">
          <p class="text-sm opacity-75 mb-1">Tu código de retiro</p>
          <p class="text-4xl font-bold tracking-widest">{{ pedidoConfirmado.codigo_retiro }}</p>
          <p class="text-sm opacity-75 mt-3">Mostrá este código al retirar tu pedido</p>
        </div>

        <!-- Slot seleccionado -->
        <div class="bg-gray-50 rounded-xl p-4 text-left mb-6">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Horario de retiro</p>
          <p class="font-semibold text-gray-800">{{ formatFecha(pedidoConfirmado.slot?.fecha) }}</p>
          <p class="text-primary-600 font-medium">{{ pedidoConfirmado.slot?.hora_inicio }} – {{ pedidoConfirmado.slot?.hora_fin }}</p>
          <p class="text-sm text-gray-500 mt-1">Mercado Nro. 1 — Coronel Oviedo</p>
        </div>

        <!-- Total -->
        <div class="flex justify-between text-lg font-bold text-gray-900 mb-6 border-t pt-4">
          <span>Total a pagar</span>
          <span class="text-primary-700">{{ formatGs(pedidoConfirmado.total) }}</span>
        </div>

        <RouterLink to="/tienda/mis-pedidos" class="btn-primary block text-center w-full py-3">
          Ver mis pedidos
        </RouterLink>
      </div>
    </div>

    <!-- Flujo normal -->
    <div v-else class="space-y-5">

      <!-- 1. Resumen del carrito -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 class="font-semibold text-gray-800 mb-3">Resumen</h2>
        <div class="space-y-2">
          <div v-for="item in carritoStore.items" :key="item.producto_id"
            class="flex justify-between text-sm text-gray-700">
            <span>{{ item.nombre }} × {{ item.cantidad }}</span>
            <span>{{ formatGs(item.subtotal) }}</span>
          </div>
        </div>
        <div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 mt-3 pt-3">
          <span>Total</span>
          <span class="text-primary-700">{{ formatGs(carritoStore.total) }}</span>
        </div>
      </div>

      <!-- 2. Selección de slot -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 class="font-semibold text-gray-800 mb-4">Horario de retiro</h2>

        <div v-if="cargandoSlots" class="flex justify-center py-6">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="slots.length === 0" class="text-center text-gray-400 py-4 text-sm">
          No hay horarios disponibles en este momento. Comunicate con la tienda.
        </div>

        <div v-else class="space-y-2">
          <!-- Agrupar por fecha -->
          <div v-for="(grupo, fecha) in slotsPorFecha" :key="fecha">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mt-3 mb-1.5">{{ formatFecha(fecha) }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="s in grupo" :key="s.id"
                @click="!s.lleno && (slotSeleccionado = s)"
                :disabled="s.lleno"
                :class="[
                  'border rounded-xl py-3 px-4 text-left transition-all text-sm',
                  s.lleno ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' :
                  slotSeleccionado?.id === s.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300' :
                  'bg-white border-gray-200 hover:border-primary-300'
                ]"
              >
                <p class="font-semibold text-gray-800">{{ s.hora_inicio }} – {{ s.hora_fin }}</p>
                <p :class="['text-xs mt-0.5', s.lleno ? 'text-red-400' : 'text-gray-400']">
                  {{ s.lleno ? 'Completo' : `${s.disponibles} lugar${s.disponibles !== 1 ? 'es' : ''}` }}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Datos de contacto (si no está logueado) -->
      <div v-if="!clienteStore.estaAutenticado" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 class="font-semibold text-gray-800 mb-4">Tus datos</h2>
        <p class="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
          Para hacer un pedido, necesitás
          <RouterLink to="/tienda/login?redirect=/tienda/checkout" class="font-semibold underline">iniciar sesión</RouterLink>
          o
          <RouterLink to="/tienda/registro" class="font-semibold underline">registrarte</RouterLink>.
        </p>
      </div>

      <!-- 4. Confirmar -->
      <div v-if="error" class="text-red-600 text-sm bg-red-50 rounded-xl p-3">{{ error }}</div>

      <button
        v-if="clienteStore.estaAutenticado"
        @click="confirmarPedido"
        :disabled="!slotSeleccionado || procesando"
        class="w-full btn-primary py-4 text-base font-bold rounded-2xl"
        :class="!slotSeleccionado ? 'opacity-50 cursor-not-allowed' : ''"
      >
        <span v-if="procesando" class="flex items-center justify-center gap-2">
          <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Confirmando...
        </span>
        <span v-else>Confirmar pedido</span>
      </button>

      <RouterLink
        v-else
        to="/tienda/login?redirect=/tienda/checkout"
        class="btn-primary w-full block text-center py-4 text-base font-bold rounded-2xl"
      >
        Ingresar para confirmar
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';
import { useCarritoStore }  from '@/stores/carrito.store';
import { useClienteStore }  from '@/stores/cliente.store';
import tiendaApi from '@/services/tiendaApi';
import api from '@/services/api';

const carritoStore  = useCarritoStore();
const clienteStore  = useClienteStore();

const slots          = ref([]);
const cargandoSlots  = ref(false);
const slotSeleccionado = ref(null);
const pedidoConfirmado = ref(null);
const procesando     = ref(false);
const error          = ref('');

const slotsPorFecha = computed(() => {
  return slots.value.reduce((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = [];
    acc[s.fecha].push(s);
    return acc;
  }, {});
});

async function cargarSlots() {
  cargandoSlots.value = true;
  try {
    const { data } = await api.get('/tienda/slots');
    slots.value = data.slots || [];
  } finally {
    cargandoSlots.value = false;
  }
}

async function confirmarPedido() {
  if (!slotSeleccionado.value || carritoStore.estaVacio) return;
  procesando.value = true;
  error.value      = '';

  try {
    const items = carritoStore.items.map(i => ({
      producto_id:     i.producto_id,
      cantidad:        i.cantidad,
      precio_unitario: i.precio_unitario
    }));

    const { data } = await tiendaApi.post('/tienda/pedidos', {
      slot_id: slotSeleccionado.value.id,
      items
    });

    // Recargar con datos del slot para mostrar en confirmación
    pedidoConfirmado.value = {
      ...data.pedido,
      slot: slotSeleccionado.value
    };
    carritoStore.vaciar();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al confirmar el pedido. Intentá de nuevo.';
  } finally {
    procesando.value = false;
  }
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatFecha(f) {
  if (!f) return '';
  const d = new Date(f + 'T00:00:00');
  return d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' });
}

onMounted(cargarSlots);
</script>
