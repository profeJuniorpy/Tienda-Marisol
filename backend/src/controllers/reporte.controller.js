'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { Venta, DetalleVenta, Producto, Categoria, Factura } = require('../models');

// ─── Rango de fechas ──────────────────────────────────────────────────────────

function rangoHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(hoy);
  fin.setHours(23, 59, 59, 999);
  return { inicio: hoy, fin };
}

function rangoSemana() {
  const hoy    = new Date();
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - 6);
  inicio.setHours(0, 0, 0, 0);
  hoy.setHours(23, 59, 59, 999);
  return { inicio, fin: hoy };
}

function rangoMes(anio, mes) {
  const inicio = new Date(anio, mes - 1, 1);
  const fin    = new Date(anio, mes, 0, 23, 59, 59, 999);
  return { inicio, fin };
}

// ─── Ventas del día ───────────────────────────────────────────────────────────

async function ventasDia(req, res, next) {
  try {
    const { inicio, fin } = rangoHoy();

    const ventas = await Venta.findAll({
      where: { estado: 'completada', created_at: { [Op.between]: [inicio, fin] } },
      include: [{ model: Factura, as: 'factura', attributes: ['numero_comprobante', 'nombre_cliente', 'estado_sifen'] }],
      order: [['created_at', 'DESC']]
    });

    const totalVentas   = ventas.length;
    const totalMonto    = ventas.reduce((s, v) => s + parseFloat(v.total), 0);
    const totalIva10    = ventas.reduce((s, v) => s + parseFloat(v.iva_10 || 0), 0);
    const totalIva5     = ventas.reduce((s, v) => s + parseFloat(v.iva_5  || 0), 0);

    const porMetodo = ventas.reduce((acc, v) => {
      acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + parseFloat(v.total);
      return acc;
    }, {});

    res.json({ fecha: inicio.toISOString().split('T')[0], totalVentas, totalMonto, totalIva10, totalIva5, porMetodo, ventas });
  } catch (err) {
    next(err);
  }
}

// ─── Ventas por día (semana o rango personalizado) ────────────────────────────

async function ventasSemana(req, res, next) {
  try {
    const { inicio, fin } = rangoSemana();

    const ventas = await Venta.findAll({
      where: { estado: 'completada', created_at: { [Op.between]: [inicio, fin] } },
      attributes: [
        [fn('DATE', col('created_at')), 'fecha'],
        [fn('COUNT', col('id')),        'cantidad'],
        [fn('SUM',   col('total')),     'monto']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    // Rellenar días sin ventas
    const dias = [];
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const fecha = d.toISOString().split('T')[0];
      const found = ventas.find(v => v.fecha === fecha);
      dias.push({ fecha, cantidad: found ? parseInt(found.cantidad) : 0, monto: found ? parseFloat(found.monto) : 0 });
    }

    res.json({ dias });
  } catch (err) {
    next(err);
  }
}

// ─── Ventas del mes (detalle por día + totales IVA) ──────────────────────────

async function ventasMes(req, res, next) {
  try {
    const ahora = new Date();
    const anio  = parseInt(req.query.anio) || ahora.getFullYear();
    const mes   = parseInt(req.query.mes)  || ahora.getMonth() + 1;
    const { inicio, fin } = rangoMes(anio, mes);

    const [ventasPorDia, totalesGlobales, productosTop] = await Promise.all([
      // Ventas agrupadas por día
      Venta.findAll({
        where: { estado: 'completada', created_at: { [Op.between]: [inicio, fin] } },
        attributes: [
          [fn('DATE', col('created_at')), 'fecha'],
          [fn('COUNT', col('id')),        'cantidad'],
          [fn('SUM',   col('total')),     'monto'],
          [fn('SUM',   col('iva_10')),    'iva10'],
          [fn('SUM',   col('iva_5')),     'iva5']
        ],
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'ASC']],
        raw: true
      }),

      // Totales del mes
      Venta.findAll({
        where: { estado: 'completada', created_at: { [Op.between]: [inicio, fin] } },
        attributes: [
          [fn('COUNT', col('id')),     'totalTransacciones'],
          [fn('SUM',   col('total')),  'totalMonto'],
          [fn('SUM',   col('iva_10')), 'totalIva10'],
          [fn('SUM',   col('iva_5')),  'totalIva5']
        ],
        raw: true
      }),

      // Top 5 productos más vendidos
      DetalleVenta.findAll({
        attributes: [
          'producto_id',
          [fn('SUM', col('cantidad')),                       'totalUnidades'],
          [fn('SUM', literal('cantidad * precio_unitario')), 'totalMonto']
        ],
        include: [{
          model: Venta, as: 'venta',
          where: { estado: 'completada', created_at: { [Op.between]: [inicio, fin] } },
          attributes: []
        }, {
          model: Producto, as: 'producto',
          attributes: ['nombre'],
          include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }]
        }],
        group:  ['producto_id', 'producto.id', 'producto.nombre', 'producto.categoria.id', 'producto.categoria.nombre'],
        order:  [[fn('SUM', col('cantidad')), 'DESC']],
        limit:  5
      })
    ]);

    const t = totalesGlobales[0] || {};

    res.json({
      anio, mes,
      totales: {
        transacciones: parseInt(t.totalTransacciones) || 0,
        monto:         parseFloat(t.totalMonto)        || 0,
        iva10:         parseFloat(t.totalIva10)        || 0,
        iva5:          parseFloat(t.totalIva5)         || 0
      },
      ventasPorDia,
      productosTop
    });
  } catch (err) {
    next(err);
  }
}

// ─── Resumen rápido para dashboard ───────────────────────────────────────────

async function resumenDashboard(req, res, next) {
  try {
    const { inicio: hoy, fin: finDia } = rangoHoy();
    const { inicio: semana }           = rangoSemana();
    const ahora                        = new Date();
    const { inicio: mes }              = rangoMes(ahora.getFullYear(), ahora.getMonth() + 1);

    const [ventasHoy, ventasSemana, ventasMes] = await Promise.all([
      Venta.findAll({ where: { estado: 'completada', created_at: { [Op.between]: [hoy, finDia] } }, attributes: ['total'], raw: true }),
      Venta.findAll({ where: { estado: 'completada', created_at: { [Op.gte]: semana } }, attributes: ['total'], raw: true }),
      Venta.findAll({ where: { estado: 'completada', created_at: { [Op.gte]: mes } }, attributes: ['total'], raw: true })
    ]);

    res.json({
      hoy:    { cantidad: ventasHoy.length,    monto: ventasHoy.reduce((s, v)    => s + parseFloat(v.total), 0) },
      semana: { cantidad: ventasSemana.length, monto: ventasSemana.reduce((s, v) => s + parseFloat(v.total), 0) },
      mes:    { cantidad: ventasMes.length,    monto: ventasMes.reduce((s, v)    => s + parseFloat(v.total), 0) }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { ventasDia, ventasSemana, ventasMes, resumenDashboard };
