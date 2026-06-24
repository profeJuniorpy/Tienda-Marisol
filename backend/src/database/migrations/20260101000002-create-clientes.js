'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id:            { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      nombre:        { type: Sequelize.STRING(100), allowNull: false },
      email:         { type: Sequelize.STRING(150), allowNull: false, unique: true },
      telefono:      { type: Sequelize.STRING(20), allowNull: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      ruc:           { type: Sequelize.STRING(20), allowNull: true },
      activo:        { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:    { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at:    { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('clientes');
  }
};
