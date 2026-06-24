'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compras', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      proveedor_id:    { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'proveedores', key: 'id' } },
      usuario_id:      { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'usuarios', key: 'id' } },
      fecha_compra:    { type: Sequelize.DATEONLY, allowNull: false },
      numero_factura:  { type: Sequelize.STRING(50), allowNull: true },
      total:           { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0.00 },
      estado:          { type: Sequelize.ENUM('pendiente', 'recibida', 'cancelada'), defaultValue: 'recibida' },
      observaciones:   { type: Sequelize.TEXT, allowNull: true },
      created_at:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('detalle_compras', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      compra_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'compras', key: 'id' } },
      producto_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'productos', key: 'id' } },
      lote_id:         { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      cantidad:        { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      subtotal:        { type: Sequelize.DECIMAL(14, 2), allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('detalle_compras');
    await queryInterface.dropTable('compras');
  }
};
