'use strict';

const router = require('express').Router();
const { requireAuth, requireRol } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/reporte.controller');

router.use(requireAuth);
router.use(requireRol('admin', 'vendedor'));

router.get('/dashboard', ctrl.resumenDashboard);
router.get('/ventas-dia',    ctrl.ventasDia);
router.get('/ventas-semana', ctrl.ventasSemana);
router.get('/ventas-mes',    ctrl.ventasMes);

module.exports = router;
