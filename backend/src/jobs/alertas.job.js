const cron          = require('node-cron');
const logger        = require('../utils/logger');
const stockService  = require('../services/stock.service');

async function ejecutar() {
  try {
    await stockService.generarAlertas();
    logger.info('Job de alertas ejecutado correctamente.');
  } catch (err) {
    logger.error('Error en job de alertas:', err);
  }
}

function iniciar() {
  cron.schedule('0 8 * * *', ejecutar);
  logger.info('Job de alertas programado (08:00 diario).');
}

module.exports = { iniciar, ejecutar };
