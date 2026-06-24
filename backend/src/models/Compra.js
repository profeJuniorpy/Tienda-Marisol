const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Compra', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    proveedor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    fecha_compra: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    numero_factura: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'recibida', 'cancelada'),
      defaultValue: 'recibida'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'compras',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
