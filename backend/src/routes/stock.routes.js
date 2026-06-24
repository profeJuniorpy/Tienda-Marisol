const router = require('express').Router();
const ctrl   = require('../controllers/stock.controller');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/alertas',               requireRol('admin', 'vendedor'), ctrl.obtenerAlertas);
router.put('/alertas/leer-todas',    requireRol('admin', 'vendedor'), ctrl.marcarTodasLeidas);
router.put('/alertas/:id/leer',      requireRol('admin', 'vendedor'), ctrl.marcarLeida);
router.get('/movimientos',           requireRol('admin'),             ctrl.obtenerMovimientos);
router.post('/ajuste',               requireRol('admin'),             ctrl.ajusteManual);
router.get('/resumen',               requireRol('admin', 'vendedor'), ctrl.resumenStock);
router.get('/inventario',            requireRol('admin'),             ctrl.inventarioCompleto);
router.get('/lotes/:productoId',     requireRol('admin', 'vendedor'), ctrl.lotesDeProducto);
router.post('/generar-alertas',      requireRol('admin'),             ctrl.ejecutarJobAlertas);

module.exports = router;
