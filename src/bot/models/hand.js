/* eslint no-undef: 0, no-unused-vars:0, max-len:0, no-plusplus:0, no-constant-condition:0 */

'use strict';

const Game = require('./game');
const GameUser = require('./gameUser');

async function getNextPlayer(GameUser) {
  // who is next player and what do they have to bid, else null

  try {
    await GameUser.findAll({
      where: {
        gameId: this.id
      }
    });
  } catch (e) {
    console.error(e.stack);
  }

  // { [gameUserId]: { state: 1, potAmount: 100 } }
  return null;
}

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
    waitingGameUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: GameUser, key: 'waitingGameUserId' }
      },
    pokerCardStateData: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
    gameUserStatuses: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
      },
      dealerPosition: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      currentPosition: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      largestAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      bigBlind: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
      smallBlind: {
          type: DataTypes.INTEGER,
          allowNull: true
      }
  }, {
    hooks: { },
    indexes: [],
    instanceMethods: {
      nextCurrentPosition() {
        const currentMaxAmount = _.max(_.map(self.gameUserStatuses, 'potAmount'));
        const startPosition = this.currentPosition;
        const firstToActIndex = (this.dealerPosition + 1) % (SIZE);

        // MAKE SURE YOU CAN GO THROUGH ONCE

        while (true) {
          const nextGameUserStatus = gameUserStatuses[++this.currentPosition % gameUsers.length];
          if (nextGameUserStatus.status !== 'folded' && currentMaxAmount > nextGameUserStatus.potAmount) {
            return this.currentPosition;
          } else if (startPosition === this.currentPosition) {
            return null;
          }
        }
      },
      totalPotSize() {
        if (
          !this.gameUserStatuses || this.gameUserStatuses.length === 0
        ) {
          return 0;
        }
        return _.reduce(this.gameUserStatuses, function(sum, n) {
          return sum + n.potAmount;
        });
      },
      async handleAction(session, gameUserId, action, amount) {
        if (waitingGameUserId !== gameUserId) {
          return session.reply('Sorry, it\'s not your turn');
        }

        // Record and execute next action

      },
      async nextAction(bot) {
        let gameUsers, game;
        const Game = sequelize.models.game;
        const User = sequelize.models.user;
        const GameUser = sequelize.models.gameUser;

        try {
          gameUsers = await GameUser.findAll({
            where: {
              gameId: self.gameId,
              status: 'playing'
            },
            order: 'position ASC',
            include: [User]
          });

          game = await Game.findOne({
            where: {
              id: self.gameId
            }
          });
        } catch (e) {
          console.error(e.stack);
        }
        // Decision based on: gameUserStatuses, current position, game size
        if (gameUserStatuses.length === 0) {
          // set current position
          // get blinds
          // go to the first person who makes a choice, message, etc.
          //
          //
          const dealerIndex = _.findIndex(gameUsers, function(o) { return o.position === this.dealerPosition; });
          this.currentPosition = (dealerIndex + 3) % gameUsers.length;
          try {
            await this.save();
          } catch (e) {
            console.error(e.stack);
          }

          const smallBlindGameUser = gameUsers[(dealerIndex + 1) % gameUsers.length];
          const bigBlindGameUser = gameUsers[(dealerIndex + 2) % gameUser.length];

          if ((bigBlindGameUser.balance - this.bigBlind) < 0) {
            // kick out, increment to next one
            // check game
          } else if ((smallBlindGameUser.balance - this.bigBlind) < 0) {
            // kick out, increment to next one
            // check game
          }

          // Decrement balances
          bigBlindGameUser.balance -= this.bigBlind;
          smallBlindGameUser.balance -= this.smallBlind;

          try {
            await Promise.all([
              bigBlindGameUser.save(),
              smallBlindGameUser.save()
            ]);
          } catch (e) {
            console.error(e.stack);
          }

          for (let i = 0, len = gameUsers.length; i < len; i += 1) {
            const gameUser = gameUsers[i];
            gameUserStatuses[gameUserId] = { status: 'playing', potAmount: 0 };
          }
          gameUserStatuses[bigBlindGameUser.id].potAmount += this.bigBlind;
          gameUserStatuses[smallBlindGameUser.id].potAmount += this.smallBlind;
          try {
            await this.save();
          } catch (e) {
            console.error(e.stack);
          }

          this.game.sendMessageToAll(bot, MSGS.hand.start(totalPotSize(), this.currentPosition));
          const smallRaise = _.min(this.bigBlind, currentGameUser.balance - this.bigBlind);

          // Message with options
          const currentGameUser = gameUsers[currentPosition];
          this.game.sendToUser(bot, gameUsers[currentPosition].user.tokenIdee, MSGS.handAction, [
              { label: 'Fold', value: 'fold' },
              { label: 'Call', value: 'call' },
              { label: `Raise ${smallRaise}`, value: `raise_${smallRaise}` },
              { label: 'All In', value: `raise_${currentGameUser.balance}` }
          ]);
        } else {
          // increment current position, decide prompt, Deal, Message with options to one party or winner
        }
        // game.sendMessageToAll(bot, );

        const pokerGame = new PokerGame(gameUsers.length, self.pokerCardStateData);
        this.pokerCardStateData = pokerGame.getState();
        await this.save();

        pokerGame.startGame();
        pokerGame.toGraphicalCards(pokerGame.getFlop());
        pokerGame.toGraphicalCards(pokerGame.getTurn());
        pokerGame.toGraphicalCards(pokerGame.getRiver());
      }


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

// TODO: Handle response
// change balance
// move on to next
