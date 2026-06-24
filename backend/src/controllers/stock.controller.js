const { Op } = require('sequelize');
const { sequelize, Alerta, Producto, Lote, MovimientoStock, Categoria, Proveedor } = require('../models');
const stockService = require('../services/stock.service');

// ─── Alertas ─────────────────────────────────────────────────────────────────

async function obtenerAlertas(req, res) {
  try {
    const alertas = await Alerta.findAll({
      where:    { leida: false },
      include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre'], required: false }],
      order:    [['created_at', 'DESC']],
      limit:    100
    });
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function marcarLeida(req, res) {
  try {
    const [filas] = await Alerta.update({ leida: true }, { where: { id: req.params.id } });
    if (!filas) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ mensaje: 'Alerta marcada como leída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function marcarTodasLeidas(req, res) {
  try {
    await Alerta.update({ leida: true }, { where: { leida: false } });
    res.json({ mensaje: 'Todas las alertas marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Movimientos de stock ─────────────────────────────────────────────────────

async function obtenerMovimientos(req, res) {
  try {
    const { producto_id, tipo, desde, hasta, pagina = 1, limite = 30 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    const where  = {};

    if (producto_id)      where.producto_id = producto_id;
    if (tipo)             where.tipo        = tipo;
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at[Op.gte] = new Date(desde);
      if (hasta) where.created_at[Op.lte] = new Date(hasta);
    }

    const { count, rows } = await MovimientoStock.findAndCountAll({
      where,
      include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre'] }],
      order:   [['created_at', 'DESC']],
      limit:   parseInt(limite),
      offset
    });

    res.json({ total: count, movimientos: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Ajuste manual ────────────────────────────────────────────────────────────

async function ajusteManual(req, res) {
  const { producto_id, tipo, cantidad, motivo } = req.body;
  if (!producto_id || !tipo || !cantidad) {
    return res.status(400).json({ error: 'producto_id, tipo y cantidad son requeridos' });
  }

  const t = await sequelize.transaction();
  try {
    const resultado = await stockService.ajustarStock(
      producto_id, tipo, cantidad, motivo, t, req.usuario?.id
    );
    await t.commit();
    res.json({ mensaje: 'Ajuste registrado correctamente', ...resultado });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
}

// ─── Resumen de alertas de vencimiento y stock bajo ───────────────────────────

async function resumenStock(req, res) {
  try {
    const hoy  = new Date();
    const en7  = new Date(hoy); en7.setDate(en7.getDate() + 7);

    const [lotesPorVencer, productosStockBajo] = await Promise.all([
      Lote.findAll({
        where: {
          activo:          true,
          cantidad_actual: { [Op.gt]: 0 },
          fecha_vencimiento: { [Op.lte]: en7 }
        },
        include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre'] }],
        order:   [['fecha_vencimiento', 'ASC']]
      }),
      Producto.findAll({
        where: {
          activo: true,
          [Op.and]: [{ stock_actual: { [Op.lte]: sequelize.col('stock_minimo') } }]
        },
        include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }]
      })
    ]);

    res.json({ lotes_por_vencer: lotesPorVencer, productos_stock_bajo: productosStockBajo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Lotes de un producto ─────────────────────────────────────────────────────

async function lotesDeProducto(req, res) {
  try {
    const lotes = await Lote.findAll({
      where: { producto_id: req.params.productoId, activo: true },
      include: [{ model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] }],
      order:   [['fecha_vencimiento', 'ASC'], ['fecha_ingreso', 'ASC']]
    });
    res.json(lotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Inventario completo (para reportes) ──────────────────────────────────────

async function inventarioCompleto(req, res) {
  try {
    const productos = await Producto.findAll({
      where: { activo: true },
      include: [
        { model: Categoria, as: 'categoria', attributes: ['nombre'] },
        {
          model: Lote, as: 'lotes',
          where:    { activo: true, cantidad_actual: { [Op.gt]: 0 } },
          required: false,
          order:    [['fecha_vencimiento', 'ASC']]
        }
      ],
      order: [['nombre', 'ASC']]
    });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Ejecutar job de alertas manualmente (útil para pruebas) ─────────────────

async function ejecutarJobAlertas(req, res) {
  try {
    await stockService.generarAlertas();
    res.json({ mensaje: 'Job de alertas ejecutado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  obtenerAlertas, marcarLeida, marcarTodasLeidas,
  obtenerMovimientos, ajusteManual, resumenStock,
  lotesDeProducto, inventarioCompleto, ejecutarJobAlertas
};
