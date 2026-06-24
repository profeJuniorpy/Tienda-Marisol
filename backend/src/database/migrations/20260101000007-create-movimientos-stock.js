'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_stock', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      producto_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'productos', key: 'id' } },
      lote_id:         { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      tipo:            { type: Sequelize.ENUM('entrada', 'salida', 'ajuste', 'merma'), allowNull: false },
      cantidad:        { type: Sequelize.INTEGER, allowNull: false },
      stock_anterior:  { type: Sequelize.INTEGER, allowNull: false },
      stock_nuevo:     { type: Sequelize.INTEGER, allowNull: false },
      motivo:          { type: Sequelize.STRING(200), allowNull: true },
      referencia_id:   { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      referencia_tipo: { type: Sequelize.ENUM('venta', 'compra', 'ajuste', 'pedido'), allowNull: true },
      usuario_id:      { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      created_at:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('movimientos_stock');
  }
};
