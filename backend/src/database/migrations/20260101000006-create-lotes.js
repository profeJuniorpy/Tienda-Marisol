'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lotes', {
      id:                { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      producto_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'productos', key: 'id' } },
      numero_lote:       { type: Sequelize.STRING(50), allowNull: true },
      cantidad_inicial:  { type: Sequelize.INTEGER, allowNull: false },
      cantidad_actual:   { type: Sequelize.INTEGER, allowNull: false },
      fecha_vencimiento: { type: Sequelize.DATEONLY, allowNull: true },
      fecha_ingreso:     { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.literal('CURRENT_DATE') },
      proveedor_id:      { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'proveedores', key: 'id' } },
      costo_unitario:    { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      activo:            { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:        { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('lotes', ['producto_id', 'fecha_vencimiento', 'cantidad_actual'], {
      name: 'idx_lote_vencimiento'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('lotes');
  }
};
