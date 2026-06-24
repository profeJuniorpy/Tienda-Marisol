const TASAS_IVA = {
  IVA_10: 0.10,
  IVA_5:  0.05,
  EXENTO: 0.00
};

function calcularMontos(items) {
  let subtotal = 0;
  let iva10    = 0;
  let iva5     = 0;

  for (const item of items) {
    const base = item.precio_unitario * item.cantidad;
    subtotal += base;
    if (item.tasa_iva === 'IVA_10') iva10 += base * 10 / 110;
    if (item.tasa_iva === 'IVA_5')  iva5  += base *  5 / 105;
  }

  return {
    subtotal: Math.round(subtotal),
    iva10:    Math.round(iva10),
    iva5:     Math.round(iva5),
    total:    Math.round(subtotal)
  };
}

module.exports = { TASAS_IVA, calcularMontos };
