const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    codigo_barras: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del producto es requerido' } }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoria_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    unidad_medida: {
      type: DataTypes.ENUM('unidad', 'kg', 'litro', 'paquete', 'docena'),
      defaultValue: 'unidad'
    },
    tasa_iva: {
      type: DataTypes.ENUM('IVA_10', 'IVA_5', 'EXENTO'),
      defaultValue: 'IVA_10'
    },
    precio_costo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    precio_venta: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    stock_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    es_perecedero: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    imagen_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    visible_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'productos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
