<template>
  <div>
    <div v-if="cargando" class="flex justify-center py-20">
      <div class="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="!producto" class="text-center py-20 text-gray-400">
      <p>Producto no encontrado</p>
      <RouterLink to="/tienda" class="btn-primary mt-4 inline-block">Volver al catálogo</RouterLink>
    </div>

    <div v-else class="max-w-3xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <RouterLink to="/tienda" class="hover:text-primary-600">Catálogo</RouterLink>
        <span>/</span>
        <span class="text-gray-600">{{ producto.nombre }}</span>
      </div>

      <div class="grid sm:grid-cols-2 gap-8">
        <!-- Imagen -->
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <img v-if="producto.imagen_url" :src="producto.imagen_url" :alt="producto.nombre"
            class="h-full w-full object-cover" />
          <div v-else class="h-full flex items-center justify-center">
            <CubeIcon class="h-20 w-20 text-gray-200" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <p class="text-sm text-primary-600 font-medium mb-1">{{ producto.categoria?.nombre }}</p>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ producto.nombre }}</h1>

          <!-- Precio -->
          <div class="mb-4">
            <p class="text-3xl font-bold text-primary-700">{{ formatGs(producto.precio_venta) }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Precio por {{ producto.unidad_medida }} · {{ producto.tasa_iva?.replace('_', ' ') }}</p>
          </div>

          <!-- Stock -->
          <div :class="['inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg w-fit mb-4', producto.stock_actual > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600']">
            <div :class="['h-2 w-2 rounded-full', producto.stock_actual > 0 ? 'bg-green-500' : 'bg-red-500']" />
            {{ producto.stock_actual > 0 ? `${producto.stock_actual} ${producto.unidad_medida}s disponibles` : 'Sin stock' }}
          </div>

          <!-- Descripción -->
          <p v-if="producto.descripcion" class="text-gray-600 text-sm mb-6 leading-relaxed">
            {{ producto.descripcion }}
          </p>

          <!-- Cantidad + botón -->
          <div v-if="producto.stock_actual > 0" class="flex items-center gap-3 mt-auto">
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button @click="cantidad > 1 ? cantidad-- : null"
                class="px-4 py-2.5 text-gray-600 hover:bg-gray-100 text-lg font-medium border-r border-gray-200">−</button>
              <span class="px-5 py-2.5 font-bold text-gray-800 min-w-12 text-center">{{ cantidad }}</span>
              <button @click="cantidad < producto.stock_actual ? cantidad++ : null"
                class="px-4 py-2.5 text-gray-600 hover:bg-gray-100 text-lg font-medium border-l border-gray-200">+</button>
            </div>
            <button @click="agregar" class="btn-primary flex-1 py-2.5">
              Agregar al carrito
            </button>
          </div>

          <div v-else class="mt-auto">
            <p class="text-sm text-red-500 bg-red-50 rounded-xl p-4">
              Este producto no tiene stock disponible en este momento.
            </p>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div
        v-if="mostrarToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
      >
        <CheckCircleIcon class="h-5 w-5 text-green-400" />
        Producto agregado al carrito
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { CubeIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';
import { useCarritoStore } from '@/stores/carrito.store';

const route        = useRoute();
const carritoStore = useCarritoStore();
const producto     = ref(null);
const cargando     = ref(true);
const cantidad     = ref(1);
const mostrarToast = ref(false);

async function cargar() {
  try {
    const { data } = await api.get(`/tienda/productos/${route.params.id}`);
    producto.value = data.producto;
  } finally {
    cargando.value = false;
  }
}

function agregar() {
  carritoStore.agregar(producto.value, cantidad.value);
  mostrarToast.value = true;
  setTimeout(() => { mostrarToast.value = false; }, 2500);
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

onMounted(cargar);
</script>
