'use strict';

const router = require('express').Router();
const { requireAuth, requireRol } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/pedido.controller');

router.use(requireAuth);

router.get('/',                          requireRol('admin', 'vendedor'), ctrl.listar);
router.get('/codigo/:codigo',            requireRol('admin', 'vendedor'), ctrl.porCodigoRetiro);
router.get('/:id',                       requireRol('admin', 'vendedor'), ctrl.obtener);
router.patch('/:id/estado',              requireRol('admin', 'vendedor'), ctrl.cambiarEstado);

module.exports = router;
