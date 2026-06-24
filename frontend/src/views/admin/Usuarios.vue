<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Usuarios del sistema</h1>
        <p class="text-sm text-gray-500 mt-1">Control de acceso y permisos</p>
      </div>
      <button @click="abrirModal()" class="btn-primary">+ Nuevo usuario</button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="cargando" class="text-center py-12">
        <div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Usuario</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-center px-4 py-3">Rol</th>
            <th class="text-center px-4 py-3">Estado</th>
            <th class="text-left px-4 py-3">Creado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="usuarios.length === 0">
            <td colspan="6" class="text-center py-10 text-gray-400">No hay usuarios</td>
          </tr>
          <tr v-for="u in usuarios" :key="u.id" class="hover:bg-gray-50"
            :class="u.id === miId ? 'bg-primary-50/40' : ''">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {{ u.nombre.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ u.nombre }}</p>
                  <p v-if="u.id === miId" class="text-xs text-primary-600">(mi cuenta)</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="u.rol === 'admin' ? 'badge-azul' : 'badge-gris'">
                {{ u.rol === 'admin' ? 'Administrador' : 'Vendedor' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="u.activo ? 'badge-verde' : 'badge-rojo'">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ formatFecha(u.created_at) }}</td>
            <td class="px-4 py-3">
              <div v-if="u.id !== miId" class="flex gap-3 justify-end">
                <button @click="abrirModal(u)" class="text-xs text-primary-600 hover:underline">Editar</button>
                <button @click="abrirCambioPassword(u)" class="text-xs text-gray-500 hover:underline">Contraseña</button>
                <button @click="toggleActivo(u)"
                  :class="['text-xs hover:underline', u.activo ? 'text-red-500' : 'text-green-600']">
                  {{ u.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Nota informativa sobre roles -->
    <div class="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
      <p class="font-semibold mb-1">Roles disponibles:</p>
      <ul class="space-y-1 text-xs">
        <li><strong>Administrador</strong> — Acceso completo: productos, stock, ventas, compras, reportes, usuarios y configuración.</li>
        <li><strong>Vendedor</strong> — Acceso al POS, consulta de stock, gestión de pedidos pickup. No accede a reportes financieros ni gestión de usuarios.</li>
      </ul>
    </div>

    <!-- Modal crear/editar -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
          <button @click="modalAbierto = false"><XMarkIcon class="h-5 w-5 text-gray-400" /></button>
        </div>
        <form @submit.prevent="guardar" class="p-5 space-y-4">
          <div>
            <label class="label">Nombre completo <span class="text-red-500">*</span></label>
            <input v-model="form.nombre" class="input" required placeholder="Juan Pérez" />
          </div>
          <div>
            <label class="label">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" class="input" required placeholder="usuario@tienda.com" />
          </div>
          <div v-if="!editando">
            <label class="label">Contraseña <span class="text-red-500">*</span></label>
            <input v-model="form.password" type="password" class="input" required
              placeholder="Mínimo 6 caracteres" minlength="6" />
          </div>
          <div>
            <label class="label">Rol <span class="text-red-500">*</span></label>
            <select v-model="form.rol" class="input" required>
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">
              {{ form.rol === 'admin' ? 'Acceso total al sistema.' : 'Solo POS, stock y pedidos pickup.' }}
            </p>
          </div>
          <p v-if="errorGuardar" class="text-sm text-red-600 bg-red-50 rounded-lg p-3">{{ errorGuardar }}</p>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="modalAbierto = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" :disabled="guardando" class="btn-primary flex-1">
              {{ guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal cambiar contraseña -->
    <div v-if="modalPassword" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="font-bold text-gray-900">Cambiar contraseña</h3>
          <button @click="modalPassword = false"><XMarkIcon class="h-5 w-5 text-gray-400" /></button>
        </div>
        <form @submit.prevent="guardarPassword" class="p-5 space-y-4">
          <p class="text-sm text-gray-600">
            Cambiando contraseña de <strong>{{ usuarioPassword?.nombre }}</strong>
          </p>
          <div>
            <label class="label">Nueva contraseña <span class="text-red-500">*</span></label>
            <input v-model="nuevaPass" type="password" class="input" required
              placeholder="Mínimo 6 caracteres" minlength="6" />
          </div>
          <div>
            <label class="label">Confirmar contraseña <span class="text-red-500">*</span></label>
            <input v-model="confirmarPass" type="password" class="input" required placeholder="Repetir contraseña" />
          </div>
          <p v-if="errorPassword" class="text-sm text-red-600 bg-red-50 rounded-lg p-3">{{ errorPassword }}</p>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="modalPassword = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" :disabled="guardandoPass" class="btn-primary flex-1">
              {{ guardandoPass ? 'Guardando...' : 'Actualizar contraseña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const miId      = computed(() => authStore.usuario?.id);

const usuarios     = ref([]);
const cargando     = ref(false);
const modalAbierto = ref(false);
const editando     = ref(null);
const guardando    = ref(false);
const errorGuardar = ref('');

const VACIO = { nombre: '', email: '', password: '', rol: 'vendedor' };
const form  = ref({ ...VACIO });

// Cambio de contraseña
const modalPassword   = ref(false);
const usuarioPassword = ref(null);
const nuevaPass       = ref('');
const confirmarPass   = ref('');
const guardandoPass   = ref(false);
const errorPassword   = ref('');

async function cargar() {
  cargando.value = true;
  try {
    const { data } = await api.get('/usuarios');
    usuarios.value = data.usuarios || [];
  } finally {
    cargando.value = false;
  }
}

function abrirModal(u = null) {
  editando.value    = u;
  errorGuardar.value = '';
  form.value = u
    ? { nombre: u.nombre, email: u.email, password: '', rol: u.rol }
    : { ...VACIO };
  modalAbierto.value = true;
}

async function guardar() {
  guardando.value    = true;
  errorGuardar.value = '';
  try {
    if (editando.value) {
      const payload = { nombre: form.value.nombre, email: form.value.email, rol: form.value.rol };
      const { data } = await api.put(`/usuarios/${editando.value.id}`, payload);
      const idx = usuarios.value.findIndex(u => u.id === editando.value.id);
      if (idx !== -1) usuarios.value[idx] = data.usuario;
    } else {
      const { data } = await api.post('/usuarios', form.value);
      usuarios.value.unshift(data.usuario);
    }
    modalAbierto.value = false;
  } catch (err) {
    errorGuardar.value = err.response?.data?.error || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}

function abrirCambioPassword(u) {
  usuarioPassword.value = u;
  nuevaPass.value       = '';
  confirmarPass.value   = '';
  errorPassword.value   = '';
  modalPassword.value   = true;
}

async function guardarPassword() {
  if (nuevaPass.value !== confirmarPass.value) {
    errorPassword.value = 'Las contraseñas no coinciden';
    return;
  }
  guardandoPass.value = true;
  errorPassword.value = '';
  try {
    await api.patch(`/usuarios/${usuarioPassword.value.id}/password`, { nueva_password: nuevaPass.value });
    modalPassword.value = false;
  } catch (err) {
    errorPassword.value = err.response?.data?.error || 'Error al cambiar contraseña';
  } finally {
    guardandoPass.value = false;
  }
}

async function toggleActivo(u) {
  const accion = u.activo ? 'desactivar' : 'activar';
  if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${u.nombre}?`)) return;
  try {
    const { data } = await api.patch(`/usuarios/${u.id}/toggle-activo`);
    const idx = usuarios.value.findIndex(x => x.id === u.id);
    if (idx !== -1) usuarios.value[idx] = data.usuario;
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar');
  }
}

function formatFecha(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(cargar);
</script>
