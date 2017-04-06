const MAX_TIME = 30;

const models = require('./bot/models');
const User = models.user;
const Game = models.game;
const GameUser = models.gameUser;
const Hand = models.hand;
const Pot = models.pot;


module.exports = function runCron() {

}

function async tick(argument) {
  // For each game
  const games = await Game.all({

  });
}
