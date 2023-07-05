
// Import Export | Global Variables
import Paddle from './paddle.js';
import Ball from './ball.js';
import Box, { Brick } from './brick.js';
import { mapDiamond, mapFace, mapIsland } from './map.js';;


// Game | Settings Singleton 
export const gameSettings = {
    _gameBoard: {width: 80, height: 80},  // expressed as {vw,vh} CSS units
    _gameMap: [],
    _ballSet: {src: '', size: 1.5, strength: 20, speed: 0.4}, // src is there in case we want to render the ball using either an emoji or an image
    _ballPerRound: 5,
    _paddle: {height: 12, width: 1.5, speed: 0.7},
    _opponents: {
        left:   {score: 0, lives: 5, isInPlay: false, ballsInPlay: []}, // ballsInPlay is set as an array in case the developer want to allow multiple balls in play for each player
        right:  {score: 0, lives: 5, isInPlay: false, ballsInPlay: []}} 
};

let gameAreaBorders, player1, player2;

    
// DOM Principal Objects
export const gameArea = document.getElementById('gameArea');        // ADD addEventListener("resize", (event) => {}); TO KEEP GAME ZONE OK AND BALLS INSIDE WHILE RESIZING

const mainMenu = document.getElementById('mainMenu');
const dialogBox = document.getElementById('dialogBox');
const scoreLeft = document.querySelector('.score.left');
const scoreRight = document.querySelector('.score.right');
const livesLeft = document.querySelector('.lives.left');
const livesRight = document.querySelector('.lives.right');

const gameLauncher = document.getElementById('gamelaunch');
gameLauncher.addEventListener('click', game, false)


// Game Controls | Keyboard listeners and mobile pointer events
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

// the Event Listener for Mobile Device Control is activated only when the game actually starts as the variable 'gameAreaBorders' is not yet defined
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
                case 'W': gameSettings._gameMap.push(new Box('wall', column * columnInterval, row * rowInterval, 100)); break;
                case 'B': gameSettings._gameMap.push(new Brick('brick', column * columnInterval, row * rowInterval, 100)); break;
                default: break;
            };
        };
    };
};

// Game | Add a new ball in play until both players have no more lives
function getInPlay() {

    for (let player in gameSettings._opponents) {

        if (gameSettings._opponents[player].isInPlay == false) {
            gameSettings._opponents[player].ballsInPlay.pop();

            if (gameSettings._opponents[player].lives > 0) {
                                
                    gameSettings._opponents[player].lives -- ;
                    gameSettings._opponents[player].isInPlay = true;
                    gameSettings._opponents[player].ballsInPlay.push(new Ball (player, 40, 0, gameAreaBorders));

                    document.querySelector('#new-ball').play();
            };
        };
    };
    return Object.values(gameSettings._opponents).every(player => player.ballsInPlay.length === 0)
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

    let randomBouncing = Math.random() * 1 - 0.5;

    let isInX =
            ballEdge.left < obstacleEdge.right &&
            ballEdge.right > obstacleEdge.left;

    let isInY = 
            ballEdge.bottom > obstacleEdge.top &&
            ballEdge.top < obstacleEdge.bottom;

    if (isInX && isInY) {

        if (ballEdge.top > ballEdge.left) {

            if (ballEdge.left < obstacleEdge.left)      {ball.vector.x = -1 + randomBouncing;}
            else                                        {ball.vector.x = +1 + randomBouncing;};
        }
        else {
                
            if (ballEdge.bottom > obstacleEdge.bottom)  {ball.vector.y = +1 + randomBouncing;}
            else                                        {ball.vector.y = -1 + randomBouncing;};
        };
    };
    return (isInX && isInY);
};

// Game | Collide, Hit and Score!
function hitAndScore(ball) {
    if (!ball) {return};
    for (let i in gameSettings._gameMap)    {let block = gameSettings._gameMap[i];
                                            let test = collisionDetection(block, ball);
                                            if (test && block.name == 'brick')  {gameSettings._opponents[ball.side].score += block.receiveDamage(ball.strength);};
                                            if (block.energyPoints <= 0)        {gameSettings._gameMap.splice(i,1);};};
};

// Header | Scoreboard Update
function updateScoreboard() {
    
    let stringify = (num, nDigits) => {
        let stringed = Math.min(Math.pow(10, nDigits) - 1, num).toString().split('').slice(0, nDigits);
        for (let i = stringed.length ; i < nDigits ; i++) {stringed.unshift('0');};
        return stringed.join('');}

    scoreLeft.innerText = '🪙 ' + stringify(gameSettings._opponents.left.score, 5);
    scoreRight.innerText = stringify(gameSettings._opponents.right.score, 5) + ' 🪙';

    livesLeft.innerText = '❤️ ' + stringify(gameSettings._opponents.left.lives, 1);
    livesRight.innerText = stringify(gameSettings._opponents.right.lives, 1) + ' ❤️';
};

// Game | Control of the game status
function isGameInProgress() {
    return ((gameSettings._opponents.left.lives !== 0 || gameSettings._opponents.left.ballsInPlay.length > 0)
            ||
            (gameSettings._opponents.right.lives !== 0 || gameSettings._opponents.right.ballsInPlay.length > 0));
};

// Game | Terminate game
function gameOver() {

    document.removeEventListener('pointermove', touchScreenHandler);
    document.querySelector('body').classList.remove('screenLock');

    let winner = gameSettings._opponents.left.score > gameSettings._opponents.right.score ? 'Left' : 'Right';
    dialogBox.querySelectorAll('p')[0].innerText = `${winner} player wins, Terrific!`;
    dialogBox.querySelectorAll('p')[1].innerText = `Click to return`;

    document.querySelector('#game-over').play();
    
    gameArea.classList.add('fade-out');
    gameSettings._gameMap = [];

    setTimeout(() => {gameArea.innerHTML = '';
                      dialogBox.classList.add('appear');
                      gameArea.classList.add('hidden');}, 4000);

    dialogBox.addEventListener('click', () => {dialogBox.classList.remove('appear');
                                                mainMenu.classList.remove('hidden');
                                                mainMenu.classList.add('appear');});
};

// Game | Launch a new game 
function game() {

    console.log('Setting new game..')
    for (let player in gameSettings._opponents) {
        gameSettings._opponents[player].lives = gameSettings._ballPerRound;
        gameSettings._opponents[player].isInPlay = false;
        gameSettings._opponents[player].score = 0;};

    mainMenu.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameArea.classList.remove('fade-out');
    gameArea.classList.add('fade-in');

    gameAreaBorders = gameArea.getBoundingClientRect();

    document.addEventListener('pointermove', touchScreenHandler, false);
    document.querySelector('body').classList.add('screenLock');

    // Instantiation of the two new paddles for the game ahead
    player1 = new Paddle(0, 34, 'left');
    player2 = new Paddle(gameSettings._gameBoard.width - gameSettings._paddle.width, 34, 'right');

    loadMap(mapFace);
    console.table(gameSettings._gameMap);

    renderGame();
};

// Game | Game Render Processing
function renderGame() {

    let noBallsLeft = getInPlay();
    if (noBallsLeft || gameSettings._gameMap.length == 0) {return gameOver()};

    movePaddle(player1);
    player1.bounceControl(gameSettings._opponents.left.ballsInPlay[0]);
    player1.bounceControl(gameSettings._opponents.right.ballsInPlay[0]);
    
    movePaddle(player2);
    player2.bounceControl(gameSettings._opponents.left.ballsInPlay[0]);
    player2.bounceControl(gameSettings._opponents.right.ballsInPlay[0]);

    moveBalls();

    hitAndScore(gameSettings._opponents.left.ballsInPlay[0]);
    hitAndScore(gameSettings._opponents.right.ballsInPlay[0]);
    
    updateScoreboard();

    if (isGameInProgress() && gameSettings._gameMap.length > 0) {requestAnimationFrame(renderGame)}
    else {gameOver(); console.log(`Good Game!`)};

};