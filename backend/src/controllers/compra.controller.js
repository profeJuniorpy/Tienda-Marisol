const { sequelize } = require('../models');
const { Compra, DetalleCompra, Proveedor, Producto, Lote } = require('../models');
const { registrarEntrada } = require('../services/stock.service');
const { Op } = require('sequelize');

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 20, proveedor_id, desde, hasta } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    const where  = {};

    if (proveedor_id) where.proveedor_id = proveedor_id;
    if (desde || hasta) {
      where.fecha_compra = {};
      if (desde) where.fecha_compra[Op.gte] = desde;
      if (hasta) where.fecha_compra[Op.lte] = hasta;
    }

    const { count, rows } = await Compra.findAndCountAll({
      where,
      include: [{ model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] }],
      order:  [['fecha_compra', 'DESC']],
      limit:  parseInt(limite),
      offset
    });

    res.json({ total: count, compras: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const compra = await Compra.findByPk(req.params.id, {
      include: [
        { model: Proveedor, as: 'proveedor' },
        {
          model: DetalleCompra, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'unidad_medida'] }]
        }
      ]
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(compra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Registra una compra a proveedor y genera automáticamente un lote por cada ítem.
 * Todo en una única transacción ACID.
 */
async function crear(req, res) {
  const {
    proveedor_id, fecha_compra, numero_factura,
    observaciones, items
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La compra debe tener al menos un ítem' });
  }

  const t = await sequelize.transaction();
  try {
    let total = 0;

    const compra = await Compra.create({
      proveedor_id,
      usuario_id:     req.usuario.id,
      fecha_compra:   fecha_compra || new Date(),
      numero_factura: numero_factura || null,
      observaciones:  observaciones || null,
      total:          0,
      estado:         'recibida'
    }, { transaction: t });

    const detallesCreados = [];

    for (const item of items) {
      const { producto_id, cantidad, precio_unitario, fecha_vencimiento, numero_lote } = item;
      const subtotal = parseFloat(precio_unitario) * parseInt(cantidad);
      total += subtotal;

      // Crear lote usando StockService (actualiza stock_actual del producto)
      const lote = await registrarEntrada(
        producto_id,
        {
          cantidad:         parseInt(cantidad),
          fecha_vencimiento: fecha_vencimiento || null,
          numero_lote:      numero_lote || null,
          proveedor_id,
          costo_unitario:   parseFloat(precio_unitario),
          fecha_ingreso:    fecha_compra || new Date()
        },
        t,
        req.usuario.id
      );

      const detalle = await DetalleCompra.create({
        compra_id:       compra.id,
        producto_id,
        lote_id:         lote.id,
        cantidad:        parseInt(cantidad),
        precio_unitario: parseFloat(precio_unitario),
        subtotal
      }, { transaction: t });

      detallesCreados.push(detalle);
    }

    await compra.update({ total }, { transaction: t });
    await t.commit();

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [
        { model: Proveedor,    as: 'proveedor' },
        { model: DetalleCompra, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre'] }] }
      ]
    });

    res.status(201).json(compraCompleta);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
}

module.exports = { listar, obtener, crear };
