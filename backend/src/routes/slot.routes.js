'use strict';

const router = require('express').Router();
const { requireAuth, requireRol } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/slot.controller');

router.use(requireAuth);
router.use(requireRol('admin'));

router.get('/',                  ctrl.listar);
router.post('/',                 ctrl.crear);
router.post('/generar-semana',   ctrl.generarSemana);
router.patch('/:id/toggle',      ctrl.toggleActivo);

module.exports = router;
