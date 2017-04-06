'use strict';

const Game = require('./game');

module.exports = function(sequelize, DataTypes) {
  const Hand = sequelize.define('hand', {
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Game, key: 'gameId' }
    },
    state: {
      type: DataTypes.ENUM('anteAndBlinds', 'preflop', 'flop', 'turn', 'river', 'complete'),
      allowNull: false,
    },
      bigblind: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        littleBlind: {
            type: DataTypes.INTEGER,
            allowNull: true,
          }
  }, {
    hooks: { },
    indexes: [],
    instanceMethods: {
    },
    classMethods: {
      associate (models) {
        Hand.belongsTo(models.game);
        Hand.hasMany(models.pot);
      }
    }
  });

  return Hand;
};
