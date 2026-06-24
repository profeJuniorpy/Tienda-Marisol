'use strict';

const router = require('express').Router();
const { requireCliente } = require('../middlewares/auth.middleware');
const tienda  = require('../controllers/tienda.controller');
const pedidos = require('../controllers/pedido.controller');

// ─── Catálogo público (sin auth) ─────────────────────────────────────────────
router.get('/productos',         tienda.catalogo);
router.get('/productos/:id',     tienda.detalleProducto);
router.get('/categorias',        tienda.categorias);
router.get('/slots',             require('../controllers/slot.controller').slotsDisponibles);

// ─── Pedidos (requiere auth de cliente) ──────────────────────────────────────
router.post('/pedidos',          requireCliente, pedidos.crear);
router.get('/pedidos/mis',       requireCliente, pedidos.misPedidos);

module.exports = router;
