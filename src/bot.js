/* eslint max-len: 0,no-unused-vars:0 */

// Add max size, only applies to active players
const Bot = require('./lib/Bot');
const SOFA = require('sofa-js');
const _ = require('lodash');
const models = require('./bot/models');
const constants = require('./poker-constants.js');
const unit = require('ethjs-unit');

const MSGS = constants.MSGS;
const NUMBER_TEXT_MAP = constants.NUMBER_TEXT_MAP;

const sequelize = models.sequelize;
const User = models.user;
const Game = models.game;
const GameUser = models.gameUser;
const Hand = models.hand;
const Pot = models.pot;

const bot = new Bot();

bot.onEvent = async function(session, message) {
  const tokenIdee = session.get('tokenId');
  const userState = session.get('userState');
  const active = session.get('active');
  const userRequest = message.body && message.body.toLowerCase();
  const gameId = session.get('gameId') && parseInt(session.get('gameId'), 10);
  const commandValue = message && message.content && message.content.value;
  const ethValue = message && message.ethValue;

  console.log('--------------- New Request ----------------');
  console.log(`commandValue: ${commandValue}`);
  console.log(`ethValue: ${ethValue}`);
  console.log(`userRequest: ${userRequest}`);

  console.log(`gameId: ${gameId}`);
  console.log(`userState: ${userState}`);

  let game = null;
  let gameUser = null;

  if (gameId) {
    try {
      game = await Game.findOne({
        where: {
          id: gameId,
        },
        include: [{ model: GameUser, include: [User] }]
      });
      console.log(JSON.stringify(game, null, 2));
      console.log(`Loaded Game Id: ${game.id}`);
    } catch (error) {
      console.error(error);
    }
  }
  let user = null;
  try {
    user = await User.findOrCreate({ where: { tokenIdee } });
    if (user && user[0]) {
      user = user[0];
    }
  } catch (e) {
    console.error(e.stack);
  }

  if (user && game) {
    try {
      gameUser = await GameUser.findOne({
        gameId,
        userId: user.id
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

  if (message.body && (userRequest === 'restart' || userRequest === 'leave')) {
    // TODO: Cash out
    session.set('userState', null);
    session.set('gameId', null);
    session.set('active', false);

    if (gameUser) {
      try {
        console.log('DESTROYED');
        await gameUser.destroy();
        if (game && game.gameUsers.length === 1) {
          await game.destroy();
        }
      } catch (e) {
        console.error(e.stack);
      }
    }

    return reply(
      session,
      `Session reset! ${MSGS.startApp.welcome}`,
      [
        { label: 'Start a new game', value: 'start' },
        { label: 'Join existing', value: 'join_existing' }
      ]
    );
  } else if (message.type === 'Command') {
    if (commandValue === 'start') { // TODO: Make sure not in a game
      session.set('userState', 'started');

      return reply(
        session,
        MSGS.startApp.setMaxBuyin,
        [
          { label: '0.01', value: 'max_buyin_0.01' },
          { label: '0.1', value: 'max_buyin_0.1 ' },
          { label: '1', value: 'max_buyin_1' },
          { label: '10', value: 'max_buyin_10' }
        ]
      );
    } else if (userState === 'started' && commandValue.startsWith('max_buyin_')) {
      const matched = message.value.match(/^max_buyin_([.\d]+)/);
      const decimalValue = parseFloat(matched[1]);

      let newGame = null;
      let gameUser = null;
      try {
        newGame = await Game.create({
          maxBuyin: decimalValue,
          bigBlind: decimalValue / 100,
          state: 'waiting'
        });

        gameUser = await GameUser.create({
          userId: user.id,
          gameId: newGame.id,
          state: 'spectating'
        });
        console.log(JSON.stringify(gameUser, null, 2));
      } catch (e) {
        console.error(e.stack);
        console.error(e);
      }
      session.set('gameId', newGame.id);
      session.set('userState', 'spectating');

      session.requestEth(decimalValue, 'for buyin');
    } else if (userState === 'spectating') {

    }
  } else if (message.type === 'Payment') {
    if (userState === 'spectating') {
      const maximumBuyin = game.maxBuyin;
      const minimumBuyin = maximumBuyin / 100;
      let collectedAmount = null;

      if (ethValue < minimumBuyin) {
        session.sendEth(ethValue);
        reply(session, MSGS.startApp.buyin.belowMinimum(minimumBuyin));
        return;
      } else if (ethValue > maximumBuyin) {
        session.sendEth(ethValue - maximumBuyin);
        reply(session, MSGS.startApp.buyin.aboveMaximum);
        collectedAmount = maximumBuyin;
      } else {
        session.reply(MSGS.startApp.buyin.simpleSuccess(ethValue));
        collectedAmount = ethValue;
      }
      session.set('userState', 'playing');
      session.set('balance', collectedAmount);

      try {
        await gameUser.update({
          balance: collectedAmount
        });
      } catch (e) {
        console.error(e.stack);
      }

      // Reload game in case changes
      try {
        game = await Game.findOne({
          where: {
            id: gameId,
          },
          include: [{ model: GameUser, include: [User] }]
        });
      } catch (error) {
        console.error(error);
      }
      console.log(JSON.stringify(game, null, 2));

      try {
        await game.sendMessageToAll(bot, `A player bought in for ${collectedAmount}!`);
      } catch (e) {
        console.error(e.stack);
      }
    } else { // Refund if they shouldn't be sending us money
      session.sendEth(ethValue, function(session, error, result) {
        console.log(error);
      });
      reply(session, MSGS.other.noNeedForPayment);
    }
  } else if (userState === 'playing') {
    if (true) {

    }

  } else if (!userState) {
    return reply(
      session,
      MSGS.startApp.welcome,
      [
        { label: 'Start a new game', value: 'start' },
        { label: 'Join existing', value: 'join_existing' }
      ]
    );
  } else {
    return reply(
      session,
      MSGS.errors.unknown
    );
  }
};

function goToNextPlayer(session, game) {
  // TODO: message next player and switch player
}

async function checkToStartGame(session, game) {
  if (game && game.state === 'waiting') {
    try {
      return await game.sendMessageToAll(
        bot,
        MSGS.startApp.promptStartGame,
        [
          { label: 'Start the game!', value: 'start_game' },
          { label: 'Wait for others...', value: 'wait_to_start' }
        ]
      );
    } catch (e) {
      console.error(e.stack);
      return null;
    }
  }

  return null;
}

// Optional sendOptions function
// Optional message
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

function reply(session, message, responses) {
  const controls = generateControls(responses);

  const responseEnvelope = {
    body: message
  };

  if (controls) {
    responseEnvelope.controls = controls;
  }

  session.reply(SOFA.Message(responseEnvelope));
}

