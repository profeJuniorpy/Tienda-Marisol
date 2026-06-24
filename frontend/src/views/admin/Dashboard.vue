<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-sm text-gray-500 mt-1">Bienvenido, {{ authStore.usuario?.nombre }}</p>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div v-for="card in tarjetas" :key="card.titulo" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ card.titulo }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ card.valor }}</p>
          </div>
          <div :class="['p-3 rounded-xl', card.bg]">
            <component :is="card.icono" :class="['h-6 w-6', card.color]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Accesos rápidos</h2>
        <div class="grid grid-cols-2 gap-3">
          <RouterLink
            v-for="acc in accesosRapidos"
            :key="acc.ruta"
            :to="acc.ruta"
            class="flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors text-center"
          >
            <component :is="acc.icono" class="h-8 w-8 text-primary-600 mb-2" />
            <span class="text-sm font-medium text-gray-700">{{ acc.nombre }}</span>
          </RouterLink>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Alertas recientes</h2>
          <span class="badge-rojo" v-if="alertasStore.totalNoLeidas > 0">
            {{ alertasStore.totalNoLeidas }} sin leer
          </span>
        </div>
        <div v-if="alertasStore.alertas.length === 0" class="text-sm text-gray-400 py-4 text-center">
          No hay alertas pendientes
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="alerta in alertasStore.alertas.slice(0, 5)"
            :key="alerta.id"
            :class="['text-xs p-3 rounded-lg', alerta.leida ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-800']"
          >
            {{ alerta.mensaje }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import {
  CubeIcon, ShoppingCartIcon, ExclamationTriangleIcon,
  ComputerDesktopIcon, ClipboardDocumentListIcon, TruckIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth.store';
import { useAlertasStore } from '@/stores/alertas.store';

const authStore    = useAuthStore();
const alertasStore = useAlertasStore();

onMounted(() => alertasStore.cargar());

const tarjetas = computed(() => [
  { titulo: 'Total alertas',   valor: alertasStore.totalNoLeidas, icono: ExclamationTriangleIcon, bg: 'bg-red-50',    color: 'text-red-500' },
  { titulo: 'Productos',       valor: '—',                         icono: CubeIcon,               bg: 'bg-blue-50',   color: 'text-blue-500' },
  { titulo: 'Ventas hoy',      valor: '—',                         icono: ShoppingCartIcon,       bg: 'bg-green-50',  color: 'text-green-500' },
  { titulo: 'Pedidos activos', valor: '—',                         icono: ClipboardDocumentListIcon, bg: 'bg-purple-50', color: 'text-purple-500' }
]);

const accesosRapidos = [
  { nombre: 'POS — Caja',    ruta: '/pos',       icono: ComputerDesktopIcon },
  { nombre: 'Inventario',    ruta: '/stock',     icono: CubeIcon },
  { nombre: 'Pedidos',       ruta: '/pedidos',   icono: ClipboardDocumentListIcon },
  { nombre: 'Proveedores',   ruta: '/proveedores', icono: TruckIcon }
];
</script>
