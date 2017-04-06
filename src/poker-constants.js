module.exports.MSGS = {
  errors: {
    unknown: 'Sorry, I didn\'t understand that. You can always type \'restart\' to start again'
  },
  startApp: {
    welcome: 'Welcome to Poken: poker on Token! Do you want to start a new game or join an existing one? (And remember you can say \'restart\' at anytime to start over)',
    setMaxBuyin: 'What do you want the max buy in to be?',
    getBuyin(session, minBuyin, maxBuyin) {
      session.reply(`Great! Here's a payment request for the full amount. You can also send in any value above ${minBuyin}.`);
      session.requestEth(maxBuyin, 'to buy in at the maximum amount');
    },
    buyin: {
      belowMinimum(minBuyin) {
        return `Sorry, that wasn't the correct amount. You must send at least ${minBuyin} ether`;
      },
      aboveMaximum: 'That was above the maximum buyin, so I\'m refunding you the extra. Now you\'re in the game',
      simpleSuccess(balance) {
        return `Great, you've been added to the table, and your current balance is ${balance}.`;
      }
    }
  },
  dealerActions: {
    flop(cards) {
      let cardText = '';
      for (let i = 0, len = cards.length; i < len; i += 1) {
        const elem = cards[i];
        if (cardText !== '') {
          cardText += ', ';
        }
        cardText += elem;
      }
      return `Dealing hand. The flop is: \n ${cardText} `;
    },
    turn(card) {
      return `The turn card is: \n ${card}. Full hand is: `;
    },
    river(card) {
      return `Dealing hand. The river card is: \n ${card}. Full hand is: `;
    }
  },
  other: {
    noNeedForPayment: 'Sorry, you shouldn\'t be sending me money, I refunded what you sent me excluding transaction fees'
  }
};

module.exports.NUMBER_TEXT_MAP = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelth',
  13: 'thirteenth',
  14: 'fourteenth',
  15: 'fifteenth',
  16: 'sixteenth',
  17: 'seventeenth',
  18: 'eighteenth',
  19: 'nineteenth',
  20: 'twentieth',
  21: 'twenty-first',
  22: 'twenty-second'
};
