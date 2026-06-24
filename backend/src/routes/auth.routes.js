const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');

router.post('/login-admin',       ctrl.loginAdmin);
router.post('/login-cliente',     ctrl.loginCliente);
router.post('/register-cliente',  ctrl.registroCliente);
router.post('/registro-cliente',  ctrl.registroCliente);
router.post('/refresh-token',     ctrl.refreshToken);

module.exports = router;
