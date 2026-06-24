const jwt  = require('jsonwebtoken');
const Joi  = require('joi');
const { Usuario, Cliente } = require('../models');

const schemaLoginAdmin = Joi.object({
  email:    Joi.string().email().required().messages({ 'any.required': 'El email es requerido' }),
  password: Joi.string().min(6).required().messages({ 'any.required': 'La contraseña es requerida' })
});

const schemaRegistroCliente = Joi.object({
  nombre:   Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  telefono: Joi.string().max(20).optional().allow(''),
  ruc:      Joi.string().max(20).optional().allow('')
});

function generarTokens(payload, tipo) {
  const expInterno  = process.env.JWT_EXPIRES_IN  || '8h';
  const expCliente  = process.env.JWT_CLIENTE_EXPIRES_IN || '30d';
  const expRefresh  = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  const expiresIn = tipo === 'cliente' ? expCliente : expInterno;

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  const refreshToken = jwt.sign(
    { id: payload.id, tipo: payload.tipo },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: expRefresh }
  );

  return { accessToken, refreshToken };
}

async function loginAdmin(req, res) {
  const { error, value } = schemaLoginAdmin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = value;

  try {
    const usuario = await Usuario.scope('conPassword').findOne({ where: { email, activo: true } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valida = await usuario.verificarPassword(password);
    if (!valida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol, tipo: 'interno' };
    const { accessToken, refreshToken } = generarTokens(payload, 'interno');

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function loginCliente(req, res) {
  const { error, value } = schemaLoginAdmin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = value;

  try {
    const cliente = await Cliente.scope('conPassword').findOne({ where: { email, activo: true } });
    if (!cliente) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valida = await cliente.verificarPassword(password);
    if (!valida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const payload = { id: cliente.id, email: cliente.email, tipo: 'cliente' };
    const { accessToken, refreshToken } = generarTokens(payload, 'cliente');

    res.json({
      cliente: { id: cliente.id, nombre: cliente.nombre, email: cliente.email },
      accessToken,
      refreshToken
    });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function registroCliente(req, res) {
  const { error, value } = schemaRegistroCliente.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existe = await Cliente.findOne({ where: { email: value.email } });
    if (existe) return res.status(409).json({ error: 'El email ya está registrado' });

    const cliente = await Cliente.create({
      nombre:        value.nombre,
      email:         value.email,
      password_hash: value.password,
      telefono:      value.telefono || null,
      ruc:           value.ruc || null
    });

    const payload = { id: cliente.id, email: cliente.email, tipo: 'cliente' };
    const { accessToken, refreshToken } = generarTokens(payload, 'cliente');

    res.status(201).json({
      cliente: { id: cliente.id, nombre: cliente.nombre, email: cliente.email },
      accessToken,
      refreshToken
    });
  } catch {
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
}

async function refreshToken(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Refresh token requerido' });

  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

    let entidad, nuevoPayload;
    if (payload.tipo === 'interno') {
      entidad = await Usuario.findByPk(payload.id);
      nuevoPayload = { id: entidad.id, email: entidad.email, rol: entidad.rol, tipo: 'interno' };
    } else {
      entidad = await Cliente.findByPk(payload.id);
      nuevoPayload = { id: entidad.id, email: entidad.email, tipo: 'cliente' };
    }

    if (!entidad || !entidad.activo) return res.status(401).json({ error: 'Cuenta inactiva' });

    const tokens = generarTokens(nuevoPayload, payload.tipo);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
}

module.exports = { loginAdmin, loginCliente, registroCliente, refreshToken };
