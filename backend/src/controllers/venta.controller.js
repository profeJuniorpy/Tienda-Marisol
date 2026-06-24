'use strict';

const Joi = require('joi');
const { sequelize, Venta, DetalleVenta, Factura, Producto, Cliente } = require('../models');
const { descontarFEFO } = require('../services/stock.service');
const { emitirFactura }  = require('../services/sifen.service');
const { calcularMontos } = require('../utils/iva');
const { Op }             = require('sequelize');

// ─── Esquema de validación ────────────────────────────────────────────────────

const schemaCrear = Joi.object({
  items: Joi.array().min(1).items(
    Joi.object({
      producto_id:     Joi.number().integer().positive().required(),
      cantidad:        Joi.number().positive().required(),
      precio_unitario: Joi.number().positive().required(),
      tasa_iva:        Joi.string().valid('IVA_10', 'IVA_5', 'EXENTO').default('IVA_10'),
      nombre:          Joi.string().optional()
    })
  ).required(),
  metodo_pago:    Joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'qr').default('efectivo'),
  descuento:      Joi.number().min(0).default(0),
  cliente_id:     Joi.number().integer().allow(null).default(null),
  datos_factura:  Joi.object({
    ruc_cliente:    Joi.string().allow('', null).optional(),
    nombre_cliente: Joi.string().allow('', null).optional()
  }).default({})
});

// ─── Crear venta (ACID: stock FEFO + factura en una transacción) ──────────────

async function crear(req, res, next) {
  const { error, value } = schemaCrear.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { items, metodo_pago, descuento, cliente_id, datos_factura } = value;
  const usuarioId = req.usuario.id;

  // Calcular totales
  const totales = calcularMontos(items);
  const totalFinal = Math.max(0, totales.total - descuento);

  let ventaCreada, facturaCreada;

  try {
    // ── Transacción ACID ──────────────────────────────────────────────────────
    await sequelize.transaction(async (t) => {
      // 1. Crear cabecera de venta
      ventaCreada = await Venta.create({
        usuario_id:  usuarioId,
        cliente_id,
        subtotal:    totales.subtotal,
        iva_10:      totales.iva10,
        iva_5:       totales.iva5,
        descuento,
        total:       totalFinal,
        metodo_pago,
        estado:      'completada'
      }, { transaction: t });

      // 2. Por cada ítem: crear detalle + descontar stock FEFO
      for (const item of items) {
        const lotesConsumidos = await descontarFEFO(
          item.producto_id, item.cantidad, t, usuarioId
        );

        await DetalleVenta.create({
          venta_id:        ventaCreada.id,
          producto_id:     item.producto_id,
          cantidad:        item.cantidad,
          precio_unitario: item.precio_unitario,
          tasa_iva:        item.tasa_iva,
          subtotal:        Math.round(item.precio_unitario * item.cantidad),
          lotes_consumidos: JSON.stringify(lotesConsumidos)
        }, { transaction: t });
      }

      // 3. Crear registro de factura (pendiente → se actualiza después de SIFEN)
      facturaCreada = await Factura.create({
        venta_id:            ventaCreada.id,
        tipo:                'contado',
        numero_comprobante:  null,
        estado_sifen:        'pendiente',
        ruc_cliente:         datos_factura.ruc_cliente  || null,
        nombre_cliente:      datos_factura.nombre_cliente || 'Sin nombre',
        subtotal:            totales.subtotal,
        iva_10:              totales.iva10,
        iva_5:               totales.iva5,
        descuento,
        total:               totalFinal
      }, { transaction: t });
    });

    // ── Emisión SIFEN (fuera de la transacción) ───────────────────────────────
    const resultSifen = await emitirFactura(
      ventaCreada,
      items,
      facturaCreada,
      datos_factura
    );

    await facturaCreada.update({
      numero_comprobante: resultSifen.numero_comprobante,
      estado_sifen:       resultSifen.estado_sifen,
      cdc:                resultSifen.cdc || null,
      xml_de:             resultSifen.xml_de || null
    });

    return res.status(201).json({
      venta: {
        id:          ventaCreada.id,
        total:       totalFinal,
        subtotal:    totales.subtotal,
        iva_10:      totales.iva10,
        iva_5:       totales.iva5,
        descuento,
        metodo_pago,
        estado:      'completada',
        created_at:  ventaCreada.created_at
      },
      factura: {
        id:                  facturaCreada.id,
        numero_comprobante:  resultSifen.numero_comprobante,
        estado_sifen:        resultSifen.estado_sifen,
        ruc_cliente:         datos_factura.ruc_cliente  || null,
        nombre_cliente:      datos_factura.nombre_cliente || 'Sin nombre',
        subtotal:            totales.subtotal,
        iva_10:              totales.iva10,
        iva_5:               totales.iva5,
        total:               totalFinal,
        emisor: {
          nombre:    process.env.SIFEN_NOMBRE    || 'TIENDA MARISOL',
          ruc:       process.env.SIFEN_RUC       || '80123456-1',
          direccion: process.env.SIFEN_DIRECCION || 'Coronel Oviedo, Paraguay'
        }
      },
      items
    });
  } catch (err) {
    next(err);
  }
}

// ─── Listar ventas ────────────────────────────────────────────────────────────

async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, desde, hasta, metodo_pago } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at[Op.gte] = new Date(desde + 'T00:00:00');
      if (hasta) where.created_at[Op.lte] = new Date(hasta + 'T23:59:59');
    }
    if (metodo_pago) where.metodo_pago = metodo_pago;

    const { count, rows } = await Venta.findAndCountAll({
      where,
      include: [
        { model: Factura,     as: 'factura',     attributes: ['numero_comprobante', 'estado_sifen', 'nombre_cliente'] },
        { model: Cliente,     as: 'cliente',     attributes: ['nombre'], required: false }
      ],
      order:  [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      ventas: rows,
      total:  count,
      paginas: Math.ceil(count / parseInt(limit)),
      pagina:  parseInt(page)
    });
  } catch (err) {
    next(err);
  }
}

// ─── Detalle de venta ─────────────────────────────────────────────────────────

async function obtener(req, res, next) {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [
        {
          model: DetalleVenta, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo_barras', 'unidad_medida'] }]
        },
        { model: Factura, as: 'factura' },
        { model: Cliente, as: 'cliente', attributes: ['nombre', 'email'], required: false }
      ]
    });

    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ venta });
  } catch (err) {
    next(err);
  }
}

// ─── Anular venta (nota de crédito) ──────────────────────────────────────────

async function anular(req, res, next) {
  const { motivo } = req.body;
  if (!motivo) return res.status(400).json({ error: 'Se requiere motivo de anulación' });

  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta)               return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado === 'anulada') return res.status(409).json({ error: 'La venta ya está anulada' });

    await venta.update({ estado: 'anulada', motivo_anulacion: motivo });

    // No revertimos stock automáticamente (se registra como ajuste manual si es necesario)
    res.json({ mensaje: 'Venta anulada correctamente', venta });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, obtener, anular };
