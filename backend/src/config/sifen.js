require('dotenv').config();

module.exports = {
  ambiente:   process.env.SIFEN_AMBIENTE    || 'test',
  ruc:        process.env.SIFEN_RUC         || '80123456-1',
  nombre:     process.env.SIFEN_NOMBRE      || 'TIENDA MARISOL',
  direccion:  process.env.SIFEN_DIRECCION   || 'Coronel Oviedo, Caaguazú, Paraguay',
  timbrado:   process.env.SIFEN_TIMBRADO    || '12345678',
  estab:      process.env.SIFEN_ESTAB       || '001',
  puntoExp:   process.env.SIFEN_PUNTO_EXP   || '001',
  certificado: {
    path:     process.env.SIFEN_CERTIFICADO_PATH     || null,
    password: process.env.SIFEN_CERTIFICADO_PASSWORD || null
  },
  urls: {
    test:       'https://sifen-homologacion.set.gov.py/de/ws/sync/recibe.wsdl',
    produccion: 'https://sifen.set.gov.py/de/ws/sync/recibe.wsdl'
  }
};
