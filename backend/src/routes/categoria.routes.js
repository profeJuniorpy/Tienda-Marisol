const router = require('express').Router();
const { Categoria } = require('../models');
const { requireRol } = require('../middlewares/auth.middleware');

router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
    res.json(categorias);
  } catch { res.status(500).json({ error: 'Error al obtener categorías' }); }
});

router.post('/', requireRol('admin'), async (req, res) => {
  try {
    const cat = await Categoria.create(req.body);
    res.status(201).json(cat);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', requireRol('admin'), async (req, res) => {
  try {
    const cat = await Categoria.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
    await cat.update(req.body);
    res.json(cat);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
