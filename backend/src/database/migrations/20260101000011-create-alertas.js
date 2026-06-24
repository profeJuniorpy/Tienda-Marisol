'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alertas', {
      id:          { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      tipo:        { type: Sequelize.ENUM('vencimiento', 'stock_minimo', 'pedido_nuevo'), allowNull: false },
      producto_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      lote_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      pedido_id:   { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      mensaje:     { type: Sequelize.TEXT, allowNull: false },
      leida:       { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('alertas');
  }
};
