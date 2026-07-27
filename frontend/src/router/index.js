import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ─── Auth ─────────────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/admin/Login.vue'),
      meta: { publica: true }
    },

    // ─── Panel Admin / Vendedor ───────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiereAuth: true },
      children: [
        { path: '',           redirect: '/dashboard' },
        { path: 'dashboard',  name: 'Dashboard',   component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'productos',  name: 'Productos',   component: () => import('@/views/admin/Productos.vue') },
        { path: 'stock',      name: 'Stock',       component: () => import('@/views/admin/Stock.vue') },
        { path: 'ventas',     name: 'Ventas',      component: () => import('@/views/admin/Ventas.vue') },
        { path: 'facturas',   name: 'Facturas',    component: () => import('@/views/admin/Facturas.vue') },
        { path: 'pedidos',    name: 'Pedidos',     component: () => import('@/views/admin/Pedidos.vue') },
        { path: 'proveedores', name: 'Proveedores', component: () => import('@/views/admin/Proveedores.vue') },
        { path: 'compras',    name: 'Compras',     component: () => import('@/views/admin/Compras.vue') },
        { path: 'usuarios',   name: 'Usuarios',    component: () => import('@/views/admin/Usuarios.vue') },
        { path: 'alertas',    name: 'Alertas',     component: () => import('@/views/admin/Alertas.vue') },
        { path: 'reportes',   name: 'Reportes',    component: () => import('@/views/admin/Reportes.vue') },
        { path: 'pos',        name: 'POS',         component: () => import('@/views/vendedor/POS.vue') },
        { path: 'pickups',    name: 'Pickups',     component: () => import('@/views/vendedor/Pickups.vue') }
      ]
    },

    // ─── Tienda pública ───────────────────────────────────────────────────────
    {
      path: '/tienda',
      component: () => import('@/layouts/TiendaLayout.vue'),
      meta: { publica: true },
      children: [
        { path: '',          name: 'Catalogo',    component: () => import('@/views/tienda/Catalogo.vue') },
        { path: ':id',       name: 'Producto',    component: () => import('@/views/tienda/Producto.vue') },
        { path: 'carrito',   name: 'Carrito',     component: () => import('@/views/tienda/Carrito.vue') },
        { path: 'checkout',  name: 'Checkout',    component: () => import('@/views/tienda/Checkout.vue') },
        { path: 'mis-pedidos', name: 'MisPedidos', component: () => import('@/views/tienda/MisPedidos.vue') },
        { path: 'contacto',  name: 'Contacto',    component: () => import('@/views/tienda/Contacto.vue') },
        { path: 'login',     name: 'LoginCliente', component: () => import('@/views/tienda/Login.vue') },
        { path: 'registro',  name: 'Registro',    component: () => import('@/views/tienda/Registro.vue') }
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  const token   = localStorage.getItem('access_token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (to.meta.requiereAuth && (!token || !usuario)) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.name === 'Login' && token && usuario) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
