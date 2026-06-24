<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Proveedores</h1>
        <p class="text-sm text-gray-500 mt-1">{{ proveedores.length }} proveedores registrados</p>
      </div>
      <button @click="abrirModal()" class="btn-primary">+ Nuevo proveedor</button>
    </div>

    <!-- Búsqueda -->
    <div class="mb-4">
      <div class="relative max-w-xs">
        <MagnifyingGlassIcon class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="busqueda" type="text" placeholder="Buscar por nombre o RUC..."
          class="input pl-9 text-sm w-full" />
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <div v-else-if="filtrados.length === 0" class="text-center py-12 text-gray-400">
        <TruckIcon class="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay proveedores{{ busqueda ? ' que coincidan con la búsqueda' : '' }}</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Proveedor</th>
            <th class="text-left px-4 py-3">RUC</th>
            <th class="text-left px-4 py-3">Teléfono</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-center px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in filtrados" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ p.nombre }}</p>
              <p v-if="p.direccion" class="text-xs text-gray-400 mt-0.5">{{ p.direccion }}</p>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ p.ruc || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.telefono || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.email || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="p.activo ? 'badge-verde' : 'badge-gris'">{{ p.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-3 justify-end">
                <button @click="abrirModal(p)" class="text-xs text-primary-600 hover:underline">Editar</button>
                <button @click="toggleActivo(p)"
                  :class="['text-xs hover:underline', p.activo ? 'text-red-500' : 'text-green-600']">
                  {{ p.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">{{ editando ? 'Editar proveedor' : 'Nuevo proveedor' }}</h3>
          <button @click="modalAbierto = false"><XMarkIcon class="h-5 w-5 text-gray-400" /></button>
        </div>
        <form @submit.prevent="guardar" class="p-5 space-y-4">
          <div>
            <label class="label">Nombre <span class="text-red-500">*</span></label>
            <input v-model="form.nombre" class="input" required placeholder="Distribuidora San Pedro" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">RUC</label>
              <input v-model="form.ruc" class="input" placeholder="80000000-1" />
            </div>
            <div>
              <label class="label">Teléfono</label>
              <input v-model="form.telefono" class="input" placeholder="0981 123 456" />
            </div>
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="proveedor@email.com" />
          </div>
          <div>
            <label class="label">Dirección</label>
            <textarea v-model="form.direccion" class="input" rows="2" placeholder="Ciudad, calle..." />
          </div>
          <p v-if="errorGuardar" class="text-sm text-red-600 bg-red-50 rounded-lg p-3">{{ errorGuardar }}</p>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="modalAbierto = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" :disabled="guardando" class="btn-primary flex-1">
              {{ guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear proveedor') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { MagnifyingGlassIcon, TruckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const proveedores  = ref([]);
const cargando     = ref(false);
const busqueda     = ref('');
const modalAbierto = ref(false);
const editando     = ref(null);
const guardando    = ref(false);
const errorGuardar = ref('');

const VACIO = { nombre: '', ruc: '', telefono: '', email: '', direccion: '' };
const form  = ref({ ...VACIO });

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return q
    ? proveedores.value.filter(p => p.nombre.toLowerCase().includes(q) || (p.ruc || '').toLowerCase().includes(q))
    : proveedores.value;
});

async function cargar() {
  cargando.value = true;
  try {
    const { data } = await api.get('/proveedores');
    proveedores.value = Array.isArray(data) ? data : (data.proveedores || []);
  } finally {
    cargando.value = false;
  }
}

function abrirModal(p = null) {
  editando.value = p;
  errorGuardar.value = '';
  form.value = p
    ? { nombre: p.nombre, ruc: p.ruc || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '' }
    : { ...VACIO };
  modalAbierto.value = true;
}

async function guardar() {
  guardando.value = true;
  errorGuardar.value = '';
  try {
    if (editando.value) {
      const { data } = await api.put(`/proveedores/${editando.value.id}`, form.value);
      const idx = proveedores.value.findIndex(p => p.id === editando.value.id);
      if (idx !== -1) proveedores.value[idx] = data;
    } else {
      const { data } = await api.post('/proveedores', form.value);
      proveedores.value.unshift(data);
    }
    modalAbierto.value = false;
  } catch (err) {
    errorGuardar.value = err.response?.data?.error || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}

async function toggleActivo(p) {
  if (!confirm(`¿${p.activo ? 'Desactivar' : 'Activar'} a ${p.nombre}?`)) return;
  try {
    const { data } = await api.put(`/proveedores/${p.id}`, { activo: !p.activo });
    const idx = proveedores.value.findIndex(x => x.id === p.id);
    if (idx !== -1) proveedores.value[idx] = data;
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar');
  }
}

onMounted(cargar);
</script>
