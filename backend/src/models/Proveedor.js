const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Proveedor', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del proveedor es requerido' } }
    },
    ruc: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'proveedores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
