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
      this.playScoringAsYouGo = false; // Default value
      this.dealerIndex = 0; // Default value

      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      this.initializeGrid();
      this.deck.shuffle();
      this.placeMiddleCard();
      this.distributeCards();
      
    }

    askDealerPreference() {
      console.log('Who would you like as the dealer?');
      console.log('1- Player 1');
      console.log('2- Player 2');

      this.rl.question('Enter the number of your choice (1 or 2): ', (answer) => {
          if (answer === '1' || answer === '2') {
              this.dealerIndex = answer === '1' ? 0 : 1;
              this.currentPlayerIndex = this.dealerIndex === 0 ? 1 : 0; // Set initial currentPlayerIndex
              console.log(`\n *** Player ${this.dealerIndex + 1} is the dealer. ***`);
              if( this.playScoringAsYouGo ){
              console.log('\n *** Scoring as you go *** \n');
              }else{
              console.log('\n *** Scoring at the end *** \n');
              }
              this.displayGrid();
              this.playGame(); // Start the game if the choice is valid
          } else {
              console.log('Invalid choice. Please enter 1 or 2.');
              this.askDealerPreference(); // Ask the question again
          }
      });
  }

    askScoringPreference() {
      console.log('Which variant do you wish to play?');
      console.log('1- Scoring as you go');
      console.log('2- Scoring at the end');

      this.rl.question('Enter the number of your choice (1 or 2): ', (answer) => {
          if (answer === '1') {
              this.playScoringAsYouGo = true;
              this.askDealerPreference(); // Ask the dealer question                           
          } else if (answer === '2') {
              this.playScoringAsYouGo = false;
              this.askDealerPreference(); // Ask the dealer question                          
          } else {
              console.log('Invalid choice. Please enter 1 or 2.');
              this.askScoringPreference(); // Ask the question again
          }
      });
  }

  // socring starts   
      // Add these methods for scoring
      checkPairs(rowOrColumn) {
        const cards = rowOrColumn.filter(card => card !== 'FaceDown');
        const rankCount = {};
        let score = 0;
    
        for (const card of cards) {
            const rank = card.rank;
            rankCount[rank] = (rankCount[rank] || 0) + 1;
    
            if (rankCount[rank] === 2) {
                score += 2; // Pair
            } else if (rankCount[rank] === 3) {
                score += 6; // Prial
            } else if (rankCount[rank] === 4) {
                score += 12; // Double Pair Royal
            }
        }
    
        return score;
    }
    
    
    checkRuns(rowOrColumn) {
      const cards = rowOrColumn.filter(card => card !== 'FaceDown');
      let sortedCards = cards.sort((a, b) => this.deck.ranks.indexOf(a.rank) - this.deck.ranks.indexOf(b.rank));
      let score = 0;
  
      for (let i = 0; i < sortedCards.length - 2; i++) {
          if (this.deck.ranks.indexOf(sortedCards[i + 1].rank) === this.deck.ranks.indexOf(sortedCards[i].rank) + 1 &&
              this.deck.ranks.indexOf(sortedCards[i + 2].rank) === this.deck.ranks.indexOf(sortedCards[i + 1].rank) + 1) {
              score += 3; // Length of run
          }
      }
  
      return score;
  }
  
  //right but 1 1 0 0 1
//   checkFlush(rowOrColumn) {
//     const cards = rowOrColumn.filter(card => card !== 'FaceDown');
//     let score = 0;

//     if (cards.length >= 3) {
//         const suitsMap = new Map();
        
//         for (const card of cards) {
//             const suit = card.suit;
//             suitsMap.set(suit, (suitsMap.get(suit) || 0) + 1);
//         }

//         for (const count of suitsMap.values()) {
//             if (count >= 3 && count <= 5) {
//                 score += count;
//             }
//         }
//     }

//     return score;
// }

// checkFlush(rowOrColumn) {
//   const cards = rowOrColumn.filter(card => card !== 'FaceDown');
//   let score = 0;

//   if (cards.length >= 3) {
//       const suitsMap = new Map();

//       for (let i = 0; i < cards.length - 2; i++) {
//           const currentCard = cards[i];
//           const suit = currentCard.suit;
//           const consecutiveSuits = [suit];

//           for (let j = i + 1; j < cards.length; j++) {
//               const nextCard = cards[j];

//               if (nextCard.suit === suit && this.isConsecutiveSuits(consecutiveSuits, nextCard.suit)) {
//                   consecutiveSuits.push(nextCard.suit);
//               } else {
//                   break; // If the next card breaks the consecutive sequence, stop checking
//               }
//           }

//           // Check if consecutiveSuits forms a consecutive sequence
//           if (consecutiveSuits.length >= 3) {
//               score += consecutiveSuits.length;
//           }
//       }
//   }

//   return score;
// }

// isConsecutiveSuits(suits, currentSuit) {
//   const index = this.deck.suits.indexOf(currentSuit);
//   return suits.every(suit => this.deck.suits.indexOf(suit) === index - 1 || this.deck.suits.indexOf(suit) === index + 1);
// }



 checkFlush(rowOrColumn) {
  const cards = rowOrColumn.filter(card => card !== 'FaceDown');
  let score = 0;

  if (cards.length >= 3) {
      const suitsMap = new Map();
      let currentSuit = null;
      let currentStreak = 0;

      for (const card of cards) {
          const suit = card.suit;

          if (suit === currentSuit) {
              currentStreak++;
          } else {
              currentSuit = suit;
              currentStreak = 1;
          }

          if (currentStreak >= 3) {
              score += currentStreak;
          }
      }
  }

  return score;
}



    
//   checkFlush(rowOrColumn) {
//     const cards = rowOrColumn.filter(card => card !== 'FaceDown');
//     let score = 0;

//     if (cards.length >= 3) {
//         const suits = new Set(cards.map(card => card.suit));

//         if (suits.size === 1) {
//             score += cards.length; // Flush
//         }
//     }

//     return score;
// }






calculateScore(playerIndex) {
  let totalScore = 0;

  // Check each row for scoring combinations
  for (let i = 0; i < this.grid.length; i++) {
      const pairsScore = this.checkPairs(this.grid[i]);
      const runsScore = this.checkRuns(this.grid[i]);
      const flushScore = this.checkFlush(this.grid[i]);

      // Add the row scores to the total score for the player (excluding the dealer)
      if (playerIndex !== this.dealerIndex) {
          totalScore += pairsScore + runsScore + flushScore;
          console.log(`Debug - Player ${playerIndex + 1}, Row ${i + 1} Score: ${pairsScore + runsScore + flushScore}`);
          console.log(`Debug - Reason: Pair: ${pairsScore}, Run: ${runsScore},  Flush: ${flushScore}`);

          // Display reasons for each score
          // if (pairsScore > 0) {
          //     console.log(`  Reason: Pair`);
          // }
          // if (runsScore > 0) {
          //     console.log(`  Reason: Run`);
          // }
          // if (flushScore > 0) {
          //     console.log(`  Reason: Flush`);
          // }
      }
  }

  // Check each column for scoring combinations if the player is the dealer
  if (playerIndex === this.dealerIndex) {
      for (let i = 0; i < this.grid[0].length; i++) {
          const column = this.grid.map(row => row[i]);
          const pairsScore = this.checkPairs(column);
          const runsScore = this.checkRuns(column);
          const flushScore = this.checkFlush(column);

          // Add the column scores to the total score for the player (dealer)
          totalScore += pairsScore + runsScore + flushScore;
          console.log(`Debug - Player ${playerIndex + 1}, Column ${i + 1} Score: ${pairsScore + runsScore + flushScore}`);
          console.log(`Debug - Reason: Pair: ${pairsScore}, Run: ${runsScore},  Flush: ${flushScore}`);


          // Display reasons for each score
          // if (pairsScore > 0) {
          //     console.log(`  Reason: Pair`);
          // }
          // if (runsScore > 0) {
          //     console.log(`  Reason: Run`);
          // }
          // if (flushScore > 0) {
          //     console.log(`  Reason: Flush`);
          // }
      }
  }

  // Display the total score for the player
  console.log(`Debug - Player ${playerIndex + 1}'s totalScore: ${totalScore}`);

  // Return the total score for the player
  return totalScore;
}


    
    
    
    
    
  // scoring ends
  
  playGame() {
    if (!this.playScoringAsYouGo) {
        // Do something if scoring at the end
        // console.log('Scoring at the end.');
        if (this.isGameOver()) {
            // Calculate and display scores
            //const winnerIndex = this.getWinner();
            //console.log(`Game over! Player ${winnerIndex + 1} wins!`);

            // Calculate and display scores
            const scorePlayer1 = this.calculateScore(0);
            const scorePlayer2 = this.calculateScore(1);

            console.log(`Player 1's score: ${scorePlayer1}`);
            console.log(`Player 2's score: ${scorePlayer2}`);

            if (scorePlayer1 > scorePlayer2) {
                console.log(`Player 1 wins!`);
            } else if (scorePlayer2 > scorePlayer1) {
                console.log(`Player 2 wins!`);
            } else {
                console.log(`It's a tie!`);
            }

            //const scorePlayer1 = this.calculateScore(0);
            //const scorePlayer2 = this.calculateScore(1);

            //console.log(`Player 1's score: ${scorePlayer1}`);
            //console.log(`Player 2's score: ${scorePlayer2}`);
        } else {
            this.playTurn();
        }
    } else {
        this.playTurn();
    }
}

      playTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (!this.isGameOver()) {
            console.log(`\nPlayer ${this.currentPlayerIndex + 1}'s turn:`);
            this.displayPlayerCards(); // Show each player their cards

            this.rl.question(`Please enter the index to place your card on the grid: `, (selectedCardIndex) => {
                if (selectedCardIndex >= 0 && selectedCardIndex < currentPlayer.length) {
                    const playedCard = currentPlayer.splice(selectedCardIndex, 1)[0];
                    this.placeCardInSpiral(playedCard);
                    this.displayGrid(); // Show the updated grid

                    // Check if the game is over
                    if (this.isGameOver()) {
                        //console.log(`Game over! Player ${this.getWinner() + 1} wins!`);                        
                        this.playGame();
                        this.rl.close();
                    } else {
                        // Switch to the other player and continue the game
                        this.currentPlayerIndex = 1 - this.currentPlayerIndex;
                        this.playTurn();
                    }
                } else {
                    console.log('Invalid card index. Please choose a valid card.');
                    this.playTurn(); // Ask the same player again
                }
            });
        }
      }
    
      isGameOver() {
        return this.players[0].length === 1 && this.players[1].length === 1;
    }

    getWinner() {
    
        const scorePlayer1 = this.calculateScore(0);
        const scorePlayer2 = this.calculateScore(1);
    
        if (scorePlayer1 > scorePlayer2) {
            return 0; // Player 1 wins
        } else if (scorePlayer2 > scorePlayer1) {
            return 1; // Player 2 wins
        } else {
            return -1; // It's a tie
        }
    
    
    }

      displayPlayerCards() {
        const currentPlayerCards = this.players[this.currentPlayerIndex].map(card => card.toString()).join(', ');
        console.log(`Player ${this.currentPlayerIndex + 1} Cards: ${currentPlayerCards}`);
    }

      placeCardInSpiral(card) {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
        let row = Math.floor(this.grid.length / 2);
        let col = Math.floor(this.grid[0].length / 2);
        let steps = 1;
        let stepCount = 0;
        let directionIndex = 0;
    
        while (card) {
            if (this.isValidPosition(row, col) && this.grid[row][col] === 'FaceDown') {
                this.grid[row][col] = card;
                card = null;
            }
    
            row += directions[directionIndex][0];
            col += directions[directionIndex][1];
            stepCount++;
    
            if (stepCount === steps) {
                stepCount = 0;
                directionIndex = (directionIndex + 1) % 4;
    
                if (directionIndex % 2 === 0) {
                    steps++;
                }
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
            console.log(rowString)
          }
        }    
      
  }
  
  // Example usage  
const game = new CardGame();
game.askScoringPreference();
//game.displayGrid();
//game.playGame();


//game.playTurn();
//game.playTurn();
// Continue playing turns as needed
//game.displayGrid();

  // You can now access the game's grid and players array to display or manipulate the game state as needed.
//   console.log('Grid:', game.grid);
  //console.log('Player 1 Cards:', game.players[0]);
  //console.log('Player 2 Cards:', game.players[1]);
  