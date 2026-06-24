import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCarritoStore = defineStore('carrito', () => {
  const CLAVE_LOCAL = 'marisol_carrito';

  const items = ref(JSON.parse(localStorage.getItem(CLAVE_LOCAL) || '[]'));

  const total      = computed(() => items.value.reduce((s, i) => s + i.subtotal, 0));
  const cantidad   = computed(() => items.value.reduce((s, i) => s + i.cantidad, 0));
  const estaVacio  = computed(() => items.value.length === 0);

  function persistir() {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(items.value));
  }

  function agregar(producto, cant = 1) {
    const existente = items.value.find(i => i.producto_id === producto.id);
    if (existente) {
      existente.cantidad += cant;
      existente.subtotal  = existente.cantidad * existente.precio_unitario;
    } else {
      items.value.push({
        producto_id:     producto.id,
        nombre:          producto.nombre,
        precio_unitario: parseFloat(producto.precio_venta),
        cantidad:        cant,
        subtotal:        parseFloat(producto.precio_venta) * cant,
        imagen_url:      producto.imagen_url
      });
    }
    persistir();
  }

  function quitar(productoId) {
    items.value = items.value.filter(i => i.producto_id !== productoId);
    persistir();
  }

  function actualizarCantidad(productoId, cant) {
    const item = items.value.find(i => i.producto_id === productoId);
    if (!item) return;
    if (cant <= 0) return quitar(productoId);
    item.cantidad = cant;
    item.subtotal = cant * item.precio_unitario;
    persistir();
  }

  function vaciar() {
    items.value = [];
    localStorage.removeItem(CLAVE_LOCAL);
  }

  return { items, total, cantidad, estaVacio, agregar, quitar, actualizarCantidad, vaciar };
}, { persist: false });
