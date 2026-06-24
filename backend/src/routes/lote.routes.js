const router = require('express').Router();
const { Lote, Proveedor } = require('../models');
const { Op } = require('sequelize');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/:productoId', requireRol('admin', 'vendedor'), async (req, res) => {
  try {
    const lotes = await Lote.findAll({
      where: { producto_id: req.params.productoId, activo: true, cantidad_actual: { [Op.gt]: 0 } },
      include: [{ model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] }],
      order: [['fecha_vencimiento', 'ASC'], ['fecha_ingreso', 'ASC']]
    });
    res.json(lotes);
  } catch { res.status(500).json({ error: 'Error al obtener lotes' }); }
});

router.post('/', requireRol('admin'), async (req, res) => {
  try {
    const lote = await Lote.create(req.body);
    res.status(201).json(lote);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
