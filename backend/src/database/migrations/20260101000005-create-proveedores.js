'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proveedores', {
      id:         { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      nombre:     { type: Sequelize.STRING(150), allowNull: false },
      ruc:        { type: Sequelize.STRING(20), allowNull: true },
      telefono:   { type: Sequelize.STRING(30), allowNull: true },
      email:      { type: Sequelize.STRING(150), allowNull: true },
      direccion:  { type: Sequelize.TEXT, allowNull: true },
      activo:     { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('proveedores');
  }
};
