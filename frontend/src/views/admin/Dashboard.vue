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
            <p class="text-2xl font-bold text-gray-900 mt-1">
              <span v-if="cargando" class="text-gray-300">—</span>
              <span v-else>{{ card.valor }}</span>
            </p>
            <p v-if="card.sub" class="text-xs text-gray-400 mt-0.5">{{ card.sub }}</p>
          </div>
          <div :class="['p-3 rounded-xl', card.bg]">
            <component :is="card.icono" :class="['h-6 w-6', card.color]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Ventas de la semana + Alertas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Ventas del período</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Hoy</span>
            <div class="text-right">
              <span class="font-semibold text-gray-900">{{ formatGs(resumen.hoy?.monto || 0) }}</span>
              <span class="text-xs text-gray-400 ml-2">({{ resumen.hoy?.cantidad || 0 }} ventas)</span>
            </div>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Esta semana</span>
            <div class="text-right">
              <span class="font-semibold text-gray-900">{{ formatGs(resumen.semana?.monto || 0) }}</span>
              <span class="text-xs text-gray-400 ml-2">({{ resumen.semana?.cantidad || 0 }} ventas)</span>
            </div>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">Este mes</span>
            <div class="text-right">
              <span class="font-semibold text-primary-600">{{ formatGs(resumen.mes?.monto || 0) }}</span>
              <span class="text-xs text-gray-400 ml-2">({{ resumen.mes?.cantidad || 0 }} ventas)</span>
            </div>
          </div>
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

    <!-- Accesos rápidos -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">Accesos rápidos</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  CubeIcon, ShoppingCartIcon, ExclamationTriangleIcon,
  ComputerDesktopIcon, ClipboardDocumentListIcon, TruckIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth.store';
import { useAlertasStore } from '@/stores/alertas.store';
import api from '@/services/api';

const authStore    = useAuthStore();
const alertasStore = useAlertasStore();

const cargando = ref(true);
const resumen  = ref({ hoy: null, semana: null, mes: null, productos: null, pedidos: null });

const formatGs = (n) => 'Gs. ' + Number(n).toLocaleString('es-PY');

const tarjetas = computed(() => [
  {
    titulo: 'Ventas hoy',
    valor:  resumen.value.hoy ? formatGs(resumen.value.hoy.monto) : '—',
    sub:    resumen.value.hoy ? `${resumen.value.hoy.cantidad} transacciones` : null,
    icono:  ShoppingCartIcon,
    bg: 'bg-green-50', color: 'text-green-500'
  },
  {
    titulo: 'Pedidos activos',
    valor:  resumen.value.pedidos != null ? resumen.value.pedidos.activos : '—',
    sub:    'Pendientes / listos',
    icono:  ClipboardDocumentListIcon,
    bg: 'bg-purple-50', color: 'text-purple-500'
  },
  {
    titulo: 'Productos',
    valor:  resumen.value.productos != null ? resumen.value.productos.total : '—',
    sub:    resumen.value.productos ? `${resumen.value.productos.stock_bajo} con stock bajo` : null,
    icono:  CubeIcon,
    bg: 'bg-blue-50', color: 'text-blue-500'
  },
  {
    titulo: 'Alertas sin leer',
    valor:  alertasStore.totalNoLeidas,
    icono:  ExclamationTriangleIcon,
    bg: 'bg-red-50', color: 'text-red-500'
  },
]);

const accesosRapidos = [
  { nombre: 'POS — Caja',    ruta: '/pos',          icono: ComputerDesktopIcon },
  { nombre: 'Inventario',    ruta: '/stock',         icono: CubeIcon },
  { nombre: 'Pedidos',       ruta: '/pedidos',       icono: ClipboardDocumentListIcon },
  { nombre: 'Proveedores',   ruta: '/proveedores',   icono: TruckIcon },
];

onMounted(async () => {
  await Promise.all([
    alertasStore.cargar(),
    api.get('/reportes/dashboard').then(r => { resumen.value = r.data; }).catch(() => {})
  ]);
  cargando.value = false;
});
</script>
