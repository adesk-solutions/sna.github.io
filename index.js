class Card {
    constructor(suit, rank) {
      this.suit = suit;
      this.rank = rank;
      this.currentPlayerIndex = 0;
    }
  
    toString() {
      return `[${this.rank}${this.suit[0]}]`;
    }
  }
  
  
  class Deck {
    constructor() {
      this.suits = ['Spades', 'Clubs', 'Hearts', 'Diamonds'];
      this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      this.cards = [];
  
      // Generate a standard deck of 52 cards
      for (let suit of this.suits) {
        for (let rank of this.ranks) {
          this.cards.push(new Card(suit, rank));
        }
      }
    }
  
    shuffle() {
      // Fisher-Yates shuffle algorithm
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
    }
  }
  
  const readline = require('readline');


  class CardGame {
    constructor() {
      this.deck = new Deck();
      this.grid = [];
      this.players = [[], []]; // Two players
      this.currentPlayerIndex = 0;

      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      this.initializeGrid();
      this.deck.shuffle();
      this.placeMiddleCard();
      this.distributeCards();
      
    }

    playGame() {
        this.displayGrid();
        this.playTurn();
      }

    playTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        console.log(`\nPlayer ${this.currentPlayerIndex + 1}'s turn:`);
        
        this.rl.question(`Please enter the index to place your card on the grid: `, (selectedCardIndex) => {
            if (selectedCardIndex >= 0 && selectedCardIndex < currentPlayer.length) {
                const playedCard = currentPlayer.splice(selectedCardIndex, 1)[0];
                this.placeCardInSpiral(playedCard);
                this.displayGrid(); // Show the updated grid
                this.currentPlayerIndex = 1 - this.currentPlayerIndex; // Switch to the other player
                this.playGame(); // Continue the game
              } else {
                console.log('Invalid card index. Please choose a valid card.');
                this.playTurn(); // Ask the same player again
              }
        });
      }
    
      placeCardInSpiral(card) {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
        let row = Math.floor(this.grid.length / 2);
        let col = Math.floor(this.grid[0].length / 2);
    
        while (card) {
            if (this.isValidPosition(row, col) && this.grid[row][col] === 'FaceDown') {
                this.grid[row][col] = card;
                card = null; // Card placed, exit loop
            }
    
            // Move to the next position in the spiral
            row += directions[this.currentPlayerIndex][0];
            col += directions[this.currentPlayerIndex][1];
    
            // Change direction when reaching the end of the spiral
            if (!this.isValidPosition(row, col) || this.grid[row][col] !== 'FaceDown') {
                row -= directions[this.currentPlayerIndex][0];
                col -= directions[this.currentPlayerIndex][1];
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
                row += directions[this.currentPlayerIndex][0];
                col += directions[this.currentPlayerIndex][1];
            }
        }
    }
    

    isValidPosition(row, col) {
        return row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length;
      }

  
    initializeGrid() {
      for (let i = 0; i < 5; i++) {
        this.grid[i] = [];
        for (let j = 0; j < 5; j++) {
          this.grid[i][j] = 'FaceDown';
        }
      }
    }
  
    placeMiddleCard() {
      const middleRowIndex = Math.floor(this.grid.length / 2);
      const middleColIndex = Math.floor(this.grid[0].length / 2);
      this.grid[middleRowIndex][middleColIndex] = this.deck.cards.pop();
    }
  
    distributeCards() {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 13; j++) {
          this.players[i].push(this.deck.cards.pop());
        }
      }
    }

    displayGrid() {
        for (let row of this.grid) {
            let rowString = '';
            for (let cell of row) {
              if (cell === 'FaceDown') {
                rowString += '[]';
              } else {
                rowString += cell.toString();
              }
            }
            console.log(rowString);
          }
        }    
      
  }
  
  // Example usage
const game = new CardGame();
game.playGame();

//game.playTurn();
//game.playTurn();
// Continue playing turns as needed
//game.displayGrid();

  // You can now access the game's grid and players array to display or manipulate the game state as needed.
//   console.log('Grid:', game.grid);
  console.log('Player 1 Cards:', game.players[0]);
  console.log('Player 2 Cards:', game.players[1]);
  