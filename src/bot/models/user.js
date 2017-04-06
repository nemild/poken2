'use strict';

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    tokenIdee: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    hooks: {},
    indexes: [],
    instanceMethods: {
    },
    classMethods: {
      associate (models) {
        User.hasMany(models.gameUser);
      }
    }
  });

  return User;
};
