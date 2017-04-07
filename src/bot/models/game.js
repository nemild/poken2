'use strict';

const GameUser = require('./gameUser');
const User = require('./user');
const SOFA = require('sofa-js');

function sendAll(bot, userToken, message, responses) {
  const controls = generateControls(responses);

  const responseEnvelope = {
    body: message
  };

  if (controls) {
    responseEnvelope.controls = controls;
  }

  bot.client.send(userToken, SOFA.Message(responseEnvelope));
}

function generateControls(responses) {
  const controls = [];
  if (!responses || responses.length === 0) {
    return null;
  }

  for (let i = 0, len = responses.length; i < len; i += 1) {
    const elem = responses[i];
    controls.push({ type: 'button', label: elem.label, value: elem.value });
  }

  return controls;
}

module.exports = function(sequelize, DataTypes) {
  const Game = sequelize.define('game', {
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        state: {
          type: DataTypes.ENUM('waiting', 'playing', 'completed'), // 'waiting' is before first start
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
      async sendMessageToAll(bot, message, responses = null) {
        let gameUsers;
        try {
          gameUsers = await GameUser.findAll({
            where: {
              gameId: this.id,
            },
            include: [User]
          });
        } catch (e) {
          console.error(e.stack);
        }

        for (let i = 0, len = gameUsers.length; i < len; i += 1) {
          const elem = gameUsers[i];
          sendAll(bot, elem.user.tokenIdee, message, responses);
        }
      },
      startGame() {
        // Ensure game can be started

        // Call start hand
        // Deduct from GameUser balance and put in pot
        // Tell everyone how much is in pot
        // Deal cards
      }
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
