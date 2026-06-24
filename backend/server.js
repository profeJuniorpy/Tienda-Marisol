require('dotenv').config();

const app        = require('./src/app');
const { sequelize, Usuario, Categoria } = require('./src/models');
const logger     = require('./src/utils/logger');
const alertasJob = require('./src/jobs/alertas.job');

const PUERTO = parseInt(process.env.PORT) || 3000;

async function sembrarDatosIniciales() {
  const totalUsuarios = await Usuario.count();
  if (totalUsuarios === 0) {
    await Usuario.create({
      nombre:        process.env.ADMIN_NOMBRE   || 'Administrador',
      email:         process.env.ADMIN_EMAIL    || 'admin@marisol.com',
      password_hash: process.env.ADMIN_PASSWORD || 'Admin1234!',
      rol:           'admin',
      activo:        true
    });
    logger.info(`[seed] Admin creado: ${process.env.ADMIN_EMAIL || 'admin@marisol.com'} / ${process.env.ADMIN_PASSWORD ? '(ver env ADMIN_PASSWORD)' : 'Admin1234!'}`);
  }

  const totalCategorias = await Categoria.count();
  if (totalCategorias === 0) {
    await Categoria.bulkCreate([
      { nombre: 'Lácteos',          activo: true },
      { nombre: 'Bebidas',          activo: true },
      { nombre: 'Limpieza',         activo: true },
      { nombre: 'Almacén',          activo: true },
      { nombre: 'Carnes',           activo: true },
      { nombre: 'Panadería',        activo: true },
      { nombre: 'Snacks',           activo: true },
      { nombre: 'Higiene personal', activo: true },
    ]);
    logger.info('[seed] 8 categorías iniciales creadas');
  }
}

async function iniciar() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida.');

    await sequelize.sync({ alter: false });
    logger.info('Modelos sincronizados.');

    await sembrarDatosIniciales();

    alertasJob.iniciar();

    app.listen(PUERTO, () => {
      logger.info(`Servidor iniciado en http://localhost:${PUERTO}`);
    });
  } catch (err) {
    logger.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

iniciar();
