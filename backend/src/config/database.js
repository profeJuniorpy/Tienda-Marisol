require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marisol_db',
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',
    logging:  false,
    define: {
      underscored:    true,
      freezeTableName: false,
      timestamps:     true,
      createdAt:      'created_at',
      updatedAt:      'updated_at'
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'marisol_test',
    host:     process.env.DB_HOST || '127.0.0.1',
    dialect:  'mysql',
    logging:  false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',
    logging:  false,
    dialectOptions: { ssl: { rejectUnauthorized: false } },
    define: {
      underscored:    true,
      freezeTableName: false,
      timestamps:     true,
      createdAt:      'created_at',
      updatedAt:      'updated_at'
    }
  }
};
