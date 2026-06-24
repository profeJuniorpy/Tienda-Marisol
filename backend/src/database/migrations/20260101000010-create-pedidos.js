'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pickup_slots', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      fecha:           { type: Sequelize.DATEONLY, allowNull: false },
      hora_inicio:     { type: Sequelize.TIME, allowNull: false },
      hora_fin:        { type: Sequelize.TIME, allowNull: false },
      capacidad_max:   { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
      pedidos_activos: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      activo:          { type: Sequelize.BOOLEAN, defaultValue: true }
    });

    await queryInterface.createTable('pedidos', {
      id:             { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      cliente_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'clientes', key: 'id' } },
      slot_id:        { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'pickup_slots', key: 'id' } },
      estado:         { type: Sequelize.ENUM('pendiente', 'confirmado', 'listo', 'entregado', 'cancelado'), defaultValue: 'pendiente' },
      total:          { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0.00 },
      notas:          { type: Sequelize.TEXT, allowNull: true },
      codigo_retiro:  { type: Sequelize.STRING(10), allowNull: true },
      confirmado_por: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      fecha_pedido:   { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_entrega:  { type: Sequelize.DATE, allowNull: true }
    });

    await queryInterface.createTable('detalle_pedidos', {
      id:              { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      pedido_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'pedidos', key: 'id' } },
      producto_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'productos', key: 'id' } },
      cantidad:        { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      subtotal:        { type: Sequelize.DECIMAL(14, 2), allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('detalle_pedidos');
    await queryInterface.dropTable('pedidos');
    await queryInterface.dropTable('pickup_slots');
  }
};
