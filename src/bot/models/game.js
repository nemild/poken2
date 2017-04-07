/* eslint no-undef: 0, max-len: 0 */

'use strict';

const SOFA = require('sofa-js');
const _ = require('lodash');
const PokerGame = require('../../poker_game');

function sendToUser(bot, userToken, message, responses) {
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
      sendToUser(bot, userToken, message, responses) {
        sendToUser(bot, userToken, message, response);
      },
      async getRandomOpenPosition() {
        let gameUsers;
        const GameUser = sequelize.models.gameUser;
        const User = sequelize.models.user;

        try {
          gameUsers = await GameUser.findAll({
            where: {
              gameId: this.id,
              state: 'playing'
            },
            include: [User]
          });
        } catch (e) {
          console.error(e.stack);
        }

        const currentPositions = _.map(gameUsers, 'position') || [];
        return _.sample(_.difference(_.range(9), currentPositions));
      },
      async startNewHand() { // warning, destructive so only call if you want to start a new hand and delete old one
        try {
          const Hand = sequelize.models.hand;
          const GameUser = sequelize.models.gameUser;

          const gameUsers = await GameUser.findAll({
            where: {
              gameId: self.id,
              status: 'playing'
            },
            order: 'position ASC',
          });

          let dealerPosition = 0;
          const existingHand = await Hand.findOne({
            where: {
              gameId: self.id
            }
          });

          if (existingHand) {
            dealerPosition = (existingHand.dealerPosition + 1) % gameUsers.length;
            await existingHand.destroy();
          }

          const hand = await Hand.create({
            gameId: self.id,
            bigBlind: this.bigBlind,
            smallBlind: this.bigBlind / 2,
            state: 'anteAndBlinds',
            dealerPosition,
            pokerCardStateData: (new PokerGame( gameUsers.length, null )).getState()
          });

          return hand;
        } catch (e) {
          console.error(e.stack);
        }

        return null;
      },
      async handRunning() {
        try {
          const existingHand = await Hand.findOne({
            where: {
              gameId: self.id
            }
          });

          return !!existingHand;
        } catch (e) {
          console.error(e.stack);
        }
        return null;
      },
      async sendMessageToAll(bot, message, responses = null) {
        let gameUsers;
        const GameUser = sequelize.models.gameUser;
        const User = sequelize.models.user;

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
          sendToUser(bot, elem.user.tokenIdee, message, responses);
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
