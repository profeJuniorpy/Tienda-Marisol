const router = require('express').Router();

router.use('/auth',       require('./auth.routes'));
router.use('/usuarios',   require('./usuario.routes'));
router.use('/productos',  require('./producto.routes'));
router.use('/stock',      require('./stock.routes'));
router.use('/ventas',     require('./venta.routes'));
router.use('/pedidos',    require('./pedido.routes'));
router.use('/tienda',     require('./tienda.routes'));
router.use('/reportes',   require('./reporte.routes'));
router.use('/proveedores', require('./proveedor.routes'));
router.use('/compras',    require('./compra.routes'));
router.use('/lotes',      require('./lote.routes'));
router.use('/categorias', require('./categoria.routes'));
router.use('/facturas',   require('./factura.routes'));
router.use('/slots',      require('./slot.routes'));

module.exports = router;
