'use strict';
const fs = require('fs');
const path = require('path');

const pg = require('pg');
delete pg.native;
const Sequelize = require('sequelize');

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config.json`)[env];
const db = {};
let sequelize;

if (config.use_env_variable) {
  const options = {};

  // let url;
  if (env === 'production') {
    options.logging = console.log;
    // url = process.env[config.use_env_variable]
  } else {
    options.logging = false;
    // url = process.env[config.use_env_variable] || 'postgres://postgres@localhost:5432/node_slack_development';
  }
  sequelize = new Sequelize(process.env[config.use_env_variable], options);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    const model = sequelize.import(path.join(__dirname, file));
    // console.log(path.join(__dirname, file));
    // console.log(model.name);
    // console.log(model);
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
