'use strict';

const Joi     = require('joi');
const { Usuario } = require('../models');

const schemaCrear = Joi.object({
  nombre:   Joi.string().min(2).max(100).required().messages({ 'any.required': 'El nombre es requerido' }),
  email:    Joi.string().email().required().messages({ 'any.required': 'El email es requerido' }),
  password: Joi.string().min(6).required().messages({ 'string.min': 'La contraseña debe tener al menos 6 caracteres' }),
  rol:      Joi.string().valid('admin', 'vendedor').default('vendedor')
});

const schemaActualizar = Joi.object({
  nombre: Joi.string().min(2).max(100),
  email:  Joi.string().email(),
  rol:    Joi.string().valid('admin', 'vendedor')
}).min(1);

async function listar(req, res) {
  try {
    const usuarios = await Usuario.findAll({ order: [['created_at', 'DESC']] });
    res.json({ usuarios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function crear(req, res) {
  const { error, value } = schemaCrear.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existe = await Usuario.findOne({ where: { email: value.email } });
    if (existe) return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });

    const usuario = await Usuario.create({
      nombre:        value.nombre,
      email:         value.email,
      password_hash: value.password, // beforeCreate hook lo hashea
      rol:           value.rol
    });
    res.status(201).json({ usuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function actualizar(req, res) {
  const { error, value } = schemaActualizar.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (String(usuario.id) === String(req.usuario.id)) {
      return res.status(403).json({ error: 'No puedes modificar tu propia cuenta desde aquí' });
    }

    if (value.email && value.email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email: value.email } });
      if (existe) return res.status(409).json({ error: 'El email ya está en uso' });
    }

    await usuario.update(value);
    res.json({ usuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function cambiarPassword(req, res) {
  const { nueva_password } = req.body;
  if (!nueva_password || nueva_password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const usuario = await Usuario.scope('conPassword').findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.update({ password_hash: nueva_password }); // beforeUpdate hook hashea
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function toggleActivo(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (String(usuario.id) === String(req.usuario.id)) {
      return res.status(403).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    await usuario.update({ activo: !usuario.activo });
    res.json({ usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, crear, actualizar, cambiarPassword, toggleActivo };
