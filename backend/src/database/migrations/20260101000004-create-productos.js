'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      id:             { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      codigo_barras:  { type: Sequelize.STRING(50), allowNull: true, unique: true },
      nombre:         { type: Sequelize.STRING(150), allowNull: false },
      descripcion:    { type: Sequelize.TEXT, allowNull: true },
      categoria_id:   { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'categorias', key: 'id' } },
      unidad_medida:  { type: Sequelize.ENUM('unidad', 'kg', 'litro', 'paquete', 'docena'), defaultValue: 'unidad' },
      tasa_iva:       { type: Sequelize.ENUM('IVA_10', 'IVA_5', 'EXENTO'), defaultValue: 'IVA_10' },
      precio_costo:   { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
      precio_venta:   { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
      stock_actual:   { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      stock_minimo:   { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
      es_perecedero:  { type: Sequelize.BOOLEAN, defaultValue: false },
      imagen_url:     { type: Sequelize.STRING(255), allowNull: true },
      visible_online: { type: Sequelize.BOOLEAN, defaultValue: true },
      activo:         { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at:     { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('productos');
  }
};
