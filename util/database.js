const Sequelize = require('sequelize');

const sequelize = new Sequelize('first', 'root', 'ismail2003', {
  host: 'localhost',
  dialect: 'mysql',
  dialectModule: require('mysql2'), 
});

module.exports = sequelize;
