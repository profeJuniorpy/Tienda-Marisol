const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('DetalleVenta', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    venta_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    lote_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalle_ventas',
    timestamps: false
  });
};
