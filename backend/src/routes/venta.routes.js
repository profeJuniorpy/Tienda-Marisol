'use strict';

const router = require('express').Router();
const { requireAuth, requireRol } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/venta.controller');

router.use(requireAuth);

router.post('/',          requireRol('admin', 'vendedor'), ctrl.crear);
router.get('/',           requireRol('admin', 'vendedor'), ctrl.listar);
router.get('/:id',        requireRol('admin', 'vendedor'), ctrl.obtener);
router.patch('/:id/anular', requireRol('admin'),           ctrl.anular);

module.exports = router;
