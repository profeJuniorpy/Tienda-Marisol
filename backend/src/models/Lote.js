const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Lote', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    producto_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    numero_lote: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cantidad_inicial: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad_actual: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    proveedor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    costo_unitario: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'lotes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
