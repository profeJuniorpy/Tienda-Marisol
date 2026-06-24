<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-gray-900 text-white transition-all duration-300 flex-shrink-0',
        sidebarAbierto ? 'w-64' : 'w-16'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-700">
        <span class="text-2xl">🛒</span>
        <span v-if="sidebarAbierto" class="ml-3 font-bold text-lg whitespace-nowrap">Tienda Marisol</span>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 overflow-y-auto py-4">
        <template v-for="item in navItems" :key="item.ruta">
          <RouterLink
            :to="item.ruta"
            :title="item.nombre"
            class="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-lg mx-2 mb-1"
            activeClass="bg-primary-700 text-white"
          >
            <component :is="item.icono" class="h-5 w-5 flex-shrink-0" />
            <span v-if="sidebarAbierto" class="ml-3 whitespace-nowrap">{{ item.nombre }}</span>
          </RouterLink>
        </template>
      </nav>

      <!-- Usuario y cerrar sesión -->
      <div class="border-t border-gray-700 p-4">
        <div v-if="sidebarAbierto" class="flex items-center mb-3">
          <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {{ inicialUsuario }}
          </div>
          <div class="ml-2 overflow-hidden">
            <p class="text-sm font-medium truncate">{{ authStore.usuario?.nombre }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ authStore.usuario?.rol }}</p>
          </div>
        </div>
        <button
          @click="cerrarSesion"
          class="flex items-center w-full text-gray-400 hover:text-white text-sm px-2 py-1 rounded"
          :title="sidebarAbierto ? '' : 'Cerrar sesión'"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5 flex-shrink-0" />
          <span v-if="sidebarAbierto" class="ml-2">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <button
          @click="sidebarAbierto = !sidebarAbierto"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>

        <div class="flex items-center gap-3">
          <!-- Campana de alertas -->
          <div class="relative">
            <button
              @click="mostrarAlertas = !mostrarAlertas"
              class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative"
            >
              <BellIcon class="h-5 w-5" />
              <span
                v-if="alertasStore.totalNoLeidas > 0"
                class="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >
                {{ alertasStore.totalNoLeidas > 9 ? '9+' : alertasStore.totalNoLeidas }}
              </span>
            </button>

            <!-- Panel de alertas -->
            <div
              v-if="mostrarAlertas"
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b">
                <h3 class="font-semibold text-sm">Alertas</h3>
                <button
                  v-if="alertasStore.totalNoLeidas > 0"
                  @click="alertasStore.marcarTodasLeidas()"
                  class="text-xs text-primary-600 hover:underline"
                >
                  Marcar todas como leídas
                </button>
              </div>
              <div class="max-h-72 overflow-y-auto">
                <div v-if="alertasStore.alertas.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
                  Sin alertas pendientes
                </div>
                <div
                  v-for="alerta in alertasStore.alertas.slice(0, 10)"
                  :key="alerta.id"
                  @click="alertasStore.marcarLeida(alerta.id)"
                  :class="['px-4 py-3 border-b cursor-pointer hover:bg-gray-50 text-sm', !alerta.leida ? 'bg-amber-50' : '']"
                >
                  <div class="flex items-start gap-2">
                    <span :class="['mt-0.5 h-2 w-2 rounded-full flex-shrink-0', alerta.tipo === 'vencimiento' ? 'bg-orange-400' : 'bg-red-400']" />
                    <p class="text-gray-700 text-xs leading-relaxed">{{ alerta.mensaje }}</p>
                  </div>
                </div>
              </div>
              <div class="px-4 py-2 border-t">
                <RouterLink to="/stock" class="text-xs text-primary-600 hover:underline" @click="mostrarAlertas = false">
                  Ver inventario
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Área de contenido -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAlertasStore } from '@/stores/alertas.store';

import {
  HomeIcon, CubeIcon, ChartBarIcon, ShoppingCartIcon,
  ClipboardDocumentListIcon, TruckIcon, DocumentChartBarIcon,
  ComputerDesktopIcon, Bars3Icon, BellIcon, ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon, ShoppingBagIcon, UsersIcon
} from '@heroicons/vue/24/outline';

const router        = useRouter();
const authStore     = useAuthStore();
const alertasStore  = useAlertasStore();

const sidebarAbierto = ref(true);
const mostrarAlertas = ref(false);

const inicialUsuario = computed(() =>
  authStore.usuario?.nombre?.charAt(0).toUpperCase() || 'U'
);

const navItems = computed(() => {
  const base = [
    { nombre: 'Dashboard',    ruta: '/dashboard',  icono: HomeIcon },
    { nombre: 'Productos',    ruta: '/productos',  icono: CubeIcon },
    { nombre: 'Stock',        ruta: '/stock',      icono: ChartBarIcon },
    { nombre: 'POS — Ventas', ruta: '/pos',        icono: ComputerDesktopIcon },
    { nombre: 'Ventas',       ruta: '/ventas',     icono: ShoppingCartIcon },
    { nombre: 'Pedidos',      ruta: '/pedidos',    icono: ClipboardDocumentListIcon },
    { nombre: 'Proveedores',  ruta: '/proveedores', icono: TruckIcon },
    { nombre: 'Compras',      ruta: '/compras',    icono: ShoppingBagIcon },
    { nombre: 'Alertas',      ruta: '/alertas',    icono: ExclamationTriangleIcon },
    { nombre: 'Reportes',     ruta: '/reportes',   icono: DocumentChartBarIcon },
    ...(authStore.usuario?.rol === 'admin'
      ? [{ nombre: 'Usuarios', ruta: '/usuarios', icono: UsersIcon }]
      : [])
  ];
  return base;
});

function cerrarSesion() {
  authStore.cerrarSesion();
  router.push('/login');
}

// Cargar alertas al montar y cada 5 minutos
let intervaloAlertas;
onMounted(() => {
  alertasStore.cargar();
  intervaloAlertas = setInterval(() => alertasStore.cargar(), 5 * 60 * 1000);

  document.addEventListener('click', cerrarPanelAlertas);
});
onBeforeUnmount(() => {
  clearInterval(intervaloAlertas);
  document.removeEventListener('click', cerrarPanelAlertas);
});

function cerrarPanelAlertas(e) {
  if (!e.target.closest('[data-alertas-panel]')) {
    mostrarAlertas.value = false;
  }
}
</script>
