<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <RouterLink to="/tienda" class="flex items-center gap-2 flex-shrink-0">
            <div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span class="text-white text-sm font-bold">M</span>
            </div>
            <span class="font-bold text-gray-900 text-lg hidden sm:block">Tienda Marisol</span>
          </RouterLink>

          <!-- Categorías (desktop) -->
          <nav class="hidden md:flex items-center gap-1 text-sm overflow-x-auto">
            <RouterLink
              to="/tienda"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap font-medium"
              :class="{ 'text-primary-700 bg-primary-50': $route.path === '/tienda' }"
            >
              Todo
            </RouterLink>
            <RouterLink
              v-for="cat in categorias"
              :key="cat.id"
              :to="`/tienda?cat=${cat.id}`"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap"
            >
              {{ cat.nombre }}
            </RouterLink>
            <RouterLink
              to="/tienda/contacto"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap font-medium"
              :class="{ 'text-primary-700 bg-primary-50': $route.path === '/tienda/contacto' }"
            >
              Contacto
            </RouterLink>
          </nav>

          <!-- Acciones: carrito + cliente -->
          <div class="flex items-center gap-2">
            <!-- Carrito -->
            <RouterLink to="/tienda/carrito" class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600">
              <ShoppingCartIcon class="h-6 w-6" />
              <span
                v-if="carritoStore.cantidad > 0"
                class="absolute -top-0.5 -right-0.5 h-5 w-5 bg-primary-600 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >{{ carritoStore.cantidad }}</span>
            </RouterLink>

            <!-- Cliente logueado -->
            <div v-if="clienteStore.estaAutenticado" class="relative">
              <button
                @click="menuClienteAbierto = !menuClienteAbierto"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-300 text-sm"
              >
                <div class="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {{ clienteStore.cliente?.nombre?.charAt(0).toUpperCase() }}
                </div>
                <span class="hidden sm:block font-medium text-gray-700 max-w-24 truncate">
                  {{ clienteStore.cliente?.nombre }}
                </span>
                <ChevronDownIcon class="h-4 w-4 text-gray-400" />
              </button>

              <div
                v-if="menuClienteAbierto"
                class="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
              >
                <RouterLink to="/tienda/mis-pedidos" @click="menuClienteAbierto = false"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ClipboardDocumentListIcon class="h-4 w-4" /> Mis pedidos
                </RouterLink>
                <button @click="cerrarSesion"
                  class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                  <ArrowRightOnRectangleIcon class="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </div>

            <!-- No logueado -->
            <div v-else class="flex items-center gap-1.5">
              <RouterLink to="/tienda/login"    class="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-700 font-medium">
                Ingresar
              </RouterLink>
              <RouterLink to="/tienda/registro" class="text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium">
                Registrarse
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-400 text-sm py-8 mt-8">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <p class="font-semibold text-gray-200 text-base mb-1">Tienda Marisol</p>
        <p>Mercado Nro. 1, Local 15 — Coronel Oviedo, Caaguazú, Paraguay</p>
        <p class="mt-1 text-xs">Solo retiro en tienda · Lunes a Sábado 07:00–18:00</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingCartIcon, ChevronDownIcon, ClipboardDocumentListIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { useCarritoStore }  from '@/stores/carrito.store';
import { useClienteStore }  from '@/stores/cliente.store';
import api from '@/services/api';

const router             = useRouter();
const carritoStore       = useCarritoStore();
const clienteStore       = useClienteStore();
const menuClienteAbierto = ref(false);
const categorias         = ref([]);

async function cargarCategorias() {
  try {
    const { data } = await api.get('/tienda/categorias');
    categorias.value = data.categorias || [];
  } catch {}
}

function cerrarSesion() {
  clienteStore.cerrarSesion();
  menuClienteAbierto.value = false;
  router.push('/tienda');
}

function cerrarMenuEnClick(e) {
  if (!e.target.closest('[data-menu-cliente]')) menuClienteAbierto.value = false;
}

onMounted(() => {
  cargarCategorias();
  document.addEventListener('click', cerrarMenuEnClick);
});
onBeforeUnmount(() => document.removeEventListener('click', cerrarMenuEnClick));
</script>
