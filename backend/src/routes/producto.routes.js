const router = require('express').Router();
const ctrl   = require('../controllers/producto.controller');
const { requireRol } = require('../middlewares/auth.middleware');
const { upload }     = require('../middlewares/upload.middleware');

router.get('/',                                              ctrl.listar);
router.get('/barcode/:code', requireRol('admin', 'vendedor'), ctrl.buscarPorBarcode);
router.get('/:id',                                          ctrl.obtener);
router.post('/',             requireRol('admin'), upload.single('imagen'), ctrl.crear);
router.put('/:id',           requireRol('admin'), upload.single('imagen'), ctrl.actualizar);
router.delete('/:id',        requireRol('admin'), ctrl.archivar);
router.post('/import-csv',   requireRol('admin'), upload.single('csv'),    ctrl.importarCSV);

module.exports = router;
