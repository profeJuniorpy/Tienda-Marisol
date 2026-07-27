const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env      = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const DEFINE_OPTS = {
  underscored:     true,
  freezeTableName: false,
  timestamps:      true,
  createdAt:       'created_at',
  updatedAt:       'updated_at'
};

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

// Detecta el dialecto según el prefijo de la URL (postgres:// o mysql://)
const dialectFromUrl = dbUrl
  ? (dbUrl.startsWith('postgres') ? 'postgres' : 'mysql')
  : null;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect:        dialectFromUrl,
      logging:        false,
      define:         DEFINE_OPTS,
      pool:           { max: 5, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: { ssl: { rejectUnauthorized: false } }
    })
  : new Sequelize(
      process.env.DB_NAME     || process.env.MYSQLDATABASE || dbConfig.database,
      process.env.DB_USER     || process.env.MYSQLUSER     || dbConfig.username,
      process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || dbConfig.password,
      {
        ...dbConfig,
        host: process.env.DB_HOST || process.env.MYSQLHOST || dbConfig.host,
        port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT) || dbConfig.port || 3306
      }
    );

// ─── Importar modelos ────────────────────────────────────────────────────────
const Usuario         = require('./Usuario')(sequelize);
const Cliente         = require('./Cliente')(sequelize);
const Categoria       = require('./Categoria')(sequelize);
const Producto        = require('./Producto')(sequelize);
const Lote            = require('./Lote')(sequelize);
const MovimientoStock = require('./MovimientoStock')(sequelize);
const Proveedor       = require('./Proveedor')(sequelize);
const Compra          = require('./Compra')(sequelize);
const DetalleCompra   = require('./DetalleCompra')(sequelize);
const Venta           = require('./Venta')(sequelize);
const DetalleVenta    = require('./DetalleVenta')(sequelize);
const Factura         = require('./Factura')(sequelize);
const PickupSlot      = require('./PickupSlot')(sequelize);
const Pedido          = require('./Pedido')(sequelize);
const DetallePedido   = require('./DetallePedido')(sequelize);
const Alerta          = require('./Alerta')(sequelize);

// ─── Asociaciones ────────────────────────────────────────────────────────────

// Producto ↔ Categoria
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Producto ↔ Lote
Producto.hasMany(Lote, { foreignKey: 'producto_id', as: 'lotes' });
Lote.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Proveedor ↔ Lote
Proveedor.hasMany(Lote, { foreignKey: 'proveedor_id', as: 'lotes' });
Lote.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Producto ↔ MovimientoStock
Producto.hasMany(MovimientoStock, { foreignKey: 'producto_id', as: 'movimientos' });
MovimientoStock.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Proveedor ↔ Compra
Proveedor.hasMany(Compra, { foreignKey: 'proveedor_id', as: 'compras' });
Compra.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Usuario ↔ Compra
Usuario.hasMany(Compra, { foreignKey: 'usuario_id', as: 'compras' });
Compra.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Compra ↔ DetalleCompra
Compra.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'compra_id', as: 'compra' });

// Producto ↔ DetalleCompra
Producto.hasMany(DetalleCompra, { foreignKey: 'producto_id', as: 'detallesCompra' });
DetalleCompra.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Usuario ↔ Venta
Usuario.hasMany(Venta, { foreignKey: 'usuario_id', as: 'ventas' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Cliente ↔ Venta
Cliente.hasMany(Venta, { foreignKey: 'cliente_id', as: 'ventas' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Venta ↔ DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });

// Producto ↔ DetalleVenta
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'detallesVenta' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Venta ↔ Factura
Venta.hasOne(Factura, { foreignKey: 'venta_id', as: 'factura' });
Factura.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });

// Cliente ↔ Pedido
Cliente.hasMany(Pedido, { foreignKey: 'cliente_id', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// PickupSlot ↔ Pedido
PickupSlot.hasMany(Pedido, { foreignKey: 'slot_id', as: 'pedidos' });
Pedido.belongsTo(PickupSlot, { foreignKey: 'slot_id', as: 'slot' });

// Pedido ↔ DetallePedido
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });

// Producto ↔ DetallePedido
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id', as: 'detallesPedido' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

module.exports = {
  sequelize,
  Sequelize,
  Usuario,
  Cliente,
  Categoria,
  Producto,
  Lote,
  MovimientoStock,
  Proveedor,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  Factura,
  PickupSlot,
  Pedido,
  DetallePedido,
  Alerta
};
