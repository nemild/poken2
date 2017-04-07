/* eslint max-len: 0,no-unused-vars:0, no-empty:0 */

// Add max size, only applies to active players
const Bot = require('./lib/Bot');
const SOFA = require('sofa-js');
const _ = require('lodash');
const models = require('./bot/models');
const constants = require('./poker-constants.js');
const unit = require('ethjs-unit');
const allPokemon = require('./allPokemon.js');

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

  // TODO: For join, collect money and seat them - or return money if no space
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
        const balance = gameUser.balance;
        await gameUser.destroy();
        session.sendEth(balance);
        if (game && game.gameUsers.length === 1) {
          await game.destroy();
          reply(
            session,
            `Closed down empty game: ${game.name}`
          );
        }
      } catch (e) {
        console.error(e.stack);
      }
    }

    reply(
      session,
      'Session reset!'
    );
    return sendStartMessage(session);
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
    } else if (commandValue === 'join_existing') {
      // TODO:
      return await handleJoinListing(session);
    } else if (userState === 'joining' && commandValue.startsWith('join_')) {
      const matched = message.value.match(/^join_(.+)/);
      const gameName = matched && matched[1];

      if (!gameName) {
        return await handleJoinListing(session);
      }

      await joinOrCreateGame(session, user.id, gameName.toLowerCase(), null);
    } else if (userState === 'started' && commandValue.startsWith('max_buyin_')) {
      const matched = message.value.match(/^max_buyin_([.\d]+)/);
      const decimalValue = parseFloat(matched[1]);

      return await joinOrCreateGame(session, user.id, null, decimalValue);
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
        return null;
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

      try {
        await game.sendMessageToAll(
          bot,
          `${game.name}: A player bought in for ${collectedAmount}! There are now ${game.gameUsers.length} players in the game.`
        );
      } catch (e) {
        console.error(e.stack);
      }

      const numPlayers = game.gameUsers.length;
      if (numPlayers > 1) {
        // Start game
      }
    } else { // Refund if they shouldn't be sending us money
      session.sendEth(ethValue, function(session, error, result) {
        console.log(error);
      });
      reply(session, MSGS.other.noNeedForPayment);
    }
  } else if (userState === 'playing') {
  } else if (!userState) {
    return sendStartMessage(session);
  } else {
    return reply(
      session,
      MSGS.errors.unknown
    );
  }

  return null;
};

function sendStartMessage(session) {
  return reply(
    session,
    MSGS.startApp.welcome,
    [
      { label: 'Start a new game', value: 'start' },
      { label: 'Join existing', value: 'join_existing' }
    ]
  );
}

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

async function handleJoinListing(session) {
  let games;
  try {
    games = await Game.findAll({
      limit: 5,
      order: 'id DESC'
    });
  } catch (e) {
    console.error(e.stack);
  }
  if (games && games.length > 0) {
    const choices = _.map(games, function (game) {
      return { label: game.name, value: `join_${game.name}` };
    });

    session.set('userState', 'joining');
    return reply(
      session,
      'What game to join?',
      choices
    );
  }

  reply(
    session,
    'Sorry there are no games, create a game instead'
  );
  return sendStartMessage(session);
}

// Set buyin to null if existing game
async function joinOrCreateGame(session, userId, existingGameName, buyinAmount) {
  let game = null;
  let gameUser = null;
  try {
    if (existingGameName) {
      game = await Game.findOne({
        where: {
          name: existingGameName
        }
      });
      buyinAmount = game.maxBuyin; // eslint-disable-line no-param-reassign

      const gameUser = await GameUser.findOne({
        where: {
          userId,
          gameId: game.id
        }
      });

      if (gameUser) {
        return reply(session, 'Sorry, you\'re trying to join a game that you\'re already part of');
      }
    } else {
      const name = _.sample(allPokemon).toLowerCase();
      game = await Game.create({
        maxBuyin: buyinAmount,
        bigBlind: buyinAmount / 100,
        state: 'waiting',
        name // TODO: Make sure no collisions, 500 options so not going to worry for now
      });
      reply(session, `New game created: ${name}`);
    }

    let position;
    try {
      position = await game.getRandomOpenPosition();
    } catch (e) {
      console.error(e.stack);
    }

    if (!position) {
      return reply(session, MSGS.startApp.noSpaceRemaining);
    }

    gameUser = await GameUser.create({
      userId,
      gameId: game.id,
      state: 'spectating',
      position
    });
  } catch (e) {
    console.error(e.stack);
    console.error(e);
  }
  session.set('gameId', game.id);
  session.set('userState', 'spectating');

  session.requestEth(buyinAmount, 'for buyin');
  return null;
}
