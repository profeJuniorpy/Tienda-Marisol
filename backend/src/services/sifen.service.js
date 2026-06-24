'use strict';

/**
 * SifenService — Facturación Electrónica SIFEN / SET Paraguay
 *
 * Implementa la construcción del XML del Documento Electrónico (DE)
 * según las especificaciones técnicas de la SET (versión 150).
 *
 * En ambiente "test" o cuando no hay certificado configurado, el sistema
 * opera en MODO CONTINGENCIA: genera un comprobante local numerado que
 * es válido para uso interno y puede ser enviado a SIFEN posteriormente.
 *
 * Referencia: https://www.set.gov.py/portal/PARAGUAY-SET/sifen
 */

const https   = require('https');
const config  = require('../config/sifen');
const logger  = require('../utils/logger');

// ─── Generación de CDC ────────────────────────────────────────────────────────
// El CDC (Código de Control) de 44 dígitos identifica unívocamente un DE.
// Formato: iTiDE(2) + dNumTim(8) + dRucEm(8) + dDVEmi(1) + iTipEst(3) +
//          dDesPunExp(3) + dNumDoc(7) + dSerie(2) + iNaturOpe(1) + cMoneOpe(3) +
//          dCondTipCam(1) + dFecFirma(8) + dSisFact(3) + dDigVal(1)
function generarCDC({ tipoDE, timbrado, estab, puntoExp, numero, rucEmisor, dvEmisor, fecha }) {
  const rucPad    = String(rucEmisor).replace('-', '').padStart(8, '0');
  const numPad    = String(numero).padStart(7, '0');
  const fechaStr  = fecha.replace(/-/g, '').substring(0, 8);
  const raw       = `${String(tipoDE).padStart(2,'0')}${String(timbrado).padStart(8,'0')}${rucPad}${dvEmisor}${String(estab).padStart(3,'0')}${String(puntoExp).padStart(3,'0')}${numPad}01${1}PYG${1}${fechaStr}001`;
  // Dígito verificador (módulo 11 simplificado)
  const dv = calcularModulo11(raw.substring(0, 43));
  return raw.substring(0, 43) + dv;
}

function calcularModulo11(cadena) {
  const pesos = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7,
                 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7,
                 2, 3, 4, 5, 6, 7, 2];
  let suma = 0;
  for (let i = cadena.length - 1, j = 0; i >= 0; i--, j++) {
    suma += parseInt(cadena[i]) * (pesos[j % pesos.length]);
  }
  const resto = suma % 11;
  return String(resto < 2 ? 0 : 11 - resto);
}

// ─── Generación del número de comprobante ─────────────────────────────────────
function generarNumeroComprobante(facturaId, estab = '001', puntoExp = '001') {
  const secuencial = String(facturaId).padStart(7, '0');
  return `${estab}-${puntoExp}-${secuencial}`;
}

// ─── Constructor del XML DE ───────────────────────────────────────────────────
function construirXmlDE({ venta, detalles, factura, rucCliente, nombreCliente }) {
  const { calcularMontos } = require('../utils/iva');
  const rucEmisor = config.ruc?.split('-')[0] || '80000000';
  const dvEmisor  = config.ruc?.split('-')[1] || '1';
  const fechaHoy  = new Date().toISOString().split('T')[0];
  const horaHoy   = new Date().toTimeString().split(' ')[0];
  const fechaISO  = `${fechaHoy}T${horaHoy}`;
  const numSecuencial = factura.id || 1;

  const cdc = generarCDC({
    tipoDE: 1, timbrado: '12345678',
    estab: '001', puntoExp: '001',
    numero: numSecuencial,
    rucEmisor, dvEmisor,
    fecha: fechaHoy
  });

  const totales = calcularMontos(detalles.map(d => ({
    precio_unitario: parseFloat(d.precio_unitario),
    cantidad:        d.cantidad,
    tasa_iva:        d.tasa_iva || 'IVA_10'
  })));

  const itemsXml = detalles.map((d, i) => `
    <gCamItem>
      <dNumLinOrd>${i + 1}</dNumLinOrd>
      <dDesProSer>${escapeXml(d.nombre || d.producto?.nombre || 'Producto')}</dDesProSer>
      <dCantProSer>${d.cantidad}</dCantProSer>
      <dUniMed>77</dUniMed>
      <dDesUniMed>UNIDAD</dDesUniMed>
      <dPUniProSer>${Math.round(d.precio_unitario)}</dPUniProSer>
      <dTotBruOpeItem>${Math.round(d.precio_unitario * d.cantidad)}</dTotBruOpeItem>
      <gValorItem>
        <dPTotBruOpeItem>${Math.round(d.precio_unitario * d.cantidad)}</dPTotBruOpeItem>
        <dDescItem>0</dDescItem>
        <dPorcDesIt>0</dPorcDesIt>
        <dDescGloItem>0</dDescGloItem>
        <dAntGloPreUniIt>0</dAntGloPreUniIt>
        <dTotOpeItem>${Math.round(d.precio_unitario * d.cantidad)}</dTotOpeItem>
        <dTotOpeGs>${Math.round(d.precio_unitario * d.cantidad)}</dTotOpeGs>
      </gValorItem>
      <gCamIVAItem>
        <iAfecIVA>${d.tasa_iva === 'EXENTO' ? 3 : d.tasa_iva === 'IVA_5' ? 2 : 1}</iAfecIVA>
        <dDesAfecIVA>${d.tasa_iva === 'EXENTO' ? 'Exenta' : d.tasa_iva === 'IVA_5' ? 'Gravada IVA 5%' : 'Gravada IVA 10%'}</dDesAfecIVA>
        <dPropIVA>100</dPropIVA>
        <dTasaIVA>${d.tasa_iva === 'EXENTO' ? 0 : d.tasa_iva === 'IVA_5' ? 5 : 10}</dTasaIVA>
        <dBasGravIVA>${Math.round(d.precio_unitario * d.cantidad)}</dBasGravIVA>
        <dLiqIVAItem>${d.tasa_iva === 'EXENTO' ? 0 : d.tasa_iva === 'IVA_5' ? Math.round(d.precio_unitario * d.cantidad * 5/105) : Math.round(d.precio_unitario * d.cantidad * 10/110)}</dLiqIVAItem>
      </gCamIVAItem>
    </gCamItem>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope">
  <env:Body>
    <rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd">
      <DE Id="${cdc}">
        <gOpeDE>
          <iTipEmi>1</iTipEmi>
          <dDesTipEmi>Emisión Normal</dDesTipEmi>
          <dSisFact>001</dSisFact>
        </gOpeDE>
        <gTimb>
          <iTiDE>1</iTiDE>
          <dDesTiDE>Factura electrónica</dDesTiDE>
          <dNumTim>12345678</dNumTim>
          <dEst>001</dEst>
          <dPunExp>001</dPunExp>
          <dNumDoc>${String(numSecuencial).padStart(7,'0')}</dNumDoc>
          <dSerieNum>AA</dSerieNum>
          <dFeIniVal>${fechaHoy}</dFeIniVal>
        </gTimb>
        <gDatGralOpe>
          <dFeEmiDE>${fechaISO}</dFeEmiDE>
          <gOpeCom>
            <iTipTra>1</iTipTra>
            <dDesTipTra>Venta de mercaderías</dDesTipTra>
            <iTImp>1</iTImp>
            <dDesTImp>IVA</dDesTImp>
            <cMoneOpe>PYG</cMoneOpe>
            <dDesMoneOpe>Guaraníes</dDesMoneOpe>
            <dCondTipCam>1</dCondTipCam>
          </gOpeCom>
          <gEmis>
            <dRucEm>${rucEmisor}</dRucEm>
            <dDVEmi>${dvEmisor}</dDVEmi>
            <iTiOpe>1</iTiOpe>
            <cPaisEmi>PRY</cPaisEmi>
            <dNomEmi>${escapeXml(config.nombre || 'TIENDA MARISOL')}</dNomEmi>
            <dDirEmi>${escapeXml(config.direccion || 'CORONEL OVIEDO')}</dDirEmi>
            <dNumCas>0</dNumCas>
            <dTelEmi>000000000</dTelEmi>
          </gEmis>
          <gDatRec>
            <iNatRec>${rucCliente ? 1 : 2}</iNatRec>
            <dNomRec>${escapeXml(nombreCliente || 'Sin nombre')}</dNomRec>
            ${rucCliente ? `<dRucRec>${rucCliente.split('-')[0]}</dRucRec><dDVRec>${rucCliente.split('-')[1] || '0'}</dDVRec>` : '<dInnominado>S</dInnominado>'}
            <cPaisRec>PRY</cPaisRec>
          </gDatRec>
        </gDatGralOpe>
        <gDtipDE>
          <gCamFE>
            <iIndPres>1</iIndPres>
            <dDesIndPres>Operación presencial</dDesIndPres>
            ${itemsXml}
          </gCamFE>
        </gDtipDE>
        <gTotSub>
          <dSubExe>${0}</dSubExe>
          <dSubExo>${0}</dSubExo>
          <dSub5>${totales.iva5 > 0 ? Math.round(totales.subtotal) : 0}</dSub5>
          <dSub10>${totales.iva10 > 0 ? Math.round(totales.subtotal) : 0}</dSub10>
          <dTotOpe>${totales.total}</dTotOpe>
          <dTotDesc>${Math.round(venta.descuento || 0)}</dTotDesc>
          <dTotDescGlotem>0</dTotDescGlotem>
          <dTotAnt>0</dTotAnt>
          <dPorcDescTotal>0</dPorcDescTotal>
          <dDescTotal>0</dDescTotal>
          <dAnticipo>0</dAnticipo>
          <dRedon>0</dRedon>
          <dTotGralOpe>${totales.total}</dTotGralOpe>
          <dIVA5>${totales.iva5}</dIVA5>
          <dIVA10>${totales.iva10}</dIVA10>
          <dLiqTotIVA5>${totales.iva5}</dLiqTotIVA5>
          <dLiqTotIVA10>${totales.iva10}</dLiqTotIVA10>
          <dIVAOpe>${totales.iva5 + totales.iva10}</dIVAOpe>
          <dBaseGrav5>${totales.iva5 > 0 ? Math.round(totales.subtotal) : 0}</dBaseGrav5>
          <dBaseGrav10>${totales.iva10 > 0 ? Math.round(totales.subtotal) : 0}</dBaseGrav10>
          <dTBasGraNum>${Math.round(totales.subtotal)}</dTBasGraNum>
          <dTotalGs>${totales.total}</dTotalGs>
        </gTotSub>
      </DE>
    </rDE>
  </env:Body>
</env:Envelope>`;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Envío a SIFEN ─────────────────────────────────────────────────────────────
async function enviarASIFEN(xmlSoap) {
  return new Promise((resolve, reject) => {
    const url       = config.urls[config.ambiente] || config.urls.test;
    const urlObj    = new URL(url);
    const opciones  = {
      hostname: urlObj.hostname,
      port:     urlObj.port || 443,
      path:     urlObj.pathname,
      method:   'POST',
      timeout:  8000,
      headers: {
        'Content-Type':   'application/soap+xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(xmlSoap, 'utf8')
      },
      rejectUnauthorized: false
    };

    const req = https.request(opciones, (res) => {
      let datos = '';
      res.on('data', chunk => { datos += chunk; });
      res.on('end', () => resolve(datos));
    });

    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout SIFEN')); });
    req.write(xmlSoap);
    req.end();
  });
}

// ─── Parseo de respuesta SIFEN ────────────────────────────────────────────────
function parsearRespuestaSIFEN(xmlRespuesta) {
  try {
    const aprobado  = xmlRespuesta.includes('<dEstRes>Aprobado</dEstRes>');
    const rechazado = xmlRespuesta.includes('<dEstRes>Rechazado</dEstRes>');
    const cdcMatch  = xmlRespuesta.match(/<Id>([A-Za-z0-9]{44})<\/Id>/);
    const cdc       = cdcMatch ? cdcMatch[1] : null;

    if (aprobado)  return { estado: 'aprobado',  cdc };
    if (rechazado) return { estado: 'rechazado', cdc };
    return { estado: 'pendiente', cdc };
  } catch {
    return { estado: 'pendiente', cdc: null };
  }
}

// ─── Función principal: emitir factura ────────────────────────────────────────
/**
 * Intenta emitir la factura via SIFEN.
 * Si SIFEN falla o no está configurado, retorna datos para modo contingencia.
 *
 * @param {Object} venta        - Objeto venta de la BD
 * @param {Array}  detalles     - Array de ítems con nombre/precio/cantidad/tasa_iva
 * @param {Object} factura      - Objeto factura ya creado en la BD
 * @param {Object} datosCliente - { ruc_cliente, nombre_cliente }
 * @returns {{ estado_sifen, cdc, xml_de, numero_comprobante }}
 */
async function emitirFactura(venta, detalles, factura, datosCliente = {}) {
  const numero_comprobante = generarNumeroComprobante(factura.id);

  // Si no hay RUC configurado o estamos en modo test sin certificado → contingencia
  const sinCertificado = !config.certificado?.path || config.ambiente !== 'produccion';

  if (sinCertificado) {
    logger.info(`SIFEN: modo contingencia (ambiente=${config.ambiente}). Factura ${numero_comprobante}`);
    return {
      estado_sifen:       'contingencia',
      cdc:                null,
      xml_de:             null,
      numero_comprobante
    };
  }

  // Construir y enviar XML
  try {
    const xml    = construirXmlDE({ venta, detalles, factura, ...datosCliente });
    const resp   = await enviarASIFEN(xml);
    const result = parsearRespuestaSIFEN(resp);
    logger.info(`SIFEN: factura ${numero_comprobante} → ${result.estado}`);
    return { ...result, xml_de: xml, numero_comprobante };
  } catch (err) {
    logger.warn(`SIFEN no disponible: ${err.message}. Usando contingencia.`);
    return {
      estado_sifen:       'contingencia',
      cdc:                null,
      xml_de:             null,
      numero_comprobante
    };
  }
}

module.exports = {
  emitirFactura,
  construirXmlDE,
  generarNumeroComprobante,
  generarCDC
};
