<template>
  <div class="max-w-sm mx-auto pt-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div class="text-center mb-6">
        <div class="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
          <span class="text-white font-bold text-xl">M</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Crear cuenta</h1>
        <p class="text-sm text-gray-500 mt-1">Tienda Marisol</p>
      </div>

      <form @submit.prevent="registrar" class="space-y-4">
        <div>
          <label class="label">Nombre completo</label>
          <input v-model="form.nombre" type="text" class="input w-full" required />
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input w-full" required autocomplete="email" />
        </div>
        <div>
          <label class="label">Contraseña <span class="text-gray-400 font-normal">(mínimo 6 caracteres)</span></label>
          <input v-model="form.password" type="password" class="input w-full" required minlength="6" autocomplete="new-password" />
        </div>
        <div>
          <label class="label">Teléfono <span class="text-gray-400 font-normal">(opcional)</span></label>
          <input v-model="form.telefono" type="tel" class="input w-full" />
        </div>
        <div>
          <label class="label">RUC <span class="text-gray-400 font-normal">(opcional, para factura)</span></label>
          <input v-model="form.ruc" type="text" class="input w-full" placeholder="12345678-9" />
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-xl p-3">{{ error }}</div>

        <button type="submit" :disabled="cargando" class="btn-primary w-full py-3 font-semibold">
          <span v-if="cargando" class="flex items-center justify-center gap-2">
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creando cuenta...
          </span>
          <span v-else>Crear cuenta</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        ¿Ya tenés cuenta?
        <RouterLink to="/tienda/login" class="text-primary-600 font-medium hover:underline">Ingresar</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useClienteStore } from '@/stores/cliente.store';

const router       = useRouter();
const clienteStore = useClienteStore();

const form     = ref({ nombre: '', email: '', password: '', telefono: '', ruc: '' });
const cargando = ref(false);
const error    = ref('');

async function registrar() {
  cargando.value = true;
  error.value    = '';
  try {
    await clienteStore.registro(form.value);
    router.push('/tienda');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear la cuenta';
  } finally {
    cargando.value = false;
  }
}
</script>
