const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PickupSlot', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    capacidad_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    pedidos_activos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'pickup_slots',
    timestamps: false
  });
};
