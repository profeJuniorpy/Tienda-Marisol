<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Contacto y ubicación</h1>
      <p class="text-gray-500 mt-2">Encontranos en el Mercado Nro. 1 de Coronel Oviedo</p>
    </div>

    <div class="grid sm:grid-cols-2 gap-6 mb-6">
      <!-- Datos de contacto -->
      <div class="card space-y-5">
        <h2 class="font-bold text-gray-900 text-lg border-b pb-3">Información de la tienda</h2>

        <div class="flex gap-4 items-start">
          <div class="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <MapPinIcon class="h-5 w-5 text-primary-700" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Dirección</p>
            <p class="text-gray-600 text-sm mt-0.5">Mercado Nro. 1, Local 15</p>
            <p class="text-gray-600 text-sm">Coronel Oviedo, Caaguazú</p>
            <p class="text-gray-600 text-sm">Paraguay</p>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <div class="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <ClockIcon class="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Horario de atención</p>
            <div class="mt-1 space-y-0.5 text-sm text-gray-600">
              <div class="flex justify-between gap-8">
                <span>Lunes a Viernes</span>
                <span class="font-medium">07:00 – 18:00</span>
              </div>
              <div class="flex justify-between gap-8">
                <span>Sábado</span>
                <span class="font-medium">07:00 – 14:00</span>
              </div>
              <div class="flex justify-between gap-8 text-red-500">
                <span>Domingo</span>
                <span class="font-medium">Cerrado</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <div class="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <PhoneIcon class="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Teléfono / WhatsApp</p>
            <a href="tel:+595981000000" class="text-primary-700 hover:underline text-sm mt-0.5 block font-medium">
              +595 981 000 000
            </a>
            <a href="https://wa.me/595981000000?text=Hola,%20quiero%20consultar%20sobre%20un%20pedido"
              target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 text-green-700 hover:underline text-xs mt-1">
              Escribir por WhatsApp →
            </a>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <div class="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBagIcon class="h-5 w-5 text-orange-700" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Sistema pickup</p>
            <p class="text-gray-600 text-sm mt-0.5">
              Realizá tu pedido en línea y retiralo en tienda en el horario que elijas.
              Recibirás un <strong>código de retiro</strong> por email.
            </p>
          </div>
        </div>
      </div>

      <!-- Productos -->
      <div class="card">
        <h2 class="font-bold text-gray-900 text-lg border-b pb-3 mb-4">Qué vendemos</h2>
        <div class="space-y-3">
          <div v-for="cat in categorias" :key="cat.id"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="h-7 w-7 rounded-lg bg-primary-100 flex items-center justify-center text-sm">🛒</div>
            <RouterLink :to="`/tienda?cat=${cat.id}`" class="text-sm font-medium text-gray-700 hover:text-primary-700">
              {{ cat.nombre }}
            </RouterLink>
          </div>
        </div>
        <RouterLink to="/tienda" class="btn-primary mt-5 text-sm text-center block">
          Ver catálogo completo
        </RouterLink>
      </div>
    </div>

    <!-- Mapa -->
    <div class="card p-0 overflow-hidden">
      <div class="p-4 border-b">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <MapPinIcon class="h-5 w-5 text-primary-600" />
          Cómo llegar — Mercado Nro. 1, Coronel Oviedo
        </h2>
      </div>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-56.4499%2C-25.4544%2C-56.4299%2C-25.4344&layer=mapnik&marker=-25.4444%2C-56.4399"
        width="100%"
        height="320"
        style="border:0;"
        allowfullscreen
        loading="lazy"
        title="Ubicación Tienda Marisol - Mercado Nro 1, Coronel Oviedo"
      />
      <div class="p-4 bg-gray-50 text-xs text-gray-500 text-center">
        Mercado Nro. 1 · Coronel Oviedo, Caaguazú, Paraguay ·
        <a href="https://www.openstreetmap.org/?mlat=-25.4444&mlon=-56.4399#map=16/-25.4444/-56.4399"
          target="_blank" rel="noopener" class="text-primary-600 hover:underline">
          Ver mapa más grande
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { MapPinIcon, ClockIcon, PhoneIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const categorias = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/tienda/categorias');
    categorias.value = data.categorias || [];
  } catch { /* no critico */ }
});
</script>
