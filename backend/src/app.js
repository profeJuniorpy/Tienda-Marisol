require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const logger       = require('./utils/logger');
const routes       = require('./routes');

const app = express();

// ─── Seguridad HTTP ──────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, origin || true),
  credentials: true
}));

// ─── Logging de requests ──────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate limiting general ───────────────────────────────────────────────────
const limitadorGeneral = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.' }
});

// ─── Rate limiting para auth (más estricto) ──────────────────────────────────
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: { error: 'Demasiados intentos de autenticación. Intente en 15 minutos.' }
});

app.use('/api', limitadorGeneral);
app.use('/api/v1/auth', limitadorAuth);

// ─── Rutas principales ───────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ estado: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Manejador de errores global ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const estado = err.status || err.statusCode || 500;
  res.status(estado).json({
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = app;
