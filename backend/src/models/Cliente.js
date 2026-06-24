const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre es requerido' } }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Email inválido' } }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ruc: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'clientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    },
    scopes: {
      conPassword: { attributes: {} }
    }
  });

  Cliente.prototype.verificarPassword = function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  Cliente.beforeCreate(async (cliente) => {
    if (cliente.password_hash && !cliente.password_hash.startsWith('$2')) {
      cliente.password_hash = await bcrypt.hash(cliente.password_hash, 12);
    }
  });

  Cliente.beforeUpdate(async (cliente) => {
    if (cliente.changed('password_hash') && !cliente.password_hash.startsWith('$2')) {
      cliente.password_hash = await bcrypt.hash(cliente.password_hash, 12);
    }
  });

  return Cliente;
};
