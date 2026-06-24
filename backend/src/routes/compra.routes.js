const router = require('express').Router();
const ctrl   = require('../controllers/compra.controller');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/',     requireRol('admin'), ctrl.listar);
router.get('/:id',  requireRol('admin'), ctrl.obtener);
router.post('/',    requireRol('admin'), ctrl.crear);

module.exports = router;
