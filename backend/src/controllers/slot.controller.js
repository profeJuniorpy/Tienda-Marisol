'use strict';

const Joi        = require('joi');
const { Op }     = require('sequelize');
const { PickupSlot, Pedido } = require('../models');

const schemaSlot = Joi.object({
  fecha:            Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  hora_inicio:      Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  hora_fin:         Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  capacidad_maxima: Joi.number().integer().min(1).max(50).default(10)
});

// ─── Listar slots disponibles (público) ──────────────────────────────────────

async function slotsDisponibles(req, res, next) {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const slots = await PickupSlot.findAll({
      where: {
        activo: true,
        fecha:  { [Op.gte]: hoy }
      },
      order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
      attributes: ['id', 'fecha', 'hora_inicio', 'hora_fin', 'capacidad_maxima', 'reservas_actuales']
    });

    // Agregar disponibilidad calculada
    const slotsConDisp = slots.map(s => ({
      ...s.toJSON(),
      disponibles: s.capacidad_maxima - s.reservas_actuales,
      lleno:       s.reservas_actuales >= s.capacidad_maxima
    }));

    res.json({ slots: slotsConDisp });
  } catch (err) {
    next(err);
  }
}

// ─── Listar todos los slots (admin) ──────────────────────────────────────────

async function listar(req, res, next) {
  try {
    const slots = await PickupSlot.findAll({
      order: [['fecha', 'DESC'], ['hora_inicio', 'ASC']]
    });
    res.json({ slots });
  } catch (err) {
    next(err);
  }
}

// ─── Crear slot (admin) ───────────────────────────────────────────────────────

async function crear(req, res, next) {
  const { error, value } = schemaSlot.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const slot = await PickupSlot.create({
      fecha:            value.fecha,
      hora_inicio:      value.hora_inicio,
      hora_fin:         value.hora_fin,
      capacidad_maxima: value.capacidad_maxima,
      reservas_actuales: 0,
      activo:           true
    });
    res.status(201).json({ slot });
  } catch (err) {
    next(err);
  }
}

// ─── Generar slots masivos (admin) ────────────────────────────────────────────
// Crea slots para N días a partir de hoy con horarios definidos

async function generarSemana(req, res, next) {
  const { dias = 7, horarios } = req.body;
  const horariosDefault = [
    { hora_inicio: '08:00', hora_fin: '10:00' },
    { hora_inicio: '10:00', hora_fin: '12:00' },
    { hora_inicio: '14:00', hora_fin: '16:00' },
    { hora_inicio: '16:00', hora_fin: '18:00' }
  ];

  const lista = horarios || horariosDefault;

  try {
    const creados = [];
    const hoy = new Date();

    for (let d = 0; d < parseInt(dias); d++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + d);
      const fechaStr = fecha.toISOString().split('T')[0];

      for (const h of lista) {
        const [ya] = await PickupSlot.findOrCreate({
          where: { fecha: fechaStr, hora_inicio: h.hora_inicio },
          defaults: {
            hora_fin:          h.hora_fin,
            capacidad_maxima:  req.body.capacidad_maxima || 10,
            reservas_actuales: 0,
            activo:            true
          }
        });
        creados.push(ya);
      }
    }

    res.status(201).json({ mensaje: `${creados.length} slots generados`, slots: creados });
  } catch (err) {
    next(err);
  }
}

// ─── Activar/desactivar slot (admin) ─────────────────────────────────────────

async function toggleActivo(req, res, next) {
  try {
    const slot = await PickupSlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot no encontrado' });
    await slot.update({ activo: !slot.activo });
    res.json({ slot });
  } catch (err) {
    next(err);
  }
}

module.exports = { slotsDisponibles, listar, crear, generarSemana, toggleActivo };
