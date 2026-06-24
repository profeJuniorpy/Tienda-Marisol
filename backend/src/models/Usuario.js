const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
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
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('admin', 'vendedor'),
      allowNull: false,
      defaultValue: 'vendedor'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'usuarios',
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

  Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  Usuario.beforeCreate(async (usuario) => {
    if (usuario.password_hash && !usuario.password_hash.startsWith('$2')) {
      usuario.password_hash = await bcrypt.hash(usuario.password_hash, 12);
    }
  });

  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password_hash') && !usuario.password_hash.startsWith('$2')) {
      usuario.password_hash = await bcrypt.hash(usuario.password_hash, 12);
    }
  });

  return Usuario;
};
