const { Op } = require('sequelize');
const { Lote, Producto, MovimientoStock, Alerta } = require('../models');

/**
 * Descuenta stock usando FEFO: consume primero el lote con fecha_vencimiento más próxima.
 * Debe ejecutarse dentro de una transacción Sequelize externa.
 *
 * @returns {Array} lotesConsumidos — [{ lote_id, cantidad }]
 */
async function descontarFEFO(productoId, cantidadTotal, transaction, usuarioId = null) {
  const lotes = await Lote.findAll({
    where: {
      producto_id:     productoId,
      cantidad_actual: { [Op.gt]: 0 },
      activo:          true
    },
    order: [
      ['fecha_vencimiento', 'ASC'],
      ['fecha_ingreso',     'ASC']
    ],
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  let restante = cantidadTotal;
  const lotesConsumidos = [];

  for (const lote of lotes) {
    if (restante <= 0) break;
    const consumido = Math.min(lote.cantidad_actual, restante);
    await lote.update({ cantidad_actual: lote.cantidad_actual - consumido }, { transaction });
    restante -= consumido;
    lotesConsumidos.push({ lote_id: lote.id, cantidad: consumido });
  }

  if (restante > 0) {
    throw new Error(`Stock insuficiente para el producto ID ${productoId}. Faltan ${restante} unidades.`);
  }

  // Actualizar stock_actual en la tabla productos
  const producto = await Producto.findByPk(productoId, { transaction });
  const stockAnterior = producto.stock_actual;
  const stockNuevo    = stockAnterior - cantidadTotal;
  await producto.update({ stock_actual: stockNuevo }, { transaction });

  // Registrar un movimiento de salida por cada lote consumido
  for (const lc of lotesConsumidos) {
    await MovimientoStock.create({
      producto_id:    productoId,
      lote_id:        lc.lote_id,
      tipo:           'salida',
      cantidad:       lc.cantidad,
      stock_anterior: stockAnterior,
      stock_nuevo:    stockNuevo,
      motivo:         'Venta FEFO',
      referencia_tipo: 'venta',
      usuario_id:     usuarioId
    }, { transaction });
  }

  return lotesConsumidos;
}

/**
 * Registra un lote de entrada y actualiza el stock_actual del producto.
 * Debe ejecutarse dentro de una transacción.
 */
async function registrarEntrada(productoId, datos, transaction, usuarioId = null) {
  const {
    cantidad, fecha_vencimiento, numero_lote,
    proveedor_id, costo_unitario, fecha_ingreso
  } = datos;

  const lote = await Lote.create({
    producto_id:      productoId,
    numero_lote:      numero_lote || null,
    cantidad_inicial: cantidad,
    cantidad_actual:  cantidad,
    fecha_vencimiento: fecha_vencimiento || null,
    fecha_ingreso:    fecha_ingreso || new Date(),
    proveedor_id:     proveedor_id || null,
    costo_unitario:   costo_unitario || null
  }, { transaction });

  const producto = await Producto.findByPk(productoId, { transaction });
  const stockAnterior = producto.stock_actual;
  const stockNuevo    = stockAnterior + cantidad;
  await producto.update({ stock_actual: stockNuevo }, { transaction });

  await MovimientoStock.create({
    producto_id:    productoId,
    lote_id:        lote.id,
    tipo:           'entrada',
    cantidad,
    stock_anterior: stockAnterior,
    stock_nuevo:    stockNuevo,
    motivo:         'Compra / ingreso de lote',
    referencia_tipo: 'compra',
    usuario_id:     usuarioId
  }, { transaction });

  return lote;
}

/**
 * Registra un ajuste manual (corrección o merma).
 * Crea su propio movimiento pero NO su propia transacción — usar desde el controlador.
 */
async function ajustarStock(productoId, tipo, cantidad, motivo, transaction, usuarioId = null) {
  const producto = await Producto.findByPk(productoId, { transaction });
  if (!producto) throw new Error('Producto no encontrado');

  const stockAnterior = producto.stock_actual;
  let stockNuevo;

  if (tipo === 'entrada' || tipo === 'ajuste') {
    stockNuevo = stockAnterior + parseInt(cantidad);
  } else {
    stockNuevo = stockAnterior - parseInt(cantidad);
    if (stockNuevo < 0) throw new Error('El ajuste dejaría el stock en negativo');
  }

  await producto.update({ stock_actual: stockNuevo }, { transaction });

  await MovimientoStock.create({
    producto_id:    productoId,
    tipo,
    cantidad:       parseInt(cantidad),
    stock_anterior: stockAnterior,
    stock_nuevo:    stockNuevo,
    motivo:         motivo || `${tipo} manual`,
    referencia_tipo: 'ajuste',
    usuario_id:     usuarioId
  }, { transaction });

  return { stock_anterior: stockAnterior, stock_nuevo: stockNuevo };
}

/**
 * Verifica si hay stock suficiente sin modificar nada.
 */
async function verificarDisponibilidad(productoId, cantidad) {
  const producto = await Producto.findByPk(productoId);
  if (!producto || !producto.activo) return { disponible: false, motivo: 'Producto no disponible' };
  if (producto.stock_actual < cantidad) {
    return { disponible: false, motivo: `Stock insuficiente (disponible: ${producto.stock_actual})` };
  }
  return { disponible: true, stock_actual: producto.stock_actual };
}

/**
 * Genera alertas de vencimiento y stock mínimo. Llamado por el job cron.
 */
async function generarAlertas() {
  const hoy  = new Date();
  const en7  = new Date(hoy); en7.setDate(en7.getDate() + 7);

  // Alertas de vencimiento
  const lotesPorVencer = await Lote.findAll({
    where: {
      activo:          true,
      cantidad_actual: { [Op.gt]: 0 },
      fecha_vencimiento: { [Op.between]: [hoy, en7] }
    },
    include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }]
  });

  for (const lote of lotesPorVencer) {
    const diasRestantes = Math.ceil(
      (new Date(lote.fecha_vencimiento) - hoy) / (1000 * 60 * 60 * 24)
    );
    const yaExiste = await Alerta.findOne({
      where: { lote_id: lote.id, tipo: 'vencimiento', leida: false }
    });
    if (yaExiste) continue;

    await Alerta.create({
      tipo:        'vencimiento',
      producto_id: lote.producto_id,
      lote_id:     lote.id,
      mensaje:     `Lote "${lote.numero_lote || lote.id}" de "${lote.producto.nombre}" vence en ${diasRestantes} día(s) (${lote.fecha_vencimiento}). Stock: ${lote.cantidad_actual} unidades.`
    });
  }

  // Alertas de stock mínimo
  const productosStockBajo = await Producto.findAll({
    where: { activo: true }
  });

  for (const p of productosStockBajo) {
    if (p.stock_actual > p.stock_minimo) continue;
    const yaExiste = await Alerta.findOne({
      where: { producto_id: p.id, tipo: 'stock_minimo', leida: false }
    });
    if (yaExiste) continue;

    await Alerta.create({
      tipo:        'stock_minimo',
      producto_id: p.id,
      mensaje:     `"${p.nombre}" tiene stock bajo: ${p.stock_actual} unidades (mínimo configurado: ${p.stock_minimo}).`
    });
  }
}

module.exports = { descontarFEFO, registrarEntrada, ajustarStock, verificarDisponibilidad, generarAlertas };
