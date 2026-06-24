<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-sm text-gray-500 mt-1">Análisis de ventas e IVA</p>
      </div>
      <!-- Selector de mes/año -->
      <div class="flex gap-2 items-center">
        <select v-model="anio" class="input text-sm">
          <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
        </select>
        <select v-model="mes" class="input text-sm">
          <option v-for="(m, i) in meses" :key="i" :value="i + 1">{{ m }}</option>
        </select>
        <button @click="cargarMes" class="btn-primary text-sm">Ver</button>
      </div>
    </div>

    <!-- Tarjetas resumen del mes -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Transacciones</p>
        <p class="text-3xl font-bold text-gray-900">{{ datosMes.totales?.transacciones || 0 }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Monto total</p>
        <p class="text-2xl font-bold text-primary-700">{{ formatGs(datosMes.totales?.monto) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">IVA 10%</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatGs(datosMes.totales?.iva10) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">IVA 5%</p>
        <p class="text-2xl font-bold text-indigo-600">{{ formatGs(datosMes.totales?.iva5) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Gráfico de ventas por día -->
      <div class="card lg:col-span-2">
        <h2 class="font-semibold text-gray-800 mb-4">Ventas diarias — {{ nombreMes }}</h2>
        <div v-if="cargando" class="flex justify-center py-10">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div v-else class="relative h-56">
          <canvas ref="canvasBarras" />
        </div>
      </div>

      <!-- Top 5 productos -->
      <div class="card">
        <h2 class="font-semibold text-gray-800 mb-4">Productos más vendidos</h2>
        <div v-if="datosMes.productosTop?.length === 0" class="text-center text-gray-400 py-6 text-sm">
          Sin datos en este período
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(p, i) in datosMes.productosTop"
            :key="p.producto_id"
            class="flex items-center gap-3"
          >
            <span class="h-6 w-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ p.producto?.nombre }}</p>
              <p class="text-xs text-gray-400">{{ p.totalUnidades }} unidades</p>
            </div>
            <p class="text-sm font-semibold text-gray-700">{{ formatGs(p.totalMonto) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla desglose IVA por día -->
    <div class="card mt-6">
      <h2 class="font-semibold text-gray-800 mb-4">Desglose de IVA por día</h2>
      <div v-if="datosMes.ventasPorDia?.length === 0" class="text-center text-gray-400 py-4 text-sm">
        Sin ventas en este período
      </div>
      <table v-else class="w-full text-sm">
        <thead class="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-right px-4 py-2">Transacciones</th>
            <th class="text-right px-4 py-2">IVA 10%</th>
            <th class="text-right px-4 py-2">IVA 5%</th>
            <th class="text-right px-4 py-2">Total Gs.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="d in datosMes.ventasPorDia" :key="d.fecha" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-gray-700">{{ formatFecha(d.fecha) }}</td>
            <td class="px-4 py-2 text-right text-gray-600">{{ d.cantidad }}</td>
            <td class="px-4 py-2 text-right text-blue-600">{{ formatGs(d.iva10) }}</td>
            <td class="px-4 py-2 text-right text-indigo-600">{{ formatGs(d.iva5) }}</td>
            <td class="px-4 py-2 text-right font-semibold text-gray-900">{{ formatGs(d.monto) }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-semibold text-gray-800">
          <tr>
            <td class="px-4 py-2">TOTAL</td>
            <td class="px-4 py-2 text-right">{{ datosMes.totales?.transacciones }}</td>
            <td class="px-4 py-2 text-right text-blue-700">{{ formatGs(datosMes.totales?.iva10) }}</td>
            <td class="px-4 py-2 text-right text-indigo-700">{{ formatGs(datosMes.totales?.iva5) }}</td>
            <td class="px-4 py-2 text-right text-primary-700">{{ formatGs(datosMes.totales?.monto) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '@/services/api';

Chart.register(...registerables);

const ahora = new Date();
const anio  = ref(ahora.getFullYear());
const mes   = ref(ahora.getMonth() + 1);
const cargando = ref(false);

const datosMes = ref({
  totales:      { transacciones: 0, monto: 0, iva10: 0, iva5: 0 },
  ventasPorDia: [],
  productosTop: []
});

const meses  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const anios  = Array.from({ length: 5 }, (_, i) => ahora.getFullYear() - i);

const nombreMes = computed(() => `${meses[mes.value - 1]} ${anio.value}`);

const canvasBarras = ref(null);
let chartBarras    = null;

async function cargarMes() {
  cargando.value = true;
  try {
    const { data } = await api.get('/reportes/ventas-mes', { params: { anio: anio.value, mes: mes.value } });
    datosMes.value = data;
    await nextTick();
    renderGrafico();
  } finally {
    cargando.value = false;
  }
}

function renderGrafico() {
  if (!canvasBarras.value) return;
  if (chartBarras) { chartBarras.destroy(); chartBarras = null; }

  const datos  = datosMes.value.ventasPorDia || [];
  const labels = datos.map(d => d.fecha?.slice(8, 10)); // día del mes
  const montos = datos.map(d => parseFloat(d.monto) || 0);

  chartBarras = new Chart(canvasBarras.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Ventas (Gs.)',
        data:            montos,
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderColor:     'rgba(22,163,74,1)',
        borderWidth:     1,
        borderRadius:    4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (v) => v === 0 ? '0' : (v / 1_000_000).toFixed(1) + 'M',
            font: { size: 10 }
          },
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function formatGs(n) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n || 0);
}

function formatFecha(f) {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

onMounted(() => cargarMes());
</script>
