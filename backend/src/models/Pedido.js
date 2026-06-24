const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Pedido', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    slot_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'listo', 'entregado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codigo_retiro: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    confirmado_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'pedidos',
    timestamps: false
  });
};
