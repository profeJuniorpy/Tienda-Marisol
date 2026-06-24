// Genera código único de retiro para pedidos: MAR-XXXX (número secuencial del día)
async function generarCodigoRetiro(Pedido) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const totalHoy = await Pedido.count({
    where: {
      fecha_pedido: { [require('sequelize').Op.gte]: hoy }
    }
  });

  const numero = String(totalHoy + 1).padStart(4, '0');
  return `MAR-${numero}`;
}

module.exports = { generarCodigoRetiro };
