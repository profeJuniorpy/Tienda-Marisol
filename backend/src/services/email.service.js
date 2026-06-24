'use strict';

const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

function crearTransporte() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });
}

/**
 * Envía el email de confirmación de pedido al cliente.
 * Si EMAIL_USER no está configurado, solo registra en el log (modo desarrollo).
 */
async function enviarConfirmacionPedido({ pedido, cliente, slot, detalles }) {
  if (!process.env.EMAIL_USER) {
    logger.info(`EMAIL [simulado] → ${cliente.email}: Pedido #${pedido.id} — código ${pedido.codigo_retiro}`);
    return;
  }

  const fechaSlot = new Date(slot.fecha).toLocaleDateString('es-PY', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const itemsHtml = detalles.map(d => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${d.nombre || 'Producto'}</td>
      <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f0f0f0">${d.cantidad}</td>
      <td style="padding:6px 0;text-align:right;border-bottom:1px solid #f0f0f0">
        ${new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(d.subtotal)}
      </td>
    </tr>`).join('');

  const totalFormateado = new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', maximumFractionDigits: 0
  }).format(pedido.total);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#166534;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">Tienda Marisol</h1>
    <p style="color:#bbf7d0;margin:6px 0 0">Confirmación de pedido</p>
  </div>

  <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
    <p>Hola <strong>${cliente.nombre}</strong>,</p>
    <p>Tu pedido fue recibido. Podés pasar a retirarlo en el horario que seleccionaste:</p>

    <!-- Código de retiro -->
    <div style="background:#166534;color:white;text-align:center;padding:20px;border-radius:12px;margin:20px 0">
      <p style="margin:0 0 6px;font-size:13px;opacity:.8">Tu código de retiro</p>
      <p style="font-size:36px;font-weight:bold;letter-spacing:4px;margin:0">${pedido.codigo_retiro}</p>
    </div>

    <!-- Slot de retiro -->
    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;color:#6b7280">Retiro en tienda</p>
      <p style="margin:0;font-weight:bold">${fechaSlot}</p>
      <p style="margin:4px 0 0;color:#166534;font-weight:600">${slot.hora_inicio} – ${slot.hora_fin}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280">Mercado Nro. 1 — Coronel Oviedo, Caaguazú</p>
    </div>

    <!-- Detalle de productos -->
    <h3 style="margin:0 0 8px">Productos</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="color:#6b7280;font-size:12px">
          <th style="text-align:left;padding:4px 0">Producto</th>
          <th style="text-align:center;padding:4px 8px">Cant.</th>
          <th style="text-align:right;padding:4px 0">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px 0 0;font-weight:bold">TOTAL</td>
          <td style="padding:10px 0 0;text-align:right;font-weight:bold;color:#166534;font-size:16px">${totalFormateado}</td>
        </tr>
      </tfoot>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:#6b7280">
      El pago se realiza al momento del retiro. Si tenés alguna duda,
      contactanos al local del Mercado Nro. 1.
    </p>
  </div>
</body>
</html>`;

  try {
    const transporter = crearTransporte();
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || '"Tienda Marisol" <no-reply@marisol.com>',
      to:      cliente.email,
      subject: `Pedido confirmado · ${pedido.codigo_retiro} — Tienda Marisol`,
      html
    });
    logger.info(`EMAIL enviado → ${cliente.email} (pedido ${pedido.codigo_retiro})`);
  } catch (err) {
    logger.warn(`EMAIL falló para ${cliente.email}: ${err.message}`);
  }
}

module.exports = { enviarConfirmacionPedido };
