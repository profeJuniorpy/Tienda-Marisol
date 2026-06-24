const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Alerta', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.ENUM('vencimiento', 'stock_minimo', 'pedido_nuevo'),
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    lote_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    pedido_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'alertas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
