'use strict';

module.exports = function(sequelize, DataTypes) {
  const Game = sequelize.define('game', {
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        state: {
          type: DataTypes.ENUM('waiting', 'playing', 'completed'),
          allowNull: false,
          defaultValue: 'waiting'
        },
        bigBlind: {
          type: DataTypes.DECIMAL,
          allowNull: false,
        },
        ante: {
                type: DataTypes.DECIMAL,
                allowNull: true,
        },
        maxBuyin: {
                type: DataTypes.DECIMAL,
                allowNull: false,
        }
  }, {
    hooks: { },
    indexes: [],
    instanceMethods: {
    },
    classMethods: {
      associate (models) {
        Game.hasMany(models.gameUser);
        Game.hasMany(models.hand);
      }
    }
  });

  return Game;
};
