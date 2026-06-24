<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="text-lg font-semibold">Lotes — {{ producto.nombre }}</h2>
          <p class="text-xs text-gray-500 mt-0.5">Stock total: {{ producto.stock_actual }} {{ producto.unidad_medida }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="mostrarFormLote = !mostrarFormLote" class="btn-secondary text-sm py-1.5">
            + Agregar lote
          </button>
          <button @click="$emit('cerrar')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Formulario nuevo lote -->
      <Transition name="slide">
        <form v-if="mostrarFormLote" @submit.prevent="crearLote" class="px-6 pt-4 pb-2 bg-gray-50 border-b">
          <p class="text-sm font-medium text-gray-700 mb-3">Nuevo lote de entrada</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label class="label">Cantidad *</label>
              <input v-model="nuevoLote.cantidad" type="number" min="1" class="input" required />
            </div>
            <div>
              <label class="label">Fecha de vencimiento</label>
              <input v-model="nuevoLote.fecha_vencimiento" type="date" class="input" />
            </div>
            <div>
              <label class="label">N° de lote</label>
              <input v-model="nuevoLote.numero_lote" class="input" placeholder="Opcional" />
            </div>
            <div>
              <label class="label">Costo unitario (Gs.)</label>
              <input v-model="nuevoLote.costo_unitario" type="number" min="0" class="input" placeholder="0" />
            </div>
            <div>
              <label class="label">Proveedor</label>
              <select v-model="nuevoLote.proveedor_id" class="input">
                <option value="">Sin especificar</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre }}</option>
              </select>
            </div>
          </div>
          <div v-if="errorLote" class="mt-2 text-xs text-red-600">{{ errorLote }}</div>
          <div class="flex justify-end gap-2 mt-3">
            <button type="button" @click="mostrarFormLote = false" class="btn-secondary text-sm py-1.5">Cancelar</button>
            <button type="submit" class="btn-primary text-sm py-1.5" :disabled="guardandoLote">
              {{ guardandoLote ? 'Guardando...' : 'Registrar entrada' }}
            </button>
          </div>
        </form>
      </Transition>

      <!-- Lista de lotes -->
      <div class="p-6">
        <div v-if="cargando" class="text-center py-6 text-gray-400 text-sm">Cargando lotes...</div>
        <div v-else-if="lotes.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No hay lotes con stock disponible
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="lote in lotes"
            :key="lote.id"
            :class="['rounded-xl border p-4', claseVencimiento(lote).bg]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="['h-3 w-3 rounded-full flex-shrink-0', claseVencimiento(lote).punto]" />
                <div>
                  <p class="font-medium text-sm text-gray-900">
                    Lote {{ lote.numero_lote || `#${lote.id}` }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Ingreso: {{ formatFecha(lote.fecha_ingreso) }}
                    <span v-if="lote.proveedor">· {{ lote.proveedor.nombre }}</span>
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-900">{{ lote.cantidad_actual }} <span class="font-normal text-gray-500 text-xs">{{ producto.unidad_medida }}</span></p>
                <p v-if="lote.fecha_vencimiento" :class="['text-xs font-medium', claseVencimiento(lote).texto]">
                  {{ etiquetaVencimiento(lote) }}
                </p>
                <p v-else class="text-xs text-gray-400">Sin vencimiento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const props = defineProps({ producto: { type: Object, required: true } });
const emit  = defineEmits(['cerrar']);

const lotes           = ref([]);
const proveedores     = ref([]);
const cargando        = ref(false);
const mostrarFormLote = ref(false);
const guardandoLote   = ref(false);
const errorLote       = ref('');

const nuevoLote = ref({ cantidad: '', fecha_vencimiento: '', numero_lote: '', costo_unitario: '', proveedor_id: '' });

async function cargarLotes() {
  cargando.value = true;
  try {
    const { data } = await api.get(`/stock/lotes/${props.producto.id}`);
    lotes.value = data;
  } finally { cargando.value = false; }
}

async function cargarProveedores() {
  try {
    const { data } = await api.get('/proveedores');
    proveedores.value = data;
  } catch { /* opcional */ }
}

async function crearLote() {
  guardandoLote.value = true; errorLote.value = '';
  try {
    await api.post('/lotes', {
      producto_id:      props.producto.id,
      cantidad:         parseInt(nuevoLote.value.cantidad),
      fecha_vencimiento: nuevoLote.value.fecha_vencimiento || null,
      numero_lote:      nuevoLote.value.numero_lote || null,
      costo_unitario:   parseFloat(nuevoLote.value.costo_unitario) || null,
      proveedor_id:     nuevoLote.value.proveedor_id || null
    });
    nuevoLote.value = { cantidad: '', fecha_vencimiento: '', numero_lote: '', costo_unitario: '', proveedor_id: '' };
    mostrarFormLote.value = false;
    cargarLotes();
  } catch (err) {
    errorLote.value = err.response?.data?.error || 'Error al crear el lote';
  } finally {
    guardandoLote.value = false;
  }
}

function diasHastaVencimiento(lote) {
  if (!lote.fecha_vencimiento) return null;
  const diff = new Date(lote.fecha_vencimiento + 'T00:00:00') - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function claseVencimiento(lote) {
  const dias = diasHastaVencimiento(lote);
  if (dias === null) return { bg: 'bg-gray-50 border-gray-200', punto: 'bg-gray-300', texto: 'text-gray-400' };
  if (dias < 0)  return { bg: 'bg-red-50 border-red-200',      punto: 'bg-red-500',    texto: 'text-red-600' };
  if (dias <= 3) return { bg: 'bg-red-50 border-red-200',      punto: 'bg-red-500',    texto: 'text-red-600' };
  if (dias <= 7) return { bg: 'bg-orange-50 border-orange-200', punto: 'bg-orange-400', texto: 'text-orange-600' };
  return { bg: 'bg-green-50 border-green-200', punto: 'bg-green-500', texto: 'text-green-700' };
}

function etiquetaVencimiento(lote) {
  const dias = diasHastaVencimiento(lote);
  if (dias === null) return '';
  if (dias < 0)  return `Vencido hace ${Math.abs(dias)} día(s)`;
  if (dias === 0) return 'Vence hoy';
  if (dias <= 7)  return `Vence en ${dias} día(s)`;
  return `Vence: ${formatFecha(lote.fecha_vencimiento)}`;
}

function formatFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

onMounted(() => { cargarLotes(); cargarProveedores(); });
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
