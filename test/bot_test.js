const assert = require('assert');
const PokerGame = require('../poker_game');
var Hand = require('pokersolver').Hand;

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      const pokerGame = new PokerGame(3);
      const start = pokerGame.startGame();
      const flop = pokerGame.getFlop();
      const turn = pokerGame.getTurn();
      const river = pokerGame.getRiver();

      var hand1 = Hand.solve(['Ad', 'As', 'Jc', 'Th', '2d', '3c', 'Kd']);
      var hand2 = Hand.solve(['Ad', 'As', 'Jc', 'Th', '2d', 'Qs', 'Qd']);
      var winner = Hand.winners([hand1, hand2]); // hand2

      console.log(winner);
      // assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
