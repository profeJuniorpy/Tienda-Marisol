'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias', {
      id:          { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      nombre:      { type: Sequelize.STRING(80), allowNull: false, unique: true },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      activo:      { type: Sequelize.BOOLEAN, defaultValue: true }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('categorias');
  }
};
