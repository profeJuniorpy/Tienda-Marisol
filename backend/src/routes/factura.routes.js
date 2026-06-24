'use strict';

const router = require('express').Router();
const { requireAuth, requireRol } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/factura.controller');

router.use(requireAuth);

router.get('/:id',                        requireRol('admin', 'vendedor'), ctrl.obtener);
router.get('/venta/:ventaId',             requireRol('admin', 'vendedor'), ctrl.obtenerPorVenta);
router.post('/:id/reenviar-sifen',        requireRol('admin'),             ctrl.reenviar);

module.exports = router;
