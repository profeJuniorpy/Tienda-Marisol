const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Venta', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    cliente_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    fecha_venta: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    subtotal: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    descuento: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    iva_10: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    iva_5: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    metodo_pago: {
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'billetera'),
      defaultValue: 'efectivo'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'completada', 'anulada'),
      defaultValue: 'completada'
    },
    factura_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'ventas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
