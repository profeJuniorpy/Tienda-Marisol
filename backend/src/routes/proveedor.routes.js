const router = require('express').Router();
const { Proveedor } = require('../models');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/', requireRol('admin'), async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
    res.json(proveedores);
  } catch { res.status(500).json({ error: 'Error al obtener proveedores' }); }
});

router.post('/', requireRol('admin'), async (req, res) => {
  try {
    const prov = await Proveedor.create(req.body);
    res.status(201).json(prov);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', requireRol('admin'), async (req, res) => {
  try {
    const prov = await Proveedor.findByPk(req.params.id);
    if (!prov) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await prov.update(req.body);
    res.json(prov);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
