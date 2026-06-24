<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🛒</div>
        <h1 class="text-2xl font-bold text-gray-900">Tienda Marisol</h1>
        <p class="text-sm text-gray-500 mt-1">Panel de Gestión</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="admin@marisol.com"
            required
            autocomplete="email"
          />
        </div>

        <div>
          <label class="label">Contraseña</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="mostrarPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="mostrarPassword = !mostrarPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!mostrarPassword" class="h-4 w-4" />
              <EyeSlashIcon v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          class="btn-primary w-full py-3 text-base"
          :disabled="authStore.cargando"
        >
          <span v-if="authStore.cargando">Ingresando...</span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <p class="text-center text-xs text-gray-400 mt-6">
        ¿Eres cliente?
        <RouterLink to="/tienda" class="text-primary-600 hover:underline">Ir a la tienda online</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth.store';

const router        = useRouter();
const route         = useRoute();
const authStore     = useAuthStore();
const mostrarPassword = ref(false);

const form = ref({ email: '', password: '' });

async function handleLogin() {
  const ok = await authStore.login(form.value.email, form.value.password);
  if (ok) {
    const redirigir = route.query.redirect || '/dashboard';
    router.push(redirigir);
  }
}
</script>
