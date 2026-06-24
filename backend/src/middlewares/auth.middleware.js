const jwt = require('jsonwebtoken');

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function extraerToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAuth(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ error: 'Token de autenticación requerido' });

  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireRol(...roles) {
  return (req, res, next) => {
    const token = extraerToken(req);
    if (!token) return res.status(401).json({ error: 'Token de autenticación requerido' });

    try {
      const payload = verificarToken(token);
      if (payload.tipo !== 'interno') {
        return res.status(403).json({ error: 'Acceso restringido al panel interno' });
      }
      if (!roles.includes(payload.rol)) {
        return res.status(403).json({ error: `Rol requerido: ${roles.join(' o ')}` });
      }
      req.usuario = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
}

function requireCliente(req, res, next) {
  const token = extraerToken(req);
  if (!token) return res.status(401).json({ error: 'Debes iniciar sesión como cliente' });

  try {
    const payload = verificarToken(token);
    if (payload.tipo !== 'cliente') {
      return res.status(403).json({ error: 'Acceso restringido a clientes' });
    }
    req.cliente = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { requireAuth, requireRol, requireCliente };
