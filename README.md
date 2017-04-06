# Poken
A poker game on Token. 

### Key components
_Centralized_
1. Game rooms
2. Balances and Game Actions
3. Card Gameplay
4. Scoring System (using [][1]) 

_Decentralized_
5. Dapp Poker application

### Game Play
- User prompted whether to join a game room or create a new game
	- Create new game: (Can be public or private, needs a name)
- When joining, can start a game if more than 1 player
- Join and leave notification

##### Sample gameplay:
Welcome to Poken! Do you want to join an existing game room or create a new one? (Actions: Join, Create)

Create new game: Great, give your game room a name: SOME NAME
Join a game: Which game? (Actions: will show listing or let them type in a name)

You are the first person in this game room. Notify your friends that the game is running.

@abc just joined. Actions: Start game, exit room, wait

Choice: Start game
You got "Jack of Spades and King of Hearts" Actions: (Match/Check, Raise $set amount, Raise Custom, Fold)
@jb matched
@asda raised
Total pot: 

Flop: Cards a/b/c.
@jb checked
Total pot: 

Turn: 

River:

### Other Ideas
- Alternate token for use specifically with this game (and pre allocations)
- Need to make this fun and addictive (jokes, memes, random points)

### Data Model
**Game**

- name
- state
- bigBlind
- ante
- maximumBuyIn
- game_users (association)
	- user
	- balance
	- playing
	- active
	- state (sitting_out, playing, folded, all in)
	- state timestamp of when they hit each state (to order sidepot)

**Hand**

- state (ante_and_blinds, preFlop, flop, turn, river)
- pot
- sidePot (0 to many)
- bigblind
- littleblind
- dealer


**Action**

- user (assocation)
- game (association)
- action
- amount
- number: auto incrementing integer
- time_limit

**User**

- username
- address

[1]:	https://github.com/goldfire/pokersolver "PokerSolver"
