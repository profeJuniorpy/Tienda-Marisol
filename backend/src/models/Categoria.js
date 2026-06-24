const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Categoria', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'El nombre de la categoría es requerido' } }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'categorias',
    timestamps: false
  });
};
