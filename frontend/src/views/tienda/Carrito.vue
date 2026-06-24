<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Tu carrito</h1>

    <!-- Vacío -->
    <div v-if="carritoStore.estaVacio" class="text-center py-20 text-gray-400">
      <ShoppingCartIcon class="h-20 w-20 mx-auto mb-4 opacity-20" />
      <p class="text-lg">Tu carrito está vacío</p>
      <RouterLink to="/tienda" class="btn-primary mt-4 inline-block">Ver productos</RouterLink>
    </div>

    <!-- Con ítems -->
    <div v-else>
      <!-- Lista -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 mb-4">
        <div v-for="item in carritoStore.items" :key="item.producto_id" class="flex items-center gap-4 p-4">
          <!-- Imagen -->
          <div class="h-16 w-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
            <img v-if="item.imagen_url" :src="item.imagen_url" :alt="item.nombre" class="h-full w-full object-cover" />
            <div v-else class="h-full flex items-center justify-center">
              <CubeIcon class="h-8 w-8 text-gray-200" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 truncate">{{ item.nombre }}</p>
            <p class="text-sm text-gray-400">{{ formatGs(item.precio_unitario) }} c/u</p>
          </div>

          <!-- Cantidad -->
          <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            <button @click="carritoStore.actualizarCantidad(item.producto_id, item.cantidad - 1)"
              class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-base font-medium border-r border-gray-200">−</button>
            <span class="px-4 py-1.5 text-sm font-bold text-gray-800 min-w-10 text-center">{{ item.cantidad }}</span>
            <button @click="carritoStore.actualizarCantidad(item.producto_id, item.cantidad + 1)"
              class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-base font-medium border-l border-gray-200">+</button>
          </div>

          <!-- Subtotal -->
          <div class="text-right flex-shrink-0 w-28">
            <p class="font-bold text-gray-900">{{ formatGs(item.subtotal) }}</p>
          </div>

          <!-- Eliminar -->
          <button @click="carritoStore.quitar(item.producto_id)" class="text-gray-300 hover:text-red-400">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Resumen -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex justify-between text-sm text-gray-500 mb-1">
          <span>{{ carritoStore.cantidad }} producto{{ carritoStore.cantidad !== 1 ? 's' : '' }}</span>
          <span>{{ formatGs(carritoStore.total) }}</span>
        </div>
        <div class="flex justify-between font-bold text-gray-900 text-lg mt-2 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span class="text-primary-700">{{ formatGs(carritoStore.total) }}</span>
        </div>

        <p class="text-xs text-gray-400 mt-3 mb-4">
          El pago se realiza al momento del retiro en tienda.
          Seleccionarás el horario en el paso siguiente.
        </p>

        <RouterLink to="/tienda/checkout" class="btn-primary w-full block text-center py-3 text-base">
          Elegir horario de retiro
        </RouterLink>

        <button @click="carritoStore.vaciar()" class="text-xs text-gray-400 hover:text-red-400 mt-3 w-full text-center">
          Vaciar carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { ShoppingCartIcon, XMarkIcon, CubeIcon } from '@heroicons/vue/24/outline';
import { useCarritoStore } from '@/stores/carrito.store';

const carritoStore = useCarritoStore();

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}
</script>
