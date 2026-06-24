<template>
  <div class="max-w-sm mx-auto pt-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <!-- Logo -->
      <div class="text-center mb-6">
        <div class="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
          <span class="text-white font-bold text-xl">M</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Ingresar</h1>
        <p class="text-sm text-gray-500 mt-1">Tienda Marisol</p>
      </div>

      <form @submit.prevent="ingresar" class="space-y-4">
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input w-full" required autocomplete="email" />
        </div>
        <div>
          <label class="label">Contraseña</label>
          <input v-model="form.password" type="password" class="input w-full" required autocomplete="current-password" />
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-xl p-3">{{ error }}</div>

        <button type="submit" :disabled="cargando" class="btn-primary w-full py-3 font-semibold">
          <span v-if="cargando" class="flex items-center justify-center gap-2">
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Ingresando...
          </span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        ¿No tenés cuenta?
        <RouterLink to="/tienda/registro" class="text-primary-600 font-medium hover:underline">Registrarse</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useClienteStore } from '@/stores/cliente.store';

const router       = useRouter();
const route        = useRoute();
const clienteStore = useClienteStore();

const form    = ref({ email: '', password: '' });
const cargando = ref(false);
const error    = ref('');

async function ingresar() {
  cargando.value = true;
  error.value    = '';
  try {
    await clienteStore.login(form.value.email, form.value.password);
    const redirect = route.query.redirect || '/tienda';
    router.push(redirect);
  } catch (err) {
    error.value = err.response?.data?.error || 'Email o contraseña incorrectos';
  } finally {
    cargando.value = false;
  }
}
</script>
