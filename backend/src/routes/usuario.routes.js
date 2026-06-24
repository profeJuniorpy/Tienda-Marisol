const router = require('express').Router();
const ctrl   = require('../controllers/usuario.controller');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/',                    requireRol('admin'), ctrl.listar);
router.post('/',                   requireRol('admin'), ctrl.crear);
router.put('/:id',                 requireRol('admin'), ctrl.actualizar);
router.patch('/:id/password',      requireRol('admin'), ctrl.cambiarPassword);
router.patch('/:id/toggle-activo', requireRol('admin'), ctrl.toggleActivo);

module.exports = router;
