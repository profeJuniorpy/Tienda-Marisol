'use strict';

const Joi      = require('joi');
const { Op }   = require('sequelize');
const { sequelize, Pedido, DetallePedido, Producto, PickupSlot, Cliente, Alerta } = require('../models');
const { generarCodigoRetiro } = require('../utils/codigoRetiro');
const { enviarConfirmacionPedido } = require('../services/email.service');

// ─── Esquemas ─────────────────────────────────────────────────────────────────

const schemaCrear = Joi.object({
  slot_id: Joi.number().integer().positive().required(),
  items:   Joi.array().min(1).items(
    Joi.object({
      producto_id:     Joi.number().integer().positive().required(),
      cantidad:        Joi.number().positive().required(),
      precio_unitario: Joi.number().positive().required()
    })
  ).required(),
  nombre_contacto: Joi.string().max(100).optional(),
  telefono:        Joi.string().max(20).optional().allow('')
});

// ─── Crear pedido (cliente autenticado) ──────────────────────────────────────

async function crear(req, res, next) {
  const { error, value } = schemaCrear.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const clienteId = req.cliente.id;
  const { slot_id, items, nombre_contacto, telefono } = value;

  try {
    let pedidoCreado;

    await sequelize.transaction(async (t) => {
      // 1. Verificar slot disponible (con lock)
      const slot = await PickupSlot.findByPk(slot_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!slot || !slot.activo) {
        throw Object.assign(new Error('Slot no disponible'), { status: 400 });
      }
      if (slot.reservas_actuales >= slot.capacidad_maxima) {
        throw Object.assign(new Error('El horario seleccionado ya está lleno'), { status: 409 });
      }

      // 2. Verificar stock de cada ítem
      for (const item of items) {
        const prod = await Producto.findByPk(item.producto_id, { transaction: t });
        if (!prod || !prod.activo) {
          throw Object.assign(new Error(`Producto #${item.producto_id} no disponible`), { status: 400 });
        }
        if (prod.stock_actual < item.cantidad) {
          throw Object.assign(new Error(`Stock insuficiente para "${prod.nombre}"`), { status: 409 });
        }
      }

      // 3. Calcular total
      const subtotal = items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0);

      // 4. Generar código retiro
      const codigo_retiro = await generarCodigoRetiro(Pedido);

      // 5. Crear cabecera del pedido
      pedidoCreado = await Pedido.create({
        cliente_id:      clienteId,
        slot_id,
        estado:          'pendiente',
        codigo_retiro,
        nombre_contacto: nombre_contacto || null,
        telefono:        telefono || null,
        subtotal:        Math.round(subtotal),
        descuento:       0,
        total:           Math.round(subtotal)
      }, { transaction: t });

      // 6. Crear detalles
      for (const item of items) {
        const prod = await Producto.findByPk(item.producto_id, { transaction: t });
        await DetallePedido.create({
          pedido_id:       pedidoCreado.id,
          producto_id:     item.producto_id,
          cantidad:        item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal:        Math.round(item.precio_unitario * item.cantidad),
          nombre_snapshot: prod.nombre
        }, { transaction: t });
      }

      // 7. Reservar slot
      await slot.update(
        { reservas_actuales: slot.reservas_actuales + 1 },
        { transaction: t }
      );

      // 8. Crear alerta para admin
      await Alerta.create({
        tipo:    'pedido_nuevo',
        mensaje: `Nuevo pedido #${pedidoCreado.id} — ${codigo_retiro} · Retiro: ${slot.fecha} ${slot.hora_inicio}`,
        leida:   false
      }, { transaction: t });
    });

    // Recargar con relaciones para el email
    const pedidoConDetalle = await Pedido.findByPk(pedidoCreado.id, {
      include: [
        { model: DetallePedido, as: 'detalles' },
        { model: PickupSlot,    as: 'slot' },
        { model: Cliente,       as: 'cliente', attributes: ['nombre', 'email'] }
      ]
    });

    // Enviar email de confirmación (no bloquea la respuesta)
    enviarConfirmacionPedido({
      pedido:   pedidoConDetalle,
      cliente:  pedidoConDetalle.cliente,
      slot:     pedidoConDetalle.slot,
      detalles: pedidoConDetalle.detalles
    }).catch(() => {});

    res.status(201).json({ pedido: pedidoConDetalle });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

// ─── Mis pedidos (cliente) ────────────────────────────────────────────────────

async function misPedidos(req, res, next) {
  try {
    const pedidos = await Pedido.findAll({
      where: { cliente_id: req.cliente.id },
      include: [
        { model: DetallePedido, as: 'detalles', attributes: ['producto_id', 'nombre_snapshot', 'cantidad', 'precio_unitario', 'subtotal'] },
        { model: PickupSlot,    as: 'slot',     attributes: ['fecha', 'hora_inicio', 'hora_fin'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ pedidos });
  } catch (err) {
    next(err);
  }
}

// ─── Listar pedidos (admin) ───────────────────────────────────────────────────

async function listar(req, res, next) {
  try {
    const { estado, fecha, page = 1, limit = 20, busqueda } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = {};

    if (estado)   where.estado = estado;
    if (busqueda) where[Op.or] = [
      { codigo_retiro: { [Op.like]: `%${busqueda}%` } }
    ];
    if (fecha) {
      where.created_at = {
        [Op.gte]: new Date(fecha + 'T00:00:00'),
        [Op.lte]: new Date(fecha + 'T23:59:59')
      };
    }

    const { count, rows } = await Pedido.findAndCountAll({
      where,
      include: [
        { model: Cliente,    as: 'cliente',  attributes: ['nombre', 'email', 'telefono'], required: false },
        { model: PickupSlot, as: 'slot',     attributes: ['fecha', 'hora_inicio', 'hora_fin'] },
        { model: DetallePedido, as: 'detalles', attributes: ['nombre_snapshot', 'cantidad', 'precio_unitario'] }
      ],
      order:  [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
      distinct: true
    });

    res.json({ pedidos: rows, total: count, paginas: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
}

// ─── Detalle de un pedido (admin) ─────────────────────────────────────────────

async function obtener(req, res, next) {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: DetallePedido, as: 'detalles' },
        { model: Cliente,       as: 'cliente',  attributes: ['nombre', 'email', 'telefono'], required: false },
        { model: PickupSlot,    as: 'slot' }
      ]
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}

// ─── Cambiar estado del pedido (admin) ────────────────────────────────────────

async function cambiarEstado(req, res, next) {
  const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'listo', 'retirado', 'cancelado'];
  const { estado } = req.body;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}` });
  }

  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.estado === 'retirado' || pedido.estado === 'cancelado') {
      return res.status(409).json({ error: 'No se puede modificar un pedido finalizado' });
    }

    await pedido.update({ estado });

    // Si se cancela, liberar el slot
    if (estado === 'cancelado' && pedido.slot_id) {
      await PickupSlot.decrement('reservas_actuales', { where: { id: pedido.slot_id } });
    }

    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}

// ─── Buscar pedido por código de retiro (vendedor) ───────────────────────────

async function porCodigoRetiro(req, res, next) {
  try {
    const pedido = await Pedido.findOne({
      where:   { codigo_retiro: req.params.codigo.toUpperCase() },
      include: [
        { model: DetallePedido, as: 'detalles' },
        { model: Cliente,       as: 'cliente', attributes: ['nombre', 'email'], required: false },
        { model: PickupSlot,    as: 'slot' }
      ]
    });
    if (!pedido) return res.status(404).json({ error: 'Código de retiro no encontrado' });
    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, misPedidos, listar, obtener, cambiarEstado, porCodigoRetiro };
