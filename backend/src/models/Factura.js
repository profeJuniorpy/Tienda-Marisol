const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Factura', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    venta_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    },
    numero_comprobante: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('factura', 'nota_credito', 'nota_debito', 'contingencia'),
      defaultValue: 'factura'
    },
    estado_sifen: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'contingencia'),
      defaultValue: 'pendiente'
    },
    cdc: {
      type: DataTypes.STRING(44),
      allowNull: true
    },
    xml_de: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pdf_kude_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_emision: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ruc_cliente: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    nombre_cliente: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    tableName: 'facturas',
    timestamps: false
  });
};
