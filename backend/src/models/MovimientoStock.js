const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MovimientoStock', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    producto_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    lote_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'merma'),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_anterior: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_nuevo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivo: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    referencia_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'ID de venta, compra o ajuste origen'
    },
    referencia_tipo: {
      type: DataTypes.ENUM('venta', 'compra', 'ajuste', 'pedido'),
      allowNull: true
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'movimientos_stock',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
