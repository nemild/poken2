/* eslint no-tabs: 0 */
const _ = require('lodash');

// Remaining
// Who should be betting
// What's bet so far, and actual game play

class PokerGame {
	// const STATES = [ 'STARTED', 'FLOPPED', 'TURNED', 'RIVERED', 'COMPLETE' ];
	constructor (numPlayers, state) {
		if (state) {
			if(!state.shuffledCards || !state.numPlayers || !state.state) {
				throw new Error('could not load state');
			}
			this.shuffledCards = state.shuffledCards;
			this.numPlayers = state.numPlayers;
			this.state = state.state;
			this.allCards = state.allCards;
		}
		else {
			if (numPlayers < 2) {
				throw new Error("Not enough players");
			}

			this.shuffledCards = this.generateCards();
			this.numPlayers = numPlayers;
			this.allCards = _.clone(this.shuffledCards);
			this.state = null;
			console.log(this.shuffledCards);
		}
	}

	// For serialization
	getState() {
		return {
			shuffledCards: this.shuffledCards,
			state: this.state,
			numPlayers: this.numPlayers,
			allCards: this.allCards
		}
	}

	generateCards() {
		let cards = [];
		const baseCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		const suites = ['s', 'h', 'c', 'd'];

		for (let i = 0, len = suites.length; i < len; i += 1) {
			const elemSuite = suites[i];

			for (let j = 0, len = baseCards.length; j < len; j += 1) {
				const elemCards = baseCards[j];
				cards.push(elemCards + elemSuite);
			}
		}
		cards = _.shuffle(cards);
		return cards;
	}

	toGraphicalCard(card) {
		return card.replace(/s/, '♠️').replace(/h/, '♥️').replace(/c/, '♣️c').replace(/d/, '♦️');
	}

	// Returns
	startGame() {
		const initialCards = [];
		for (let i = 0; i < this.numPlayers; i += 1) {
			initialCards.push([]);
		}

		for (let i = 0; i < 2; i += 1) {
			for (let j = 0; j < this.numPlayers; j += 1) {
				const index = j + (this.numPlayers * i);
				initialCards[j].push(this.shuffledCards[index]);
			}
		}
		this.shuffledCards.splice(0, this.numPlayers * 2);
		this.state = 'STARTED';

		return initialCards;
	}

	getFlop() {
		if (this.state != 'STARTED') {
			throw new Error('Can\'t flop');
		}

		const flop = this.shuffledCards.splice(0, 4);
		flop.shift();
		this.state = 'FLOPPED';

		return flop;
	}

	getTurn() {
		if (this.state != 'FLOPPED') {
			throw new Error('Can\'t turn');
		}

		const turnCard = this.shuffledCards.shift();
		this.state = 'TURNED';

		return turnCard;
	}

	getRiver() {
		if (this.state != 'TURNED') {
			throw new Error('Can\'t river');
		}

		const riverCard = this.shuffledCards.shift();
		this.state = 'RIVERED';

		return riverCard;
	}
}

module.exports = PokerGame;
