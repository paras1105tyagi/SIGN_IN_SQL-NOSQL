const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sql'); // Sequelize config file

const SQLUser = sequelize.define('SQLUser', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING, allowNull: true },
  verificationTokenExpires: { type: DataTypes.DATE, allowNull: true },
  deletionToken: { type: DataTypes.STRING, allowNull: true },
  deletionTokenExpires: { type: DataTypes.DATE, allowNull: true }
});

module.exports = SQLUser;
