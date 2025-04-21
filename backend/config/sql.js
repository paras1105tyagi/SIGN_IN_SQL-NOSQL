const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration
const sequelize = new Sequelize(
  process.env.SQL_DB,        // Database name
  process.env.SQL_USER,      // Username
  process.env.SQL_PASSWORD,  // Password
  {
    host: process.env.SQL_HOST || 'localhost',
    dialect: process.env.SQL_DIALECT || 'mysql',
    port: process.env.SQL_PORT || 3306,
    logging: console.log, // Set to false in production
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('SQL connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the SQL database:', err);
  });

module.exports = sequelize;
