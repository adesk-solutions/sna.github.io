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
      this.totalScore_variant_as_you_go = [0,0];
      this.playScoringAsYouGo_lastRound = false;

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
      checkPairsAndRuns(card) {
        const rank = card.rank;
        const row = card.row;
        const col = card.col;
    
        // Check for pairs
        const pairCount = this.getPairCount(rank, row, col);
        if (pairCount === 2) {
            this.addScore(currentPlayerIndex, 2, 'Pairs'); // Pair
        } else if (pairCount === 3) {
            this.addScore(currentPlayerIndex, 6, 'Prial'); // Prial
        } else if (pairCount === 4) {
            this.addScore(currentPlayerIndex, 12, 'Double Pair Royal'); // Double Pair Royal
        }
    
        // Check for runs
        const runCount = this.getRunCount(rank, row, col);
        if (runCount === 3) {
            this.addScore(currentPlayerIndex, 3, 'Run of Three'); // Run of three
        } else if (runCount === 4) {
            this.addScore(currentPlayerIndex, 4, 'Run of Four'); // Run of four
        } else if (runCount === 5) {
            this.addScore(currentPlayerIndex, 5, 'Run of Five'); // Run of five
        }
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

  if(!this.playScoringAsYouGo){
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
  }else{
    let totalScore = 0;

        // Calculate and display scores for the row where the card was placed
        const row = this.grid[this.grid.length - 1];
        const pairsScore = this.checkPairs(row);
        const runsScore = this.checkRuns(row);
        const flushScore = this.checkFlush(row);

        totalScore += pairsScore + runsScore + flushScore;
        //console.log(`Debug - Player ${playerIndex + 1}, Row Score: ${pairsScore + runsScore + flushScore}`);
        console.log(`Debug - Reason: Pair: ${pairsScore}, Run: ${runsScore}, Flush: ${flushScore}`);

        // Calculate and display scores for the column where the card was placed
        const column = this.grid.map(row => row[this.grid[0].length - 1]);
        const columnPairsScore = this.checkPairs(column);
        const columnRunsScore = this.checkRuns(column);
        const columnFlushScore = this.checkFlush(column);

        totalScore += columnPairsScore + columnRunsScore + columnFlushScore;
        //console.log(`Debug - Player ${playerIndex + 1}, Column Score: ${columnPairsScore + columnRunsScore + columnFlushScore}`);
        console.log(`Debug - Reason: Pair: ${columnPairsScore}, Run: ${columnRunsScore}, Flush: ${columnFlushScore}`);

        // Display the total score for the player
        console.log(`Debug - Player ${playerIndex + 1}'s totalScore: ${totalScore}`);

        // Return the total score for the player
        return totalScore;
  }
 
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
            // Scoring as you go
            //this.calculateAndDisplayScores(); // Calculate and display scores after each turn
            if (this.isGameOver()) {
                this.rl.close();
            } else {
                this.playTurn();
            }
    }
}

calculateAndDisplayScores() {
  // const scorePlayer1 = this.calculateScore(0);
  // const scorePlayer2 = this.calculateScore(1);

  // console.log(`Player 1's score: ${scorePlayer1}`);
  // console.log(`Player 2's score: ${scorePlayer2}`);

    // Calculate and display scores for the last row
    const lastRow = this.grid[this.grid.length - 1];
    const rowPairsScore = this.checkPairs(lastRow);
    const rowRunsScore = this.checkRuns(lastRow);
    const rowFlushScore = this.checkFlush(lastRow);

    console.log(`Debug - Row Score: ${rowPairsScore + rowRunsScore + rowFlushScore}`);
    console.log(`Debug - Reason: Pair: ${rowPairsScore}, Run: ${rowRunsScore}, Flush: ${rowFlushScore}`);

    // Calculate and display scores for the last column
    const lastColumn = this.grid.map(row => row[this.grid[0].length - 1]);
    const columnPairsScore = this.checkPairs(lastColumn);
    const columnRunsScore = this.checkRuns(lastColumn);
    const columnFlushScore = this.checkFlush(lastColumn);

    console.log(`Debug - Column Score: ${columnPairsScore + columnRunsScore + columnFlushScore}`);
    console.log(`Debug - Reason: Pair: ${columnPairsScore}, Run: ${columnRunsScore}, Flush: ${columnFlushScore}`);

}


calculateRowScore(row, placedCardIndex) {

  const cards = row.filter(card => card !== 'FaceDown');
  console.log(`cards ${cards}`);
  const rankCount = {};
  let score = 0;

  for (const card of cards) {
      const rank = card.rank;
      rankCount[rank] = (rankCount[rank] || 0) + 1;

       console.log(`Debug - Card: ${card}, Rank: ${rank}, Rank Count: ${rankCount[rank]}`);

      if (rankCount[rank] === 2) {
          score += 2; // Pair
          console.log('2 score');
      } else if (rankCount[rank] === 3) {
          score += 6; // Prial
      } else if (rankCount[rank] === 4) {
          score += 12; // Double Pair Royal
      }
  }

  return score;

  // const cards = row.filter(card => card !== 'FaceDown');
  // const rankCount = {};
  // let score = { pair: 0, run: 0, flush: 0 };

  // console.log(`cards.length ${cards.length}`);
  
  // // Check for pairs between index 0 and 1
  // // if (cards.length > 1 && cards[0].rank === cards[1].rank) {
  // //   score.pair += 2; // Pair
  // // }

  // for (let i = 0; i < cards.length; i++) {
  //   const card = cards[i];
  //   const rank = card.rank;
  //   const suit = card.suit;
  //   rankCount[rank] = (rankCount[rank] || 0) + 1;

  //   // Adjust the index calculation to reset to 0 when a new card is placed
  //   const adjustedIndex = (i + placedCardIndex) % cards.length;

  //   console.log(`Debug - Card: ${card}, Rank: ${rank}, Suit: ${suit}, Rank Count: ${rankCount[rank]}, Index: ${adjustedIndex}, Placed Card Index: ${placedCardIndex}`);

  //   // Check for additional pairs
  //   if (rankCount[rank] === 2) {
  //     // Check for interruption with the previous card
  //     if (adjustedIndex === 0 || adjustedIndex === 1) {
  //       score.pair += 2; // Pair
  //     }
  //   } else if (rankCount[rank] === 3) {
  //     score.pair += 6; // Prial
  //   } else if (rankCount[rank] === 4) {
  //     score.pair += 12; // Double Pair Royal
  //   }
  // }

  // return score;
}



// calculateRowScore(row, placedCardIndex) {
//   const cards = row.filter(card => card !== 'FaceDown');
//   const rankCount = {};
//   let score = { pair: 0, run: 0, flush: 0 };

//   //console.log(`cards.length ${cards.length}`);
  
//   // Check for pairs between index 0 and 1
//   if (cards.length > 1 && cards[0].rank === cards[1].rank) {
//     score.pair += 2; // Pair
//     console.log(`Score 2`);
//   }

//   for (let i = 0; i < cards.length; i++) {
//     const card = cards[i];
//     const rank = card.rank;
//     const suit = card.suit;
//     rankCount[rank] = (rankCount[rank] || 0) + 1;

//     console.log(`Debug - Card: ${card}, Rank: ${rank}, Suit: ${suit}, Rank Count: ${rankCount[rank]}, Index: ${i}, Placed Card Index: ${placedCardIndex}`);

//     // Check for additional pairs
//     if (rankCount[rank] === 2) {
//       // Check for interruption with the previous card
//       if (i === placedCardIndex - 1 || i === placedCardIndex + 1) {
//         score.pair += 2; // Pair
//       }
//     } else if (rankCount[rank] === 3) {
//       score.pair += 6; // Prial
//     } else if (rankCount[rank] === 4) {
//       score.pair += 12; // Double Pair Royal
//     }
//   }

//   return score;
// }







calculateColumnScoreHelper(column, placedCardIndex) {
  const cards = column.filter(card => card !== 'FaceDown');
  const rankCount = {};
  let score = { pair: 0, run: 0, flush: 0 };

  for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rank = card.rank;
      const suit = card.suit;
      rankCount[rank] = (rankCount[rank] || 0) + 1;

      // Check if the current card is the newly placed card or a neighboring card
      if (i === placedCardIndex || i === placedCardIndex - 1 || i === placedCardIndex + 1) {
          if (rankCount[rank] === 2) {
              score.pair += 2; // Pair
          } else if (rankCount[rank] === 3) {
              score.pair += 6; // Prial
          } else if (rankCount[rank] === 4) {
              score.pair += 12; // Double Pair Royal
          }
      }
  }

  // Check for runs and flush
  // ... (same as before)

  return score;
}


calculateColumnScore(column, placedCardIndex) {
  const cards = column.filter(card => card !== 'FaceDown');
  const rankCount = {};
  let score = { pair: 0, run: 0, flush: 0 };

  for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rank = card.rank;
      const suit = card.suit;
      rankCount[rank] = (rankCount[rank] || 0) + 1;

      if (rankCount[rank] === 2 && (i === placedCardIndex || i === placedCardIndex - 1 || i === placedCardIndex + 1)) {
          score.pair += 2; // Pair
      } else if (rankCount[rank] === 3) {
          score.pair += 6; // Prial
      } else if (rankCount[rank] === 4) {
          score.pair += 12; // Double Pair Royal
      }
  }

  // Check for flush
  // const suits = new Set(cards.map(card => card.suit));
  // if (suits.size === 1) {
  //     score.flush += cards.length; // Flush
  // }

  return score;
}





      playTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (!this.isGameOver()) {

          if (this.playScoringAsYouGo) {            
            //this.calculateAndDisplayScores(); // Calculate and display scores
            //this.calculateScore(currentPlayer);
          }

            console.log(`\nPlayer ${this.currentPlayerIndex + 1}'s turn:`);
            this.displayPlayerCards(); // Show each player their cards



            this.rl.question(`Please enter the index to place your card on the grid: `, (selectedCardIndex) => {
                if (selectedCardIndex >= 0 && selectedCardIndex < currentPlayer.length) {
                    const playedCard = currentPlayer.splice(selectedCardIndex, 1)[0];
                    this.placeCardInSpiral(playedCard);
                    this.displayGrid(); // Show the updated grid

                    if(this.playScoringAsYouGo_lastRound && this.playScoringAsYouGo){
                      // Check if the game is over
                          
                            this.displayWinner();
                        
                    }
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
        const currentPlayerCards = this.players[this.currentPlayerIndex].map((card, index) => `${index}.${card.toString()}`).join(', ');
        console.log(`Player ${this.currentPlayerIndex + 1} Cards: ${currentPlayerCards}`);
    }

    // placeCardInSpiral(card) {
    //   const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
    //   let row = Math.floor(this.grid.length / 2);
    //   let col = Math.floor(this.grid[0].length / 2);
    //   let steps = 1;
    //   let stepCount = 0;
    //   let directionIndex = 0;
    //   const originalGrid = this.grid.map(row => row.slice());
    
    //   while (card) {
    //     if (this.isValidPosition(row, col) && this.grid[row][col] === 'FaceDown') {
    //       // Check for scoring in the corresponding row and column
    //       let placedCardIndex = -1;
    //       for (let i = 0; i < this.grid[row].length; i++) {
    //         if (this.grid[row][i] === card) {
    //           placedCardIndex = i;
    //           break;
    //         }
    //       }
    
    //       this.grid[row][col] = card;
    
    //       if (this.playScoringAsYouGo) {
    //         // Call calculateRowScore with placedCardIndex
    //         const rowScore = this.calculateRowScore(this.grid[row], placedCardIndex);
    
    //         // Call calculateColumnScore with placedCardIndex
    //         const columnScore = this.calculateColumnScore(this.grid.map(row => row[col]), placedCardIndex);
    
    //         console.log(`Debug - Reason: Pair: ${rowScore.pair}, Run: ${rowScore.run}, Flush: ${rowScore.flush}`);
    
    //         // Calculate total score for row and column
    //         const totalRowScore = rowScore.pair + rowScore.run + rowScore.flush;
    //         const totalColumnScore = columnScore.pair + columnScore.run + columnScore.flush;
    
    //         console.log(`Debug - Total Row Score: ${totalRowScore}`);
    //         console.log(`Debug - Total Column Score: ${totalColumnScore}`);
    
    //         // Calculate sum of both row and column scores
    //         const totalScore = totalRowScore + totalColumnScore;
    
    //         console.log(`Debug - Total Score: ${totalScore}`);
    //       }
    
    //       // Reset the grid to the original state
    //       //this.grid = originalGrid.map(row => row.slice());
    //       card = null;
    //     }
    
    //     row += directions[directionIndex][0];
    //     col += directions[directionIndex][1];
    //     stepCount++;
    
    //     if (stepCount === steps) {
    //       stepCount = 0;
    //       directionIndex = (directionIndex + 1) % 4;
    
    //       if (directionIndex % 2 === 0) {
    //         steps++;
    //       }
    //     }
    //   }
    // }
    
   

  //   logNeighboringCards(row, col, currentPlayerIndex) {
  //     const leftColumn = col - 1 >= 0 ? col - 1 : null;
  //     const rightColumn = col + 1 < this.grid[0].length ? col + 1 : null;
  //     const aboveRow = row - 1 >= 0 ? row - 1 : null;
  //     const belowRow = row + 1 < this.grid.length ? row + 1 : null;

  //     const placedCard = this.grid[row][col];

  //     const checkAndScore = (card, score) => {
  //         if (card !== null && card !== 'FaceDown' && card.rank === placedCard.rank) {
  //             console.log(`Player ${currentPlayerIndex + 1} - Card with the same rank: ${JSON.stringify(card)}`);
  //             // Add your scoring logic here
  //             // For now, let's assume you have a function addScore(playerIndex, score) to add the score to the total score
  //             this.addScore(currentPlayerIndex, score ,'Pair');
  //         }
  //     };

  
  //     checkAndScore(leftColumn !== null ? this.grid[row][leftColumn] : null, 2);
  //     checkAndScore(rightColumn !== null ? this.grid[row][rightColumn] : null, 2);
  //     checkAndScore(aboveRow !== null ? this.grid[aboveRow][col] : null, 2);
  //     checkAndScore(belowRow !== null ? this.grid[belowRow][col] : null, 2);
  // }

 

  logNeighboringCards_checkRuns(row, col, currentPlayerIndex) {
    const placedCard = this.grid[row][col];
      const leftColumn = col - 1 >= 0 ? col - 1 : null;
      const rightColumn = col + 1 < this.grid[0].length ? col + 1 : null;
      const aboveRow = row - 1 >= 0 ? row - 1 : null;
      const belowRow = row + 1 < this.grid.length ? row + 1 : null;

   
    
      //console.log(`test ${this.grid[row][col].rank}`);
// const checkRuns = (cards, score, reason) => {
//   let sortedCards = cards
//       .filter((card) => card !== null && card !== 'FaceDown')
//       .sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank));

//   // Include the rank of the placed card in the sorted array
//   // Check if placedCard is not null and has a rank property
//   if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.rank !== undefined) {
//       const placedCardRank = placedCard.rank;
//       sortedCards.push({ rank: placedCardRank, suit: placedCard.suit });
//       sortedCards = sortedCards.sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank)); // Sort the array again
//   }

//   //console.log("Sorted Cards Ranks:", sortedCards.map(card => card.rank));

//   let currentRunLength = 1;

//   for (let i = 1; i < sortedCards.length; i++) {

//       if (normalizeRank(sortedCards[i].rank) === normalizeRank(sortedCards[i - 1].rank) + 1) {
//           currentRunLength++;
//       } else {
//           currentRunLength = 1;
//       }

//       if (currentRunLength === 3) {
//           //console.log(`Player ${currentPlayerIndex + 1} - ${reason}: ${JSON.stringify(sortedCards)}`);
//           this.addScore(currentPlayerIndex, score, reason);

//           // Check for a sequence of 3 cards and award points
//           // if (isSequence(sortedCards[i - 2], sortedCards[i - 1], sortedCards[i])) {
//           //     console.log(`Player ${currentPlayerIndex + 1} - Awarded 3 points for a sequence of 3 cards.`);
//           //     this.addScore(currentPlayerIndex, 3, 'Sequence of 3');
//           // }

//           return;
//       }
//   }
// };

// Function to check for runs of 4 cards
const checkRunsOf4 = (cards, score, reason) => {
  let sortedCards = cards
      .filter((card) => card !== null && card !== 'FaceDown')
      .sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank));

  // Include the rank of the placed card in the sorted array
  // Check if placedCard is not null and has a rank property
  if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.rank !== undefined) {
      const placedCardRank = placedCard.rank;
      sortedCards.push({ rank: placedCardRank, suit: placedCard.suit });
      sortedCards = sortedCards.sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank)); // Sort the array again
  }

  //console.log("Sorted Cards Ranks:", sortedCards.map(card => card.rank));

  let currentRunLength = 1;

  for (let i = 1; i < sortedCards.length; i++) {
      if (normalizeRank(sortedCards[i].rank) === normalizeRank(sortedCards[i - 1].rank) + 1) {
          currentRunLength++;
      } else {
          currentRunLength = 1;
      }

      if (currentRunLength === 4) {
          console.log(`Player ${currentPlayerIndex + 1} - ${reason}: ${JSON.stringify(sortedCards)}`);
          this.addScore(currentPlayerIndex, score, reason);
          return true; // Found a run of 4, no need to check for runs of 3
      }
  }

  return false; // No run of 4 found
};

// Function to check for runs of 3 cards if no runs of 4 are found
const checkRunsOf3 = (cards, score, reason) => {
  let sortedCards = cards
      .filter((card) => card !== null && card !== 'FaceDown')
      .sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank));

  // Include the rank of the placed card in the sorted array
  // Check if placedCard is not null and has a rank property
  if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.rank !== undefined) {
      const placedCardRank = placedCard.rank;
      sortedCards.push({ rank: placedCardRank, suit: placedCard.suit });
      sortedCards = sortedCards.sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank)); // Sort the array again
  }

  //console.log("3 Sorted Cards Ranks:", sortedCards.map(card => card.rank));
  let currentRunLength = 1;

  for (let i = 1; i < sortedCards.length; i++) {
      if (normalizeRank(sortedCards[i].rank) === normalizeRank(sortedCards[i - 1].rank) + 1) {
          currentRunLength++;
      } else {
          currentRunLength = 1;
      }

      if (currentRunLength === 3) {
          console.log(`Player ${currentPlayerIndex + 1} - ${reason}: ${JSON.stringify(sortedCards)}`);
          this.addScore(currentPlayerIndex, score, reason);
          return; // Found a run of 3
      }
  }
};
 // Helper function to normalize ranks, treating Ace as 1
 function normalizeRank(rank) {
  if (rank === 'A') {
      return 1;
  } else if (rank === 'J') {
      return 11;
  } else if (rank === 'Q') {
      return 12;
  } else if (rank === 'K') {
      return 13;
  } else {
      return parseInt(rank);
  }
}

// Helper function to check if three cards form a sequence
// function isSequence(card1, card2, card3) {
//   const ranks = [normalizeRank(card1.rank), normalizeRank(card2.rank), normalizeRank(card3.rank)];
//   ranks.sort((a, b) => a - b);
//   return ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2];
// }

// runs of 4 checking
// Check for Run of 4 - left
const rowRun4Left = [
  leftColumn !== null ? this.grid[row][leftColumn] : null,
  leftColumn !== null && leftColumn - 1 >= 0 ? this.grid[row][leftColumn - 1] : null,
  leftColumn !== null && leftColumn - 2 >= 0 ? this.grid[row][leftColumn - 2] : null,
];

// Using JSON.stringify to log the properties
// console.log('rowRun4Left:', rowRun4Left.map(card => JSON.stringify(card)));



// Check for Run of 4 - right
const rowRun4Right = [
  rightColumn !== null ? this.grid[row][rightColumn] : null,
  rightColumn !== null && rightColumn + 1 < this.grid[0].length ? this.grid[row][rightColumn + 1] : null,
  rightColumn !== null && rightColumn + 2 < this.grid[0].length ? this.grid[row][rightColumn + 2] : null,
];

// Using JSON.stringify to log the properties
// console.log('rowRun4Right:', rowRun4Right.map(card => JSON.stringify(card)));



// Check for Run of 4 - above
const rowRun4Above = [
  aboveRow !== null ? this.grid[aboveRow][col] : null,
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,
  aboveRow !== null && aboveRow - 2 >= 0 ? this.grid[aboveRow - 2][col] : null,
];

// Using JSON.stringify to log the properties
// console.log('rowRun4Above:', rowRun4Above.map(card => JSON.stringify(card)));


// Check for Run of 4 - below
const rowRun4Below = [
  belowRow !== null ? this.grid[belowRow][col] : null,
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,
  belowRow !== null && belowRow + 2 < this.grid.length ? this.grid[belowRow + 2][col] : null,
];

// Using JSON.stringify to log the properties
// console.log('rowRun4Below:', rowRun4Below.map(card => JSON.stringify(card)));



//runs of 3 checking
  const rowRun3Left = [
  leftColumn !== null ? this.grid[row][leftColumn] : null, 
  leftColumn !== null && leftColumn - 1 >= 0 ? this.grid[row][leftColumn - 1] : null  
];

// Using JSON.stringify to log the properties
//console.log('rowRun3Left:', rowRun3Left.map(card => JSON.stringify(card)));

//checkRuns(rowRun3Left, 3, 'Run of 3 - Left');

// Check for Run of 3 - right
const rowRun3Right = [
  rightColumn !== null ? this.grid[row][rightColumn] : null, 
  rightColumn !== null && rightColumn + 1 < this.grid[0].length ? this.grid[row][rightColumn + 1] : null

];

// Using JSON.stringify to log the properties
//console.log('rowRun3Right:', rowRun3Right.map(card => JSON.stringify(card)));


//checkRuns(rowRun3Right, 3, 'Run of 3 - Right');

// Check for Run of 3 - above
const rowRun3Above = [
  aboveRow !== null ? this.grid[aboveRow][col] : null, 
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,
];

//checkRuns(rowRun3Above, 3, 'Run of 3 - Above');

// Check for Run of 3 - below
const rowRun3Below = [
  belowRow !== null ? this.grid[belowRow][col] : null,  
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,
];

//checkRuns(rowRun3Below, 3, 'Run of 3 - Below');
if (!checkRunsOf4(rowRun4Left, 4, 'Run of 4 - Left')) {
  // If no runs of 4 are found, check for runs of 3
  checkRunsOf3(rowRun3Left, 3, 'Run of 3 - Left');
}

if (!checkRunsOf4(rowRun4Right, 4, 'Run of 4 - Right')) {
  // If no runs of 4 are found, check for runs of 3
  checkRunsOf3(rowRun3Right, 3, 'Run of 3 - Right');
}


//checkRuns(rowRun4Above, 4, 'Run of 4 - Above');
if (!checkRunsOf4(rowRun4Above, 4, 'Run of 4 - Above')) {
  // If no runs of 4 are found, check for runs of 3
  checkRunsOf3(rowRun3Above, 3, 'Run of 3 - Above');
}

//checkRuns(rowRun4Below, 4, 'Run of 4 - Below');
if (!checkRunsOf4(rowRun4Below, 4, 'Run of 4 - Below')) {
  // If no runs of 4 are found, check for runs of 3
  checkRunsOf3(rowRun3Below, 3, 'Run of 3 - Below');
}


  
  }
  

  logNeighboringCards(row, col, currentPlayerIndex) {
    const placedCard = this.grid[row][col];

    const leftColumn = col - 1 >= 0 ? col - 1 : null;
    const rightColumn = col + 1 < this.grid[0].length ? col + 1 : null;
    const aboveRow = row - 1 >= 0 ? row - 1 : null;
    const belowRow = row + 1 < this.grid.length ? row + 1 : null;

    let scored = false;

    const checkAndScore = (cards, score, reason) => {
      const sameRankCount = cards.reduce((count, card) => (
          card !== null && card !== 'FaceDown' && card.rank === placedCard.rank
      ) ? count + 1 : count, 0);
  
      if (sameRankCount === cards.length) {
          const cardsInfo = cards.map(card => card ? JSON.stringify(card) : 'null');
          console.log(`Player ${currentPlayerIndex + 1} - ${reason}: ${cardsInfo}`);
          this.addScore(currentPlayerIndex, score, reason);
          return;
      }

  };
  
//  checkAndScore(leftColumn !== null ? this.grid[row][leftColumn] : null, 2 , 'Pair - Column');
//  checkAndScore(rightColumn !== null ? this.grid[row][rightColumn] : null, 2 , 'Pair - Column');
//  checkAndScore(aboveRow !== null ? this.grid[aboveRow][col] : null, 2 , 'Pair - Row');
//  checkAndScore(belowRow !== null ? this.grid[belowRow][col] : null, 2, 'Pair - Row');

// Check for Double Pair Royal



// Check for Double Pair Royal leftColumn (four cards with the same rank)
const rowDoubleRoyalPairCardsleftColumn = [
  leftColumn !== null ? this.grid[row][leftColumn - 1] : null,
  leftColumn !== null ? this.grid[row][leftColumn - 2] : null,
  leftColumn !== null ? this.grid[row][leftColumn - 3] : null
];

// Check if any card in rowDoubleRoyalPairCardsleftColumn is null or undefined before calling checkAndScore
if (!rowDoubleRoyalPairCardsleftColumn.some(card => card === null || card === undefined)) {
  checkAndScore(rowDoubleRoyalPairCardsleftColumn, 12, 'Double Pair Royal - Row');  
}

// Check for Double Pair Royal rightColumn (four cards with the same rank)
const rowDoubleRoyalPairCardsrightColumn = [
  rightColumn !== null ? this.grid[row][rightColumn + 1] : null,
  rightColumn !== null ? this.grid[row][rightColumn + 2] : null,
  rightColumn !== null ? this.grid[row][rightColumn + 3] : null
];

// Check if any card in rowDoubleRoyalPairCardsrightColumn is null or undefined before calling checkAndScore
if (!rowDoubleRoyalPairCardsrightColumn.some(card => card === null || card === undefined)) {
  checkAndScore(rowDoubleRoyalPairCardsrightColumn, 12, 'Double Pair Royal - Row'); 
}

// Check for Double Pair Royal aboveRow (four cards with the same rank)
const rowDoubleRoyalPairCardsaboveRow = [
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,
  aboveRow !== null && aboveRow - 2 >= 0 ? this.grid[aboveRow - 2][col] : null,
  aboveRow !== null && aboveRow - 3 >= 0 ? this.grid[aboveRow - 3][col] : null
];

// Check if any card in rowDoubleRoyalPairCardsaboveRow is null or undefined before calling checkAndScore
if (!rowDoubleRoyalPairCardsaboveRow.some(card => card === null || card === undefined)) {
  checkAndScore(rowDoubleRoyalPairCardsaboveRow, 12, 'Double Pair Royal - Column'); 
}

// Check for Double Pair Royal belowRow (four cards with the same rank)
const rowDoubleRoyalPairCardsbelowRow = [
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,
  belowRow !== null && belowRow + 2 < this.grid.length ? this.grid[belowRow + 2][col] : null,
  belowRow !== null && belowRow + 3 < this.grid.length ? this.grid[belowRow + 3][col] : null  
];

// Check if any card in rowDoubleRoyalPairCardsbelowRow is null or undefined before calling checkAndScore
if (!rowDoubleRoyalPairCardsbelowRow.some(card => card === null || card === undefined)) {
  checkAndScore(rowDoubleRoyalPairCardsbelowRow, 12, 'Double Pair Royal - Column');
}

      // Check for Prial leftColumn (two cards with the same rank)
      const rowPrialCardsleftColumn = [
        //leftColumn !== null ? this.grid[row][leftColumn] : null, 
        leftColumn !== null ? this.grid[row][leftColumn - 1] : null,
        leftColumn !== null ? this.grid[row][leftColumn - 2] : null];
        
        // // Check if any card in rowPrialCards is null or undefined before calling checkAndScore
        if (!rowPrialCardsleftColumn.some(card => card === null || card === undefined)) {
          checkAndScore(rowPrialCardsleftColumn, 3, 'Prial - Row');         
         
        }
        
        // Check for Prial rightColumn (two cards with the same rank)
        const rowPrialCardsrightColumn = [
        //rightColumn !== null ? this.grid[row][rightColumn] : null, 
        rightColumn !== null ? this.grid[row][rightColumn + 1] : null,
        rightColumn !== null ? this.grid[row][rightColumn + 2] : null];
        
        // // Check if any card in rowPrialCards is null or undefined before calling checkAndScore
        if (!rowPrialCardsrightColumn.some(card => card === null || card === undefined)) {
          checkAndScore(rowPrialCardsrightColumn, 3, 'Prial - Row');
         
        }
        
        // Check for Prial aboveRow (two cards with the same rank)
        const rowPrialCardsaboveRow = [
          //aboveRow !== null && this.grid[aboveRow] && this.grid[aboveRow][col], // Check if this.grid[aboveRow] and this.grid[aboveRow][col] are defined
          aboveRow !== null && aboveRow - 1 >= 0 && this.grid[aboveRow - 1] && this.grid[aboveRow - 1][col], // Check if aboveRow - 1 and this.grid[aboveRow - 1][col] are defined
          aboveRow !== null && aboveRow - 2 >= 0 && this.grid[aboveRow - 2] && this.grid[aboveRow - 2][col] // Check if aboveRow - 2 and this.grid[aboveRow - 2][col] are defined
        ];
        
        // // Check if any card in rowPrialCards is null or undefined before calling checkAndScore
        if (!rowPrialCardsaboveRow.some(card => card === null || card === undefined)) {
          checkAndScore(rowPrialCardsaboveRow, 3, 'Prial - Column');
          
        }
        
        // Check for Prial belowRow (two cards with the same rank)
        const rowPrialCardsbelowRow = [
          //belowRow !== null && this.grid[belowRow] && this.grid[belowRow][col], // Check if this.grid[belowRow] and this.grid[belowRow][col] are defined
          belowRow !== null && belowRow + 1 < this.grid.length && this.grid[belowRow + 1] && this.grid[belowRow + 1][col], // Check if belowRow + 1 and this.grid[belowRow + 1][col] are defined
          belowRow !== null && belowRow + 2 < this.grid.length && this.grid[belowRow + 2] && this.grid[belowRow + 2][col] // Check if belowRow + 2 and this.grid[belowRow + 2][col] are defined
        ];
        
        
        if (!rowPrialCardsbelowRow.some(card => card === null || card === undefined)) {
          checkAndScore(rowPrialCardsbelowRow, 3, 'Prial - Column');
         
        }


        // Check for Pair leftColumn (two cards with the same rank)
        const rowPairCardsleftColumn = [leftColumn !== null ? this.grid[row][leftColumn] : null];

        // // Check if any card in rowPairCards is null or undefined before calling checkAndScore
        if (!rowPairCardsleftColumn.some(card => card === null || card === undefined)) {
          checkAndScore(rowPairCardsleftColumn, 2, 'Pair - Row');
        }

        // Check for Pair rightColumn (two cards with the same rank)
        const rowPairCardsrightColumn = [rightColumn !== null ? this.grid[row][rightColumn] : null];

        // // Check if any card in rowPairCards is null or undefined before calling checkAndScore
        if (!rowPairCardsrightColumn.some(card => card === null || card === undefined)) {
          checkAndScore(rowPairCardsrightColumn, 2, 'Pair - Row');
        }

        // Check for Pair aboveRow (two cards with the same rank)
        const rowPairCardsaboveRow = [aboveRow !== null ? this.grid[aboveRow][col] : null];

        // // Check if any card in rowPairCards is null or undefined before calling checkAndScore
        if (!rowPairCardsaboveRow.some(card => card === null || card === undefined)) {
          checkAndScore(rowPairCardsaboveRow, 2, 'Pair - Column');
        }

        // Check for Pair belowRow (two cards with the same rank)
        const rowPairCardsbelowRow = [belowRow !== null ? this.grid[belowRow][col] : null];

        if (!rowPairCardsbelowRow.some(card => card === null || card === undefined)) {
          checkAndScore(rowPairCardsbelowRow, 2, 'Pair - Column');
        }


}


logNeighboringCards_checkFlush(row, col, currentPlayerIndex) {
  const placedCard = this.grid[row][col];
    const leftColumn = col - 1 >= 0 ? col - 1 : null;
    const rightColumn = col + 1 < this.grid[0].length ? col + 1 : null;
    const aboveRow = row - 1 >= 0 ? row - 1 : null;
    const belowRow = row + 1 < this.grid.length ? row + 1 : null;

 
// Function to check for flush of 5 cards
const checkFlushOf5 = (cards, score, reason) => {
  let suitCounts = {};
  let hasFlushOf5 = false;

  for (let card of cards) {
      if (card !== null && card !== 'FaceDown') {
          const suit = card.suit;
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;

          if (suitCounts[suit] === 5) {
              hasFlushOf5 = true;
              break;
          }
      }
  }

  // Include the suit of the placed card in the count
  if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.suit !== undefined) {
      const placedCardSuit = placedCard.suit;
      suitCounts[placedCardSuit] = (suitCounts[placedCardSuit] || 0) + 1;

      if (suitCounts[placedCardSuit] === 5) {
          hasFlushOf5 = true;
      }
  }

  if (hasFlushOf5) {
      console.log(`Player ${currentPlayerIndex + 1} - ${reason}`);
      this.addScore(currentPlayerIndex, score, reason);
      return true;
  }

  return false;
};

// Function to check for flush of 4 cards
const checkFlushOf4 = (cards, score, reason) => {
  let suitCounts = {};
  let hasFlushOf4 = false;

  for (let card of cards) {
      if (card !== null && card !== 'FaceDown') {
          const suit = card.suit;
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;

          if (suitCounts[suit] === 4) {
              hasFlushOf4 = true;
              break;
          }
      }
  }

  // Include the suit of the placed card in the count
  if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.suit !== undefined) {
      const placedCardSuit = placedCard.suit;
      suitCounts[placedCardSuit] = (suitCounts[placedCardSuit] || 0) + 1;

      if (suitCounts[placedCardSuit] === 4) {
          hasFlushOf4 = true;
      }
  }

  if (hasFlushOf4) {
      console.log(`Player ${currentPlayerIndex + 1} - ${reason}`);
      this.addScore(currentPlayerIndex, score, reason);
      return true;
  }

  return false;
};

// Function to check for flush of 3 cards
const checkFlushOf3 = (cards, score, reason) => {
  let suitCounts = {};
  let hasFlushOf3 = false;

  for (let card of cards) {
      if (card !== null && card !== 'FaceDown') {
          const suit = card.suit;
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;

          if (suitCounts[suit] === 3) {
              hasFlushOf3 = true;
              break;
          }
      }
  }

  // Include the suit of the placed card in the count
  if (placedCard !== null && placedCard !== 'FaceDown' && placedCard.suit !== undefined) {
      const placedCardSuit = placedCard.suit;
      suitCounts[placedCardSuit] = (suitCounts[placedCardSuit] || 0) + 1;

      if (suitCounts[placedCardSuit] === 3) {
          hasFlushOf3 = true;
      }
  }

  if (hasFlushOf3) {
      console.log(`Player ${currentPlayerIndex + 1} - ${reason}`);
      this.addScore(currentPlayerIndex, score, reason);
      return true;
  }


  return false;
};
 

// Check for Flush of 5 - left
const rowFlush5Left = [
  leftColumn !== null ? this.grid[row][leftColumn] : null,
  leftColumn !== null && leftColumn - 1 >= 0 ? this.grid[row][leftColumn - 1] : null,
  leftColumn !== null && leftColumn - 2 >= 0 ? this.grid[row][leftColumn - 2] : null,
  leftColumn !== null && leftColumn - 3 >= 0 ? this.grid[row][leftColumn - 3] : null,  
];

// Check for Flush of 4 - left
const rowFlush4Left = [
  leftColumn !== null ? this.grid[row][leftColumn] : null,
  leftColumn !== null && leftColumn - 1 >= 0 ? this.grid[row][leftColumn - 1] : null,
  leftColumn !== null && leftColumn - 2 >= 0 ? this.grid[row][leftColumn - 2] : null,
];

// Check for Flush of 4 - left
const rowFlush3Left = [
  leftColumn !== null ? this.grid[row][leftColumn] : null,
  leftColumn !== null && leftColumn - 1 >= 0 ? this.grid[row][leftColumn - 1] : null,  
];
// Using JSON.stringify to log the properties
// console.log('rowFlush5Left:', rowFlush5Left.map(card => JSON.stringify(card)));

// Check for Flush of 5 - right
const rowFlush5Right = [
  rightColumn !== null ? this.grid[row][rightColumn] : null,
  rightColumn !== null && rightColumn + 1 < this.grid[0].length ? this.grid[row][rightColumn + 1] : null,
  rightColumn !== null && rightColumn + 2 < this.grid[0].length ? this.grid[row][rightColumn + 2] : null,
  rightColumn !== null && rightColumn + 3 < this.grid[0].length ? this.grid[row][rightColumn + 3] : null,  
];

// Check for Flush of 4 - right
const rowFlush4Right = [
  rightColumn !== null ? this.grid[row][rightColumn] : null,
  rightColumn !== null && rightColumn + 1 < this.grid[0].length ? this.grid[row][rightColumn + 1] : null,
  rightColumn !== null && rightColumn + 2 < this.grid[0].length ? this.grid[row][rightColumn + 2] : null,  
];

// Check for Flush of 3 - right
const rowFlush3Right = [
  rightColumn !== null ? this.grid[row][rightColumn] : null,
  rightColumn !== null && rightColumn + 1 < this.grid[0].length ? this.grid[row][rightColumn + 1] : null,
];

// Using JSON.stringify to log the properties
// console.log('rowFlush5Right:', rowFlush5Right.map(card => JSON.stringify(card)));

// Check for Flush of 5 - above
const rowFlush5Above = [
  aboveRow !== null ? this.grid[aboveRow][col] : null,
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,
  aboveRow !== null && aboveRow - 2 >= 0 ? this.grid[aboveRow - 2][col] : null,
  aboveRow !== null && aboveRow - 3 >= 0 ? this.grid[aboveRow - 3][col] : null,  
];

// Check for Flush of 4 - above
const rowFlush4Above = [
  aboveRow !== null ? this.grid[aboveRow][col] : null,
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,
  aboveRow !== null && aboveRow - 2 >= 0 ? this.grid[aboveRow - 2][col] : null,  
];

// Check for Flush of 3 - above
const rowFlush3Above = [
  aboveRow !== null ? this.grid[aboveRow][col] : null,
  aboveRow !== null && aboveRow - 1 >= 0 ? this.grid[aboveRow - 1][col] : null,  
];

// Using JSON.stringify to log the properties
// console.log('rowFlush5Above:', rowFlush5Above.map(card => JSON.stringify(card)));

// Check for Flush of 5 - below
const rowFlush5Below = [  
  belowRow !== null ? this.grid[belowRow][col] : null,
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,
  belowRow !== null && belowRow + 2 < this.grid.length ? this.grid[belowRow + 2][col] : null,
  belowRow !== null && belowRow + 3 < this.grid.length ? this.grid[belowRow + 3][col] : null,  
];

// Check for Flush of 4 - below
const rowFlush4Below = [  
  belowRow !== null ? this.grid[belowRow][col] : null,
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,
  belowRow !== null && belowRow + 2 < this.grid.length ? this.grid[belowRow + 2][col] : null,  
];

// Check for Flush of 3 - below
const rowFlush3Below = [  
  belowRow !== null ? this.grid[belowRow][col] : null,
  belowRow !== null && belowRow + 1 < this.grid.length ? this.grid[belowRow + 1][col] : null,  
];

// Using JSON.stringify to log the properties
// console.log('rowFlush5Below:', rowFlush5Below.map(card => JSON.stringify(card)));

// Check for Flush of 5 - left
if (!checkFlushOf5(rowFlush5Left, 5, 'Flush of 5 - Left')) {
  // If no Flush of 5 are found, check for Flush of 4
  if (!checkFlushOf4(rowFlush4Left, 4, 'Flush of 4 - Left')) {
      // If no Flush of 4 are found, check for Flush of 3
      checkFlushOf3(rowFlush3Left, 3, 'Flush of 3 - Left');
  }
}


// Check for Flush of 5 - Right
if (!checkFlushOf5(rowFlush5Right, 5, 'Flush of 5 - Right')) {
  // If no Flush of 5 are found, check for Flush of 4
  if (!checkFlushOf4(rowFlush4Right, 4, 'Flush of 4 - Right')) {
      // If no Flush of 4 are found, check for Flush of 3
      checkFlushOf3(rowFlush3Right, 3, 'Flush of 3 - Right');
  }
}


// Check for Flush of 5 - Above
if (!checkFlushOf5(rowFlush5Above, 5, 'Flush of 5 - Above')) {
  // If no Flush of 5 are found, check for Flush of 4
  if (!checkFlushOf4(rowFlush4Above, 4, 'Flush of 4 - Above')) {
      // If no Flush of 4 are found, check for Flush of 3
      checkFlushOf3(rowFlush3Above, 3, 'Flush of 3 - Above');
  }
}

// Check for Flush of 5 - left
if (!checkFlushOf5(rowFlush5Below, 5,'Flush of 5 - Below')) {
  // If no Flush of 5 are found, check for Flush of 4
  if (!checkFlushOf4(rowFlush4Below, 4, 'Flush of 4 - Below')) {
      // If no Flush of 4 are found, check for Flush of 3
      checkFlushOf3(rowFlush3Below, 3, 'Flush of 3 - Below');
  }
}

}

addScore(playerIndex, score, reason) {
  // Add the score to the totalScore for the specified player
  this.totalScore_variant_as_you_go[playerIndex] += score;
  console.log(`Player ${playerIndex + 1} - Score added: ${score} - Reason: (${reason}), Total Score: ${this.totalScore_variant_as_you_go[playerIndex]}`);
}


      placeCardInSpiral(card) {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
        let row = Math.floor(this.grid.length / 2);
        let col = Math.floor(this.grid[0].length / 2);
        let steps = 1;
        let stepCount = 0;
        let directionIndex = 0;
        const originalGrid = this.grid.map(row => row.slice());

        while (card) {
            if (this.isValidPosition(row, col) && this.grid[row][col] === 'FaceDown') {
              if (this.playScoringAsYouGo) {
                //this.grid[row][col] = card;
                let placedCardIndex = this.grid[row].indexOf(card);


                this.grid[row][col] = { rank: card.rank, suit: card.suit };

                console.log(`Debug - Placed Card: ${JSON.stringify({ rank: card.rank, suit: card.suit })}`);
                console.log(`Debug - Card Position: ${JSON.stringify({ row, col })}`);           

                this.logNeighboringCards(row, col, this.currentPlayerIndex); // Pass currentPlayerIndex to the method
                this.logNeighboringCards_checkRuns(row, col, this.currentPlayerIndex);
                this.logNeighboringCards_checkFlush(row, col, this.currentPlayerIndex);
                // let get_row = this.checkRuns(this.grid[row]);
                // let get_col = this.checkRuns(this.grid[row][col]);

                // console.log(`get_row: ${get_row} + ${this.grid[row]}`);
                // console.log(`get_col: ${get_col} + ${this.grid[col]}`);


                //this.grid[row][col] = card;

                // Display total scores of each player
                console.log(`Player 1 - Total Score: ${this.totalScore_variant_as_you_go[0]}`);
                console.log(`Player 2 - Total Score: ${this.totalScore_variant_as_you_go[1]}`);
              }
              this.grid[row][col] = card;


                 // Reset the grid to the original state
                //this.grid = originalGrid.map(row => row.slice());
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

            //console.log(`row ${row} col ${col}`);   
             // Check if the game is over
            if (row === 0 && col === 5 && this.playScoringAsYouGo) {
              this.playScoringAsYouGo_lastRound = true;
          }         
        }
    }

    displayWinner() {
      const player1Score = this.totalScore_variant_as_you_go[0];
      const player2Score = this.totalScore_variant_as_you_go[1];
  
      console.log(`Player 1 - Total Score: ${player1Score}`);
      console.log(`Player 2 - Total Score: ${player2Score}`);
  
      if (player1Score > player2Score) {
          console.log(`Game Over! Player 1 wins!`);
      } else if (player2Score > player1Score) {
          console.log(`Game Over! Player 2 wins!`);
      } else {
          console.log(`Game Over! It's a tie!`);
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
  