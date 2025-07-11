const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.UserSettings = require('./userSettings')(sequelize, Sequelize.DataTypes);

// Add more models and associations here
// db.Material = require('./material')(sequelize, Sequelize.DataTypes);

module.exports = db;
