let showSection = 'one';
const SECTIONS = {
    one: 'one',
    two: 'two'
}
const THEME = {
    light: 0,
    dark: 1
}
const SCORE_COUNT_PROCESS = {
    throw: 'onThrow',
    end: 'atEnd'
}
const DIRECTIONS = {
    right:[0, 1],
    down: [1, 0],
    left: [0, -1],
    up: [-1, 0]
};
const USER = {
    pc: 'pc',
    person: 'person'
}
const DEALER = {
    player1: 'player1',
    player2: 'player2'
}
const SAMPLE_STRING  = '2345678910JQKA';

let isSoundEnabled = true;
let sound;

let countdown;
let countdownSeconds = 30;

let userScore = 0;
let pcScore = 0;
let dealer = false;
let currentPlayer = DEALER.player1;
let scoreCountEnd = localStorage.getItem('scoreCountSelect') === SCORE_COUNT_PROCESS.end;
const spiralArr = [13, 18, 17, 16, 11, 6, 7, 8, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5, 0, 1, 2, 3, 4];
const spiral2DArr = [
    [2, 2], [2, 3], [3, 3], [3, 2], [3, 1],
    [2, 1], [1, 1], [1, 2], [1, 3], [1, 4],
    [2, 4], [3, 4], [4, 4], [4, 3], [4, 2],
    [4, 1], [4, 0], [3, 0], [2, 0], [1, 0],
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
];

const cardsArr = createAndShuffleDeck();
const scoreCardsArr = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];


function toggleSound() {
    isSoundEnabled = !isSoundEnabled; 
    if (isSoundEnabled) {
        document.getElementById('soundToggleBtn').innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
    } else {
        document.getElementById('soundToggleBtn').innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
    }
}

document.getElementById('soundToggleBtn').addEventListener('click', function() {
    toggleSound();
});

function pageInit() {
    clearData();
    hideShowSection(SECTIONS.one);
    setTheme();
    $('.scores').hide();
    $('#restartBtn').hide();

    $("#themeChangeBtn").click(function () {
        $('body').toggleClass('dark');
        const theme = JSON.parse(localStorage.getItem('theme'));
        if(theme === THEME.light){
            localStorage.setItem('theme', THEME.dark);
        }else{
            localStorage.setItem('theme', THEME.light);
        }
        setTheme();
    });
}

function saveGameSettings() {
    let playerNameField = document.getElementById('playerName');
    let playerName = document.getElementById('playerName').value;
    if (playerName === '') {
        document.getElementById('nameError').classList.add('show');
        playerNameField.classList.add('is-invalid')
        return;
    }
    let dealerSelect = document.getElementById('dealerSelect').value;
    let scoreCountSelect = document.getElementById('scoreCountSelect').value;

    // Save values to localStorage
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('dealerSelect', dealerSelect);
    localStorage.setItem('scoreCountSelect', scoreCountSelect);
    $("#gameSettingsModal").modal("hide");
    if (scoreCountSelect === SCORE_COUNT_PROCESS.throw) {
        $('.scores').show();
    }
    hideShowSection(SECTIONS.two);
}




function makeGrid() {
    const playerName = localStorage.getItem('playerName');
    document.getElementById('name').innerHTML = playerName;
    dealer = localStorage.getItem('dealerSelect') === 'player1';
    currentPlayer = localStorage.getItem('dealerSelect');
    scoreCountEnd = localStorage.getItem('scoreCountSelect') === SCORE_COUNT_PROCESS.end;
    if (localStorage.getItem('scoreCountSelect') === SCORE_COUNT_PROCESS.throw) {
        $('.scores').show();
    }

    if (isSoundEnabled) {
        const sound_shuffle = new Audio('sounds/shuffle-cards.mp3');
        sound_shuffle.play();
    }

    const grid = document.querySelector('.card-grid-inner');
    let str = ''
    for (let i = 1; i <= 25; i++) {
        str += `
        <div class="card-face-down">
            <img src="images/facedown.jpg"/>
        </div>
        `
    }
    grid.innerHTML = str;

    makePlayerCardGrid(cardsArr.slice(0, 13), '.user-cards')
    makePlayerCardGrid(cardsArr.slice(13, 26), '.pc-cards', true)
    setDealerClass()
    selectCenterCard()
    checkDealer()
    startCountdown();

     // Add a class to the next card after shifting
     const nextCardIndex = spiralArr[0];
     const nextCard = document.querySelectorAll('.card-face-down')[nextCardIndex];   
     nextCard.classList.add('next-move');
}

function makePlayerCardGrid(array, id, isFaceDown) {
    let str = '';
    array.forEach((item) => {
        str += `
            <div class="card-image ${isFaceDown ? 'pc':'user'}" onclick="removeCard(this, '${item}')">
                <img src="cards/${isFaceDown ? 'facedown.jpg' : item + '.svg'}"/>
            </div>
            `;
    });
    document.querySelector(id).innerHTML = str;
}



function removeCard(element, item) {
    if (!element.parentNode.classList.contains('active')) {        
        alert("It's not your turn");
        return;
    }

    if (isSoundEnabled) {
        const sound_flipcard = new Audio('sounds/flipcard.mp3');
        sound_flipcard.play();
        }

    resetCountdown();

    const currentCard = document.querySelectorAll('.card-face-down')[spiralArr.shift()];
    const position = spiral2DArr.shift();
    scoreCardsArr[position[0]][position[1]] = item;
    const currentCardImg = currentCard.querySelector('img')
    currentCardImg.src = `cards/${item}.svg`;

    if(spiral2DArr.length) {
    // Remove next-move class from all cards
    document.querySelectorAll('.card-face-down').forEach(card => {
        card.classList.remove('next-move');
    });

    // Add a class to the next card after shifting
    const nextCardIndex = spiralArr[0];
    const nextCard = document.querySelectorAll('.card-face-down')[nextCardIndex];   
    nextCard.classList.add('next-move');
    }else{
        document.querySelectorAll('.card-face-down').forEach(card => {
            card.classList.remove('next-move');
        });
    }

 

    element.parentNode.removeChild(element);
    dealer = !dealer;
    setDealerClass()
    if (!dealer) {
        setTimeout(() => {
            const pcCards = document.querySelector('.pc-cards');
            const pcCard = pcCards.querySelector('.card-image');
            const event = new Event('click');
            if(pcCard !== null)
            pcCard.dispatchEvent(event);
        }, 1000);
    }

    if(scoreCountEnd){
        if (!spiral2DArr.length) {
            calculateScoreAtEnd();
        }
    } else {
        if(element.classList.contains('pc')){
            calculateScore(position[0], position[1], USER.pc);
        }else {
            calculateScore(position[0], position[1], USER.user);
        }
    }

    if(!spiral2DArr.length) {
        $('#scoreBtn').hide();
        $('#restartBtn').show();
        if (pcScore > userScore) {
            $('#pcScore').addClass('winner');
        } else if (userScore > pcScore) {
            $('#userScore').addClass('winner');
        } else {
            $('.scores').addClass('winner');
        }
        showConfetti();
    }
}


// Function to create and shuffle a deck of cards
function createAndShuffleDeck() {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    // Create a deck of cards
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(`${rank}${suit}`);
        }
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function selectCenterCard() {
    document.querySelectorAll('.card-face-down')[12].innerHTML = `<img src="cards/${cardsArr[50]}.svg"/>`
    const position = spiral2DArr.shift();
    scoreCardsArr[position[0]][position[1]] = cardsArr[50];
}


function setDealerClass() {
    const cardsLength = document.querySelectorAll('.card-image').length
    if (cardsLength === 0) {
        document.querySelector('.pc-cards')?.classList.remove('active')
        document.querySelector('.user-cards')?.classList.remove('active')
        return
    }
    if (dealer) {
        document.querySelector('.user-cards')?.classList.add('active')
        document.querySelector('.pc-cards')?.classList.remove('active')
    } else {
        document.querySelector('.pc-cards')?.classList.add('active')
        document.querySelector('.user-cards')?.classList.remove('active')
    }
}



/*================  CALLS  ===================*/
pageInit();
/*================  CALLS ENDS  ===================*/

/*================   UTITILIY FUNCTIONS   ===================*/
function checkDealer() {
    if (!dealer) {
        setTimeout(() => {
            const pcCards = document.querySelector('.pc-cards');
            const pcCard = pcCards.querySelector('.card-image');
            const event = new Event('click');
            pcCard.dispatchEvent(event);
        }, 1000)
    }
}

function showHideError() {
    const name = document.getElementById('playerName');
    if (name.value === '') {
        document.getElementById('nameError').classList.add('show')
        name.classList.add('is-invalid');
    } else {
        name.classList.remove('is-invalid');
        document.getElementById('nameError').classList.remove('show');
    }
}

function hideShowSection(showSection) {
    if (showSection === 'one') {
        document.getElementById('landingPage').style.display = 'flex';
        document.getElementById('gridContainer').style.display = 'none';
    } else if (showSection === 'two') {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('gridContainer').style.display = 'block';
        makeGrid();
    }
}

function clearData() {
    localStorage.removeItem('playerName');
    localStorage.removeItem('dealerSelect');
    localStorage.removeItem('scoreCountSelect');
}

function setTheme(){
    const theme = JSON.parse(localStorage.getItem('theme'));
    if (theme === THEME.light || theme == null) {
        $('body').removeClass('dark');
    } else {
        $('body').addClass('dark');
    }
}

function setScore(){
        $('#userScore').html(userScore);
        $('#pcScore').html(pcScore);
}

/* =========== SCORES CALCULATION =========== */
function calculateScore(row, col, type) {
    let score = 0;


    let prialScore = isPrial(row, col, scoreCardsArr);
    if (prialScore > 0) {
        score = prialScore;
    } else {
        score += isPair(row, col, scoreCardsArr);
    }

    // Check for sequence
    score += getSequenceScore(row, col, scoreCardsArr);

    // Check for flush
    score += getFlushScore(row, col, scoreCardsArr);

    type === USER.pc ? pcScore += score : userScore += score;
    // console.log('PC Score', pcScore);
    // console.log('User Score', userScore);
    setScore();
}


// 0:(5) ['JH', 'KS', 'AD', '2D', '2C']
// 1:(5) ['5S', '5C', '8H', '7D', 'QH']
// 2:(5) ['3H', 'KC', '10S', '8D', 'JS']
// 3:(5) ['8S', '10C', 'KD', 'AS', '10D']
// 4:(5) ['7S', '10H', '8C', '6D', '7H']

function isPair(row, col, grid) {
    let score = 0;

    // Get the value of the current card
    let currentValue = grid[row][col].slice(0, -1); // Remove the last character (category)

    // Check left
    if (col > 0) {
        let leftValue = grid[row][col - 1].slice(0, -1);
        if (leftValue === currentValue) {
            score += 2;
        }
    }

    // Check right
    if (col < grid[0].length - 1) {
        let rightValue = grid[row][col + 1].slice(0, -1);
        if (rightValue === currentValue) {
            score += 2;
        }
    }

    // Check top
    if (row > 0) {
        let topValue = grid[row - 1][col].slice(0, -1);
        if (topValue === currentValue) {
            score += 2;
        }
    }

    // Check bottom
    if (row < grid.length - 1) {
        let bottomValue = grid[row + 1][col].slice(0, -1);
        if (bottomValue === currentValue) {
            score += 2;
        }
    }

    return score;
}

function isPrial(row, col, grid) {
    let score = 0;

    // Get the value of the current card
    let currentValue = grid[row][col].slice(0, -1); // Remove the last character (category)

    // Check left
    if (col > 1) {
        let left1Value = grid[row][col - 1].slice(0, -1);
        let left2Value = grid[row][col - 2].slice(0, -1);
        if (left1Value === currentValue && left2Value === currentValue) {
            score += 6;
        }
    }

    // Check right
    if (col < grid[0].length - 2) {
        let right1Value = grid[row][col + 1].slice(0, -1);
        let right2Value = grid[row][col + 2].slice(0, -1);
        if (right1Value === currentValue && right2Value === currentValue) {
            score += 6;
        }
    }

    // Check top
    if (row > 1) {
        let top1Value = grid[row - 1][col].slice(0, -1);
        let top2Value = grid[row - 2][col].slice(0, -1);
        if (top1Value === currentValue && top2Value === currentValue) {
            score += 6;
        }
    }

    // Check bottom
    if (row < grid.length - 2) {
        let bottom1Value = grid[row + 1][col].slice(0, -1);
        let bottom2Value = grid[row + 2][col].slice(0, -1);
        if (bottom1Value === currentValue && bottom2Value === currentValue) {
            score += 6;
        }
    }

    return score;
}

function getSequenceScore(row, col, grid) {
    let score = 0;

    // Get the suit of the card placed in the grid
    const placedCardSuit = grid[row][col].slice(-1);

    // Get the row and column where the card is placed
    const rowValues = grid[row].map(card => card.slice(-1));
    const colValues = grid.map(row => row[col].slice(-1));

    // Check if there are at least 3 cards with the same suit in the row or column
    const countSameSuitInRow = rowValues.filter(suit => suit === placedCardSuit).length;
    const countSameSuitInCol = colValues.filter(suit => suit === placedCardSuit).length;

    // Add points for runs of 3, 4, or 5 in the row or column
    if (countSameSuitInRow >= 3) {
        score += countSameSuitInRow;
    }
    if (countSameSuitInCol >= 3) {
        score += countSameSuitInCol;
    }

    return score;
}


// function getSequenceScore(row, col, grid) {
//     let score = 0;

//     // Get the values of the current card and its adjacent cards
//     // let currentValue = grid[row][col].slice(0, -1); // Remove the last character (category)
//     // let left1Value = col > 0 ? grid[row][col - 1].slice(0, -1) : null;
//     // let left2Value = col > 1 ? grid[row][col - 2].slice(0, -1) : null;
//     // let right1Value = col < grid[0].length - 1 ? grid[row][col + 1].slice(0, -1) : null;
//     // let right2Value = col < grid[0].length - 2 ? grid[row][col + 2].slice(0, -1) : null;
//     // let top1Value = row > 0 ? grid[row - 1][col].slice(0, -1) : null;
//     // let top2Value = row > 1 ? grid[row - 2][col].slice(0, -1) : null;
//     // let bottom1Value = row < grid.length - 1 ? grid[row + 1][col].slice(0, -1) : null;
//     // let bottom2Value = row < grid.length - 2 ? grid[row + 2][col].slice(0, -1) : null;

//     let rowValues = [];
//     let colValues = [];


//     for (let i = 0; i < grid.length; i++) {
//         colValues.push(grid[i][col].slice(0, -1));
//         rowValues.push(grid[row][i].slice(0, -1));
//     }

//     rowValues = rowValues.filter(e => e !== '').sort(function(a, b) {
//         return cardValue(a) - cardValue(b);
//     });
//     colValues = colValues.filter(e => e !== '').sort(function(a, b) {
//         return cardValue(a) - cardValue(b);
//     });

//     const rowStr = rowValues.join('');
//     const colStr = colValues.join('');

// console.log(rowStr);
// console.log(colStr);
// console.log('**********');

//     if(SAMPLE_STRING.includes(rowStr)) {
//         score += rowValues.length >= 3 ? rowValues.length : 0;
//     }
//     if(SAMPLE_STRING.includes(colStr)) {
//         score += colValues.length >= 3 ? colValues.length : 0;
//     }

//     return score;
// }

function getFlushScore(row, col, grid) {
    let score = 0;

    function allCharactersSame(str) {
        for (let i = 1; i < str.length; i++) {
            if (str[i] !== str[0]) {
                return false;
            }
        }
        return true;
    }

    let rowValues = [];
    let colValues = [];

    for (let i = 0; i < grid.length; i++) {
        colValues.push(grid[i][col].charAt(grid[i][col].length - 1));
        rowValues.push(grid[row][i].charAt(grid[row][i].length - 1));
    }

    rowValues = rowValues.filter(e => e !== '')
    colValues = colValues.filter(e => e !== '')

    const rowStr = rowValues.join('');
    const colStr = colValues.join('');

    if(rowStr.length >= 3) {
        score += allCharactersSame(rowStr) ? rowStr.length : 0;
    }
    if(colStr.length >= 3) {
        score += allCharactersSame(colStr) ? colStr.length : 0;
    }
    // console.log('row',rowStr)
    // console.log('col',colStr)

    return score;
}


function sortDeckCards(cards) {
    // console.log(cards);
    const sortedCards = JSON.parse(JSON.stringify(cards));
    return sortedCards.sort(function(a, b) {
        return cardValue(a) - cardValue(b);
    })
}

function cardValue(card) {
    if (card === 'A') {
        return 14; // Ace has the highest value
    } else if (card === 'K') {
        return 13;
    } else if (card === 'Q') {
        return 12;
    } else if (card === 'J') {
        return 11;
    } else {
        return card;
    }
}

/*============== CALCULATE SCORES AT END =============== */
function calculateScoreAtEnd() {

    const flushScore = getFlushScoreEnd(scoreCardsArr);
    const pairAndPrialScore = getPairAndPrialScoreEnd(scoreCardsArr);
    const sequenceScore = getSequenceScoreEnd(scoreCardsArr);

    console.log(flushScore);
    console.log(pairAndPrialScore);
    console.log(sequenceScore);

    if (currentPlayer === DEALER.player1) {
        // debugger;
        userScore += flushScore.colScore;
        pcScore += flushScore.rowScore;
        userScore += pairAndPrialScore.colScore;
        pcScore += pairAndPrialScore.rowScore;
        userScore += sequenceScore.colScore;
        pcScore += sequenceScore.rowScore;
    } else {
        // debugger
        userScore += flushScore.rowScore;
        pcScore += flushScore.colScore;
        userScore += pairAndPrialScore.rowScore;
        pcScore += pairAndPrialScore.colScore;
        userScore += sequenceScore.rowScore;
        pcScore += sequenceScore.colScore;
    }
     // === USER.pc ? pcScore += score : userScore += score;
    // console.log('PC Score', pcScore);
    // console.log('User Score', userScore);
    $('.scores').show();
    setScore();
    showConfetti();
}

function showConfetti(){
    var confettiSettings = {"target":"my-canvas","max":"500","size":"2","animate":true,"props":["circle","square","triangle","line"],"colors":[[165,104,246],[230,61,135],[0,199,228],[253,214,126]],"clock":"25","rotate":true,"width":"1920","height":"945","start_from_edge":true,"respawn":true};
    var confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    if (isSoundEnabled) {
        const sound_confetti = new Audio('sounds/tadaa.mp3');
        sound_confetti.play();
    }
    document.querySelectorAll('.player-card-grid').forEach(card => {
        card.classList.remove('active');
    });
    clearInterval(countdown);
    document.getElementById('countdown-clock').textContent = '00';
    $('.countdown-clock').removeClass('alert-warning');
    $('.countdown-clock').removeClass('add-alert-animation');
    document.querySelectorAll('.card-face-down').forEach(card => {
        card.classList.remove('next-move');
    });

}

function getSequenceScoreEnd(grid) {
    const scores = {
        rowScore: 0,
        colScore: 0
    }
    let firstCharArr = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];

    function isSequence(cards) {
        const elements = JSON.parse(JSON.stringify(cards));
        // console.log(elements)
        const pattern5 = sortDeckCards([...elements]).join('');
        const pattern4A = sortDeckCards(elements.slice(0, -1)).join('');
        const pattern4B = sortDeckCards(elements.slice(1)).join('');
        const pattern3A = sortDeckCards(elements.slice(0, 3)).join('');
        const pattern3B = sortDeckCards(elements.slice(1, 4)).join('');
        const pattern3C = sortDeckCards(elements.slice(2, 5)).join('');

        // console.log('Pattern5 = ', pattern5);
        // console.log('Pattern4A = ', pattern4A);
        // console.log('Pattern4B = ', pattern4B);
        // console.log('Pattern3A = ', pattern3A);
        // console.log('Pattern3B = ', pattern3B);
        // console.log('Pattern3C = ', pattern3C);

        const sequence5Exist = SAMPLE_STRING.includes(pattern5);

        if(!sequence5Exist) {
            const sequence4Exist = SAMPLE_STRING.includes(pattern4A) || SAMPLE_STRING.includes(pattern4B);

            if (!sequence4Exist) {
                const sequence3Exist = SAMPLE_STRING.includes(pattern3A) || SAMPLE_STRING.includes(pattern3B) || SAMPLE_STRING.includes(pattern3C);
                if(!sequence3Exist) {
                    // console.log(0);
                    return 0;
                } else {
                    return 3;
                }
            } else {
                // console.log(4);
                return 4;
            }
        } else {
            // console.log(5)
            return 5;
        }

    }

    for (let i=0; i<5; i++) {
        for (let j=0; j<5; j++) {
            firstCharArr[i][j] = scoreCardsArr[i][j].slice(0, - 1);
        }
    }

    for (let i=0; i<5; i++) {
        let arrRow = [];
        let arrCol = [];
        for (let j=0; j<5; j++) {
            arrRow.push(firstCharArr[i][j]);
            arrCol.push(firstCharArr[j][i]);
        }
        scores.rowScore += isSequence(arrRow);
        scores.colScore += isSequence(arrCol);
    }

    // for (let i=0; i<5; i++) {
    //     let repeatedRow = 1;
    //     let repeatedCol = 1;
    //     for (let j=0; j<4; j++) {
    //         if (firstCharArr[i][j] === firstCharArr[i][j + 1]) {
    //             repeatedRow++;
    //         }
    //         if (firstCharArr[j][i] === firstCharArr[j + 1][i]) {
    //             repeatedCol++;
    //         }
    //     }
    //
    //     repeatedRow >= 3 ? score += repeatedRow : score = score;
    //     repeatedCol >= 3 ? score += repeatedCol : score = score;
    //     // console.log('Repeated Row', repeatedRow);
    //     // console.log('Repeated Col', repeatedCol);
    // }

    // console.log(firstCharArr);
    return scores;
}

function getPairAndPrialScoreEnd(grid) {
    let rowScore = 0;
    let colScore = 0;
    let firstCharArr = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];

    for (let i=0; i<5; i++) {
        for (let j=0; j<5; j++) {
            firstCharArr[i][j] = scoreCardsArr[i][j].slice(0, - 1);
        }
    }

    // console.log(firstCharArr);

    for (let i=0; i<5; i++) {
        let repeatedRow = 1;
        let repeatedCol = 1;
        for (let j=0; j<4; j++) {
            if (firstCharArr[i][j] === firstCharArr[i][j + 1]) {
                repeatedRow++;
            } else {
                repeatedRow === 3 ? rowScore += 3 : repeatedRow === 2 ? rowScore += 2 : '';
                repeatedRow = 1;
            }
            if (firstCharArr[j][i] === firstCharArr[j + 1][i]) {
                repeatedCol++;
            } else {
                repeatedCol === 3 ? colScore += 3 : repeatedCol === 2 ? colScore += 2 : '';
                repeatedCol = 1;
            }
        }

        // console.log(`Row ${i + 1} = `, repeatedRow);
        // console.log(`Col ${i + 1} = `, repeatedCol);
        repeatedRow >= 2 ? rowScore += repeatedRow : rowScore = rowScore;
        repeatedCol >= 2 ? colScore += repeatedCol : colScore = colScore;
    }

    return {
        rowScore: rowScore,
        colScore: colScore
    };
}
function getFlushScoreEnd(grid) {
    let rowScore = 0;
    let colScore = 0;
    let firstCharArr = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];

    for (let i=0; i<5; i++) {
        for (let j=0; j<5; j++) {
            firstCharArr[i][j] = grid[i][j].charAt(grid[i][j].length - 1);
        }
    }

    for (let i=0; i<5; i++) {
        let repeatedRow = 1;
        let repeatedCol = 1;
        for (let j=0; j<4; j++) {
            if (firstCharArr[i][j] === firstCharArr[i][j + 1]) {
                repeatedRow++;
            } else {
                repeatedRow < 3 ? repeatedRow = 1 : '';
            }
            if (firstCharArr[j][i] === firstCharArr[j + 1][i]) {
                repeatedCol++;
            } else {
                repeatedCol < 3 ? repeatedCol = 1 : '';
            }
        }

        repeatedRow >= 3 ? rowScore += repeatedRow : rowScore = rowScore;
        repeatedCol >= 3 ? colScore += repeatedCol : colScore = colScore;
    }

    return {
        rowScore: rowScore,
        colScore: colScore
    };
}
/*============== CALCULATE SCORES AT END =============== */

function restartGame() {
    window.location.reload();
}




function startCountdown() {
    countdown = setInterval(updateCountdown, 1000); // Update countdown every second
}

function updateCountdown() {
    countdownSeconds--; // Decrease countdown seconds
    if(countdownSeconds < 10 ){
        document.getElementById('countdown-clock').textContent = '0' + countdownSeconds; // Update countdown display
        $('.countdown-clock').addClass('alert-warning');        
    }else{
        document.getElementById('countdown-clock').textContent = countdownSeconds; // Update countdown display
    }

    if(countdownSeconds < 6 ) {
        $('.countdown-clock').addClass('add-alert-animation');
        if (isSoundEnabled) {
            const sound_alert = new Audio('sounds/alert.mp3');
            sound_alert.play();
        }        
    }

    if (countdownSeconds <= 0) {
        clearInterval(countdown); // Stop the countdown
        $('.countdown-clock').removeClass('alert-warning');
        moveAutomatically(); // Move to the next move automatically
    }
}

function resetCountdown() {
    clearInterval(countdown); // Stop the countdown
    countdownSeconds = 30; // Reset countdown time
    $('.countdown-clock').removeClass('alert-warning');
    $('.countdown-clock').removeClass('add-alert-animation');
    document.getElementById('countdown-clock').textContent = countdownSeconds; // Update countdown display
    startCountdown(); // Start countdown again
}
function moveAutomatically() {
    $('.user-cards .card-image:first').click();
   //removeCard();
}
