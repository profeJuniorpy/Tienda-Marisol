'use strict';

const { Op }              = require('sequelize');
const { Producto, Categoria } = require('../models');

// ─── Catálogo público ─────────────────────────────────────────────────────────

async function catalogo(req, res, next) {
  try {
    const { busqueda, categoria_id, page = 1, limit = 24, orden = 'nombre' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { activo: true, visible_online: true };

    if (busqueda) {
      where[Op.or] = [
        { nombre:        { [Op.like]: `%${busqueda}%` } },
        { codigo_barras: { [Op.like]: `%${busqueda}%` } }
      ];
    }
    if (categoria_id) where.categoria_id = parseInt(categoria_id);

    const ordenMap = {
      nombre:       [['nombre', 'ASC']],
      precio_asc:   [['precio_venta', 'ASC']],
      precio_desc:  [['precio_venta', 'DESC']],
      reciente:     [['created_at', 'DESC']]
    };

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      order:   ordenMap[orden] || ordenMap.nombre,
      limit:   parseInt(limit),
      offset,
      attributes: ['id', 'nombre', 'descripcion', 'precio_venta', 'stock_actual', 'imagen_url', 'unidad_medida', 'tasa_iva', 'codigo_barras', 'categoria_id']
    });

    res.json({
      productos: rows,
      total:     count,
      paginas:   Math.ceil(count / parseInt(limit)),
      pagina:    parseInt(page)
    });
  } catch (err) {
    next(err);
  }
}

// ─── Detalle de un producto ───────────────────────────────────────────────────

async function detalleProducto(req, res, next) {
  try {
    const producto = await Producto.findOne({
      where: { id: req.params.id, activo: true, visible_online: true },
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      attributes: ['id', 'nombre', 'descripcion', 'precio_venta', 'stock_actual', 'imagen_url', 'unidad_medida', 'tasa_iva', 'codigo_barras', 'es_perecedero', 'categoria_id']
    });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ producto });
  } catch (err) {
    next(err);
  }
}

// ─── Categorías activas con conteo ───────────────────────────────────────────

async function categorias(req, res, next) {
  try {
    const cats = await Categoria.findAll({
      where:   { activo: true },
      order:   [['nombre', 'ASC']],
      attributes: ['id', 'nombre', 'descripcion']
    });
    res.json({ categorias: cats });
  } catch (err) {
    next(err);
  }
}

module.exports = { catalogo, detalleProducto, categorias };
