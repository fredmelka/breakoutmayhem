
// Import Export | Global Variables
import Paddle from './paddle.js';
import Ball from './ball.js';
import Box, { Brick } from './brick.js';
import { mapDiamond, mapFace, mapIsland, mapTest } from './map.js';;


// Game | Settings Singleton 
export const gameSettings = {
    _gameBoard: {width: 90, height: 90},  // expressed as {vw,vh} CSS units
    _gameMap: [],
    _ballSet: {src: '', size: 2.0, strength: 20, speed: 0.4}, // src is there in case we want to render the ball using either an emoji or an image
    _ballPerRound: 5,
    _paddle: {height: 12.0, width: 2.0, speed: 0.75},
    _opponents: {
        left:   {score: 0, lives: 0, isInPlay: false, ballsInPlay: []}, // ballsInPlay is set as array should the developer wants to allow multiple balls in play for each player
        right:  {score: 0, lives: 0, isInPlay: false, ballsInPlay: []}}
};

let gameAreaBorders, player1, player2;
    
// DOM | Principal Areas
export const gameArea = document.getElementById('gameArea');        // ADD addEventListener("resize", (event) => {}); TO KEEP GAME ZONE OK AND BALLS INSIDE WHILE RESIZING
const mainMenu = document.getElementById('mainMenu');
const dialogBox = document.getElementById('dialogBox');
const accordeon = document.getElementById('accordeon');

// Game | Create Scoreboard
const createScoreCards = () => {
Object.keys(gameSettings._opponents).forEach(opponent => {
    let scoreCard = document.createElement('span');
    scoreCard.classList.add('scoreCard', opponent);
    document.querySelector('main').appendChild(scoreCard);});
};

// Menu | Title Explosion effect
const explose = (id) => {
    let element = document.getElementById(id);
    let text = element.innerText.split('');
    element.innerText = '';
    text.forEach(letter => {
        let span = document.createElement(letter != ' ' ? 'span' : 'p');
        span.classList.add('explosive');
        span.innerText = letter; element.appendChild(span);});
};
explose('title');

// Game Controls | Keyboard listeners and mobile pointer events
const gameLauncher = document.getElementById('gamelaunch');
gameLauncher.addEventListener('click', gameStart, false)

const keyDown = document.addEventListener('keydown', keyDownHandler, false);
function keyDownHandler(event) {
    switch (event.key) {
    case 'q':
    case 'Q': player1.upPressed = true; break;
    case 'w':
    case 'W': player1.downPressed = true; break;
    case 'Up':
    case'ArrowUp': player2.upPressed = true; break;
    case 'Down':
    case 'ArrowDown': player2.downPressed = true; break;
    };
};

const keyUp = document.addEventListener('keyup', keyUpHandler, false);
function keyUpHandler(event) {
    switch (event.key) {
        case 'q':
        case 'Q': player1.upPressed = false; break;
        case 'w':
        case 'W': player1.downPressed = false; break
        case 'Up':
        case'ArrowUp': player2.upPressed = false; break;
        case 'Down':
        case 'ArrowDown': player2.downPressed = false; break;
    };
};

// Responsive Design | Event-listener for Mobile Device Control. Gets activated only when the game actually starts as the variable 'gameAreaBorders' is not yet defined
function touchScreenHandler(event) {
    
    let playerSide = event.clientX < (gameAreaBorders.left + gameAreaBorders.right) / 2 ? 'left' : 'right';
    let paddleY = gameSettings._gameBoard.height * Math.max(0, Math.min((event.clientY - gameAreaBorders.top) / gameAreaBorders.height, 1));
    let paddleOffsetTop = Math.max(0, Math.min(paddleY, gameSettings._gameBoard.height - gameSettings._paddle.height));
    switch (playerSide) {
        case 'left': player1.y = paddleOffsetTop; player1.setPosition(); break;
        case 'right': player2.y = paddleOffsetTop; player2.setPosition(); break;
    };
};

// Map | Game map builder
function loadMap(map) {

    let rowInterval = gameSettings._gameBoard.width / map.length;
    let columnInterval = gameSettings._gameBoard.height / map[0].length;

    for (let row in map) {
        for (let column in map[row]) {
            switch (map[row][column]) {
                case 'W': gameSettings._gameMap.push(new Box('wall', column * columnInterval, row * rowInterval)); break;
                case 'B': gameSettings._gameMap.push(new Brick('brick', column * columnInterval, row * rowInterval, 100)); break;
                default: break;
            };
        };
    };
};

// Game | Place a new ball in play until both players have no more lives to spend
function getInPlay() {

    let { _opponents: opponents} = gameSettings;

    for (let player in opponents) {

        if (opponents[player].isInPlay == false) {
            
            opponents[player].ballsInPlay.pop();

            if (opponents[player].lives > 0) {
                                
                opponents[player].lives -- ; opponents[player].isInPlay = true;
                opponents[player].ballsInPlay.push(new Ball (player, 40, 0, gameAreaBorders));
                document.querySelector('#music-new-ball').play();
            };
        };
    };

    return Object.values(opponents).every(player => player.ballsInPlay.length === 0)
};

// Game | Execute the ball move() method for all balls in play
function moveBalls() {
    for (let player in gameSettings._opponents) {
        for (let ball of gameSettings._opponents[player].ballsInPlay) {ball.move();}
    };
};

// Game | Execute the paddle move() method for a given player during game
function movePaddle(player) {
    if (player.upPressed) {player.moveUp();};
    if (player.downPressed) {player.moveDown();};
    player.setPosition();
};

// Ball | Collision Detection and Bouncing algorithm off obstacles
function collisionDetection (obstacle, ball) {

    let ballEdge = ball.element.getBoundingClientRect();
    let obstacleEdge = obstacle.element.getBoundingClientRect();

    let randomBounceFactor = (Math.random() - 0.5) * 0.75;

    let isInX =
            ballEdge.left < obstacleEdge.right &&
            ballEdge.right > obstacleEdge.left;
    let isInY = 
            ballEdge.bottom > obstacleEdge.top &&
            ballEdge.top < obstacleEdge.bottom;

    if (isInX && isInY) {
    
        let inOutAnalysis = {
            left: {
                entrance:  ballEdge.left < obstacleEdge.left ? ballEdge.right - obstacleEdge.left : 0,
                bounceEffect: function (ball) {ball.vector.x = -1 + randomBounceFactor;}
            },
            right: {
                entrance:  ballEdge.right > obstacleEdge.right ? obstacleEdge.right - ballEdge.left : 0,
                bounceEffect: function (ball) {ball.vector.x = +1 + randomBounceFactor;}
            },
            bottom: {    
                entrance: ballEdge.bottom > obstacleEdge.bottom ? obstacleEdge.bottom - ballEdge.top : 0,
                bounceEffect: function (ball) {ball.vector.y = +1 + randomBounceFactor;}
            },
            top: {
                entrance: ballEdge.top < obstacleEdge.top ? ballEdge.bottom - obstacleEdge.top : 0,
                bounceEffect: function (ball) {ball.vector.y = -1 + randomBounceFactor;}
            },
        };

        // console.log(ball.side, Object.entries(inOutAnalysis).map(x => [x[0], x[1].entrance]).filter(x => x[1] > 0));
        Object.values(inOutAnalysis).sort((a,b) => b.entrance - a.entrance).shift().bounceEffect(ball);
    };
    return (isInX && isInY);
};

// Game | Collide, Hit and Score!
function hitAndScore(ball) {

    if (!ball) {return;};

    // Set a radius around the ball to scan for collision detection and is expressed in viewport(v) css units 
    let radius = 5; 
    // Sub-function that returns a Boolean whether a given block and the ball are within radius distance
    let isWithinRadius = (block) => (((block.x - ball.x)**2 + (block.y - ball.y)**2)**0.5) < radius;
    // Set a filter of the gameMap to scan around a radius of num
    let scanZone = gameSettings._gameMap.filter(isWithinRadius);
    // Early exits if no brick in the radius range!
    if (scanZone.length == 0) {return;};
    
    for (let block of scanZone) {
        if (collisionDetection(block, ball) && block.name == 'brick') {gameSettings._opponents[ball.side].score += block.receiveDamage(ball.strength, ball.side);};};

    gameSettings._gameMap = gameSettings._gameMap.filter(block => (block.name == 'wall') || (block.energyPoints > 0));
};

// Header | Scoreboard Update
function updateScoreboard() {
    
    let { left , right } = gameSettings._opponents;
    document.querySelector('.scoreCard.left').innerHTML =
    `<i class='fa-solid fa-coins'></i> ${Math.floor(left.score).toString().padStart(5, '0')} <i class='fa-solid fa-shield-heart'></i> ${left.lives.toString().padStart(2, '0')}`;
    
    document.querySelector('.scoreCard.right').innerHTML =
    `${right.lives.toString().padStart(2, '0')} <i class='fa-solid fa-shield-heart'></i> ${Math.floor(right.score).toString().padStart(5, '0')} <i class='fa-solid fa-coins'></i>`;
};

// Game | Control of the game status
function isGameInProgress() {
    return ((gameSettings._opponents.left.lives !== 0 || gameSettings._opponents.left.ballsInPlay.length > 0)
            ||
            (gameSettings._opponents.right.lives !== 0 || gameSettings._opponents.right.ballsInPlay.length > 0));
};

// Game | Terminate game
function gameOver() {

    let {left, right} = gameSettings._opponents;
    let winner = left.score > right.score ? 'Left' : 'Right';

    document.removeEventListener('pointermove', touchScreenHandler);
    document.querySelector('body').classList.remove('screenLock');

    document.querySelectorAll('.scoreCard').forEach(player => player.remove());

    dialogBox.innerHTML = `<p>Game Over<p/><p>${winner} player wins!<br/>Click to return</p>`;

    document.querySelector('#music-game-over').play();
    
    gameArea.classList.add('fade-out');
    gameSettings._gameMap = [];

    setTimeout(() => {  gameArea.innerHTML = '';
                        dialogBox.classList.remove('hidden');
                        dialogBox.classList.add('appear');
                        gameArea.classList.add('hidden');}, 4000);

    dialogBox.addEventListener('click', () => {
                        dialogBox.classList.remove('appear');
                        dialogBox.classList.add('hidden');
                        dialogBox.innerHTML = '';

                        mainMenu.classList.remove('hidden');
                        mainMenu.classList.add('appear');

                        accordeon.classList.remove('hidden');
                        accordeon.classList.add('appear')
                    });
};

// Game | Launch a new game 
function gameStart() {

    for (let player in gameSettings._opponents) {
        gameSettings._opponents[player].lives = gameSettings._ballPerRound;
        gameSettings._opponents[player].isInPlay = false;
        gameSettings._opponents[player].score = 0;};

    accordeon.classList.add('hidden');
    mainMenu.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameArea.classList.remove('fade-out');
    gameArea.classList.add('fade-in');

    createScoreCards();

    // Capture the gameArea dimensions
    gameAreaBorders = gameArea.getBoundingClientRect();
    // Pointermove activated to enable controls of the paddles by swiping fingers
    document.addEventListener('pointermove', touchScreenHandler, false);
    // Touch-action muted to prevent mobile browser to intercept touch gestures
    document.querySelector('body').classList.add('screenLock');
    // Window onresize | Event-listener that updates the 'gameAreaBorders' variable should window be resized, mobile orientation flipped, etc.
    window.addEventListener('resize', () => {gameAreaBorders = gameArea.getBoundingClientRect(); console.log('resizing!');});

    // Instantiation of the two new paddles for the game ahead
    player1 = new Paddle(0, 34, 'left');
    player2 = new Paddle(gameSettings._gameBoard.width - gameSettings._paddle.width, 34, 'right');

    loadMap(mapTest);
    console.table(gameSettings._gameMap);

    renderGame();
};

// Game | Game Render Processing
function renderGame() {

    let { _gameMap: gameMap, _opponents: opponents } = gameSettings;

    let noBallsLeft = getInPlay();
    if (noBallsLeft || gameMap.every(box => box.name === 'wall')) {return gameOver();};

    movePaddle(player1);
    player1.bounceControl(opponents.left.ballsInPlay[0]);
    player1.bounceControl(opponents.right.ballsInPlay[0]);
    
    movePaddle(player2);
    player2.bounceControl(opponents.left.ballsInPlay[0]);
    player2.bounceControl(opponents.right.ballsInPlay[0]);

    moveBalls();

    hitAndScore(opponents.left.ballsInPlay[0]);
    hitAndScore(opponents.right.ballsInPlay[0]);
    
    updateScoreboard();

    if (isGameInProgress() && gameSettings._gameMap.length > 0) {requestAnimationFrame(renderGame)}
    else {gameOver(); console.log(`Good Game!`)};
};