'use strict';

const { Factura, Venta, DetalleVenta, Producto } = require('../models');
const { emitirFactura } = require('../services/sifen.service');

// ─── Obtener factura por ID ───────────────────────────────────────────────────

async function obtener(req, res, next) {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [{
        model: Venta, as: 'venta',
        include: [{
          model: DetalleVenta, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'unidad_medida'] }]
        }]
      }]
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json({ factura });
  } catch (err) {
    next(err);
  }
}

// ─── Obtener factura de una venta ─────────────────────────────────────────────

async function obtenerPorVenta(req, res, next) {
  try {
    const factura = await Factura.findOne({
      where: { venta_id: req.params.ventaId },
      include: [{
        model: Venta, as: 'venta',
        include: [{
          model: DetalleVenta, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'unidad_medida', 'codigo_barras'] }]
        }]
      }]
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json({ factura });
  } catch (err) {
    next(err);
  }
}

// ─── Reenviar factura a SIFEN ─────────────────────────────────────────────────

async function reenviar(req, res, next) {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [{
        model: Venta, as: 'venta',
        include: [{ model: DetalleVenta, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'tasa_iva'] }]
        }]
      }]
    });

    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    if (factura.estado_sifen === 'aprobado') {
      return res.status(409).json({ error: 'La factura ya fue aprobada por SIFEN' });
    }

    const detalles = factura.venta?.detalles?.map(d => ({
      nombre:          d.producto?.nombre || 'Producto',
      cantidad:        d.cantidad,
      precio_unitario: d.precio_unitario,
      tasa_iva:        d.tasa_iva
    })) || [];

    const result = await emitirFactura(
      factura.venta,
      detalles,
      factura,
      { ruc_cliente: factura.ruc_cliente, nombre_cliente: factura.nombre_cliente }
    );

    await factura.update({
      estado_sifen:      result.estado_sifen,
      cdc:               result.cdc || null,
      xml_de:            result.xml_de || null,
      numero_comprobante: result.numero_comprobante
    });

    res.json({ factura, resultado_sifen: result.estado_sifen });
  } catch (err) {
    next(err);
  }
}

module.exports = { obtener, obtenerPorVenta, reenviar };
