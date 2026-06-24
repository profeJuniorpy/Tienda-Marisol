'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id:          { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      usuario_id:  { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'usuarios', key: 'id' } },
      cliente_id:  { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      fecha_venta: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      subtotal:    { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0.00 },
      descuento:   { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0.00 },
      total:       { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0.00 },
      metodo_pago: { type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia', 'billetera'), defaultValue: 'efectivo' },
      estado:      { type: Sequelize.ENUM('pendiente', 'completada', 'anulada'), defaultValue: 'completada' },
      factura_id:  { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('detalle_ventas', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      venta_id:        { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'ventas', key: 'id' } },
      producto_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'productos', key: 'id' } },
      lote_id:         { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      cantidad:        { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      subtotal:        { type: Sequelize.DECIMAL(14, 2), allowNull: false }
    });

    await queryInterface.createTable('facturas', {
      id:                 { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      venta_id:           { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: 'ventas', key: 'id' } },
      numero_comprobante: { type: Sequelize.STRING(50), allowNull: true },
      tipo:               { type: Sequelize.ENUM('factura', 'nota_credito', 'nota_debito', 'contingencia'), defaultValue: 'factura' },
      estado_sifen:       { type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado', 'contingencia'), defaultValue: 'pendiente' },
      cdc:                { type: Sequelize.STRING(44), allowNull: true },
      xml_de:             { type: Sequelize.TEXT, allowNull: true },
      pdf_kude_url:       { type: Sequelize.STRING(255), allowNull: true },
      fecha_emision:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      ruc_cliente:        { type: Sequelize.STRING(20), allowNull: true },
      nombre_cliente:     { type: Sequelize.STRING(150), allowNull: true }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('facturas');
    await queryInterface.dropTable('detalle_ventas');
    await queryInterface.dropTable('ventas');
  }
};
