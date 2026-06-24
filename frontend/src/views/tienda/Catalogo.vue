<template>
  <div>
    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <!-- Búsqueda -->
      <div class="relative flex-1 min-w-48">
        <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="busqueda" @input="buscarDebounce" type="text"
          placeholder="Buscar producto..." class="input pl-10 w-full" />
      </div>

      <!-- Categorías (chips) -->
      <div class="flex flex-wrap gap-1.5">
        <button
          @click="categoriaActiva = null; cargar()"
          :class="['px-3 py-1.5 rounded-full text-sm font-medium border transition-colors', !categoriaActiva ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
        >Todo</button>
        <button
          v-for="c in categorias" :key="c.id"
          @click="categoriaActiva = c.id; cargar()"
          :class="['px-3 py-1.5 rounded-full text-sm border transition-colors', categoriaActiva === c.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
        >{{ c.nombre }}</button>
      </div>

      <!-- Orden -->
      <select v-model="orden" @change="cargar()" class="input text-sm w-auto">
        <option value="nombre">A–Z</option>
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
        <option value="reciente">Más recientes</option>
      </select>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="flex justify-center py-20">
      <div class="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Sin resultados -->
    <div v-else-if="productos.length === 0" class="text-center py-20 text-gray-400">
      <CubeIcon class="h-16 w-16 mx-auto mb-3 opacity-20" />
      <p>No se encontraron productos</p>
    </div>

    <!-- Grid de productos -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <RouterLink
        v-for="p in productos"
        :key="p.id"
        :to="`/tienda/${p.id}`"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden"
      >
        <!-- Imagen -->
        <div class="aspect-square bg-gray-50 overflow-hidden">
          <img v-if="p.imagen_url" :src="p.imagen_url" :alt="p.nombre"
            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div v-else class="h-full flex items-center justify-center">
            <CubeIcon class="h-12 w-12 text-gray-200" />
          </div>
        </div>

        <!-- Info -->
        <div class="p-3">
          <p class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{{ p.nombre }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ p.categoria?.nombre }}</p>
          <div class="flex items-center justify-between mt-2">
            <p class="text-base font-bold text-primary-700">{{ formatGs(p.precio_venta) }}</p>
            <span
              :class="['text-xs px-2 py-0.5 rounded-full', p.stock_actual > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']"
            >{{ p.stock_actual > 0 ? 'Disponible' : 'Sin stock' }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Paginación -->
    <div v-if="totalPaginas > 1" class="flex justify-center gap-2 mt-8">
      <button
        v-for="p in totalPaginas" :key="p"
        @click="irPagina(p)"
        :class="['w-9 h-9 rounded-lg text-sm font-medium border', p === paginaActual ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300']"
      >{{ p }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const route = useRoute();

const productos       = ref([]);
const categorias      = ref([]);
const busqueda        = ref('');
const categoriaActiva = ref(null);
const orden           = ref('nombre');
const paginaActual    = ref(1);
const totalPaginas    = ref(1);
const cargando        = ref(false);
let   debounceTimer   = null;

async function cargarCategorias() {
  const { data } = await api.get('/tienda/categorias');
  categorias.value = data.categorias || [];
}

async function cargar(pagina = 1) {
  cargando.value = true;
  paginaActual.value = pagina;
  try {
    const params = { page: pagina, limit: 24, orden: orden.value };
    if (busqueda.value)        params.busqueda    = busqueda.value;
    if (categoriaActiva.value) params.categoria_id = categoriaActiva.value;
    const { data } = await api.get('/tienda/productos', { params });
    productos.value    = data.productos || [];
    totalPaginas.value = data.paginas   || 1;
  } finally {
    cargando.value = false;
  }
}

function buscarDebounce() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => cargar(1), 350);
}

function irPagina(p) { cargar(p); }

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

// Leer categoría de la URL ?cat=X
watch(() => route.query.cat, (cat) => {
  categoriaActiva.value = cat ? parseInt(cat) : null;
  cargar();
}, { immediate: false });

onMounted(async () => {
  if (route.query.cat) categoriaActiva.value = parseInt(route.query.cat);
  await Promise.all([cargarCategorias(), cargar()]);
});
</script>
