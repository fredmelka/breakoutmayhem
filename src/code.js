
// IMPORT | EXPORT | GLOBAL VARIABLES
import Paddle from './paddle.js';
import Ball, { ballSet } from './ball.js';
import Box, { Brick } from './brick.js'
import { mapDiamond, mapFace, mapIsland } from './map.js'

export const gameSettings = {
    _gameBoard: {width: 80, height: 80},  // VW, VH CSS units
    _gameMap: [],
    _paddle: {height: 12, width: 1.5, speed: 0.7},
    _opponents: {
            left:   {score: 0, lives: 5, isInPlay: false, ballsInPlay: []}, // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
            right:  {score: 0, lives: 5, isInPlay: false, ballsInPlay: []}} // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
    };                                 

// DOM MAIN OBJECTS
export const gameArea = document.getElementById('gameArea');        // ADD addEventListener("resize", (event) => {}); TO KEEP GAME ZONE OK AND BALLS INSIDE WHILE RESIZING
let gameAreaBorders; 

const mainMenu = document.getElementById('mainMenu');
const dialogBox = document.getElementById('dialogBox');
const scoreLeft = document.querySelector('.score.left');
const scoreRight = document.querySelector('.score.right');
const livesLeft = document.querySelector('.lives.left');
const livesRight = document.querySelector('.lives.right');

// CLASS INSTANCES | PADDLE OBJECTS CREATION (INITITALLY FOR TESTING...) 
const player1 = new Paddle("gabriel", 0, 37, 'left');
const player2 = new Paddle("Diane", 78.5, 37, 'right');

// KEYBOARD LISTENERS | PADDLE CONTROLS
const keyDown = document.addEventListener('keydown', keyDownHandler, false);
function keyDownHandler(event) {
    switch (event.key) {
        case 'q':
        case 'Q': player1.upPressed = true; break;                   // !!!! fix the hard code of the player designation
        case 'w':
        case 'W': player1.downPressed = true; break;                 // !!!! fix the hard code of the player designation
        case 'Up':
        case'ArrowUp': player2.upPressed = true; break;              // !!!! fix the hard code of the player designation
        case 'Down':
        case 'ArrowDown': player2.downPressed = true; break;         // !!!! fix the hard code of the player designation
    };
};

const keyUp = document.addEventListener('keyup', keyUpHandler, false);
function keyUpHandler(event) {
    switch (event.key) {
        case 'q':
        case 'Q': player1.upPressed = false; break;                 // !!!! fix the hard code of the player designation
        case 'w':
        case 'W': player1.downPressed = false; break;               // !!!! fix the hard code of the player designation
        case 'Up':
        case'ArrowUp': player2.upPressed = false; break;            // !!!! fix the hard code of the player designation
        case 'Down':
        case 'ArrowDown': player2.downPressed = false; break;       // !!!! fix the hard code of the player designation
    };
};

const gameLauncher = document.getElementById('gamelaunch');
gameLauncher.addEventListener('click',game,false)

// GAME LOGIC | FUNCTIONS

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

function getInPlay() {

    for (let player in gameSettings._opponents) {
        if (gameSettings._opponents[player].isInPlay == false) {
            gameSettings._opponents[player].ballsInPlay.pop();
            if (gameSettings._opponents[player].lives > 0) {gameSettings._opponents[player].lives -- ;
                                                                gameSettings._opponents[player].isInPlay = true;
                                                                gameSettings._opponents[player].ballsInPlay.push(new Ball ('foot', player, 40, 0, gameAreaBorders));
            };
        };
    };
    return Object.values(gameSettings._opponents).every(player => player.ballsInPlay.length === 0)
};

function moveBalls() {
    for (let player in gameSettings._opponents) {
        for (let ball of gameSettings._opponents[player].ballsInPlay) {ball.move();}
    };
};

function movePaddle(player) {

    if (player.upPressed) {player.moveUp();};
    if (player.downPressed) {player.moveDown();};
    player.setPosition();
};

function BouncePaddle(ball, paddle) {
    if (!ball) return
    let ballEdge = ball.element.getBoundingClientRect();
    let paddleEdge = paddle.element.getBoundingClientRect();
    let paddleSide = paddle.side;

    // PARAMETERS FOR CONTROLLING THE BALL WITH THE PADDLE
    let ballCenter = (ballEdge.top + ballEdge.bottom) / 2;
    let paddleCenter = (paddleEdge.top + paddleEdge.bottom) / 2;
    let radiusFactor = 1.5;
    let bounceAngle = Math.floor(10 * radiusFactor * Math.max(-1, Math.min((ballCenter - paddleCenter) * 2 / paddleEdge.height, 1))) / 10;
    
    switch (paddleSide) {
    case 'left':
        if (ballEdge.left < paddleEdge.right &&
            ballEdge.bottom > paddleEdge.top &&
            ballEdge.top < paddleEdge.bottom)           {ball.vector.x = 1; ball.vector.y = bounceAngle;};
        break;

    case 'right':
        if (ballEdge.right > paddleEdge.left &&
            ballEdge.bottom > paddleEdge.top &&
            ballEdge.top < paddleEdge.bottom)           {ball.vector.x = -1; ball.vector.y = bounceAngle;};
        break;
    };
}; 

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
        }   ;

        return (isInX && isInY);
};

function hitAndScore(ball) {
    if (!ball) return

for (let i in gameSettings._gameMap)    {let block = gameSettings._gameMap[i];
                                        let test = collisionDetection(block, ball);
                                            if (test && block.name == 'brick')  {gameSettings._opponents[ball.side].score += block.receiveDamage(ball.strength);};
                                            if (block.energyPoints <= 0)        {gameSettings._gameMap.splice(i,1);}
                                        };
};

function displayScoreAndLives() {
    
    let stringify = (num, nDigits) => {
        let stringed = Math.min(Math.pow(10, nDigits) - 1, num).toString().split('').slice(0,nDigits);
        for (let i = stringed.length ; i < nDigits ; i++) {stringed.unshift('0');};
        return stringed.join('');}

    scoreLeft.innerText = '🪙' + stringify(gameSettings._opponents.left.score, 5);
    scoreRight.innerText = stringify(gameSettings._opponents.right.score, 5) + '🪙';

    livesLeft.innerText = '❤️' + stringify(gameSettings._opponents.left.lives, 1);
    livesRight.innerText = stringify(gameSettings._opponents.right.lives, 1) + '❤️';
};

function isGameInProgress() {

    return ((gameSettings._opponents.left.lives !== 0 && gameSettings._opponents.left.ballsInPlay.length > 0)
            ||
            (gameSettings._opponents.right.lives !== 0 && gameSettings._opponents.right.ballsInPlay.length > 0));
};

function gameOver() {

    let winnerSide = gameSettings._opponents.left.score > gameSettings._opponents.right.score ? 'Left' : 'Right';
    dialogBox.querySelectorAll('p')[0].innerText = `${winnerSide} player wins, Terrific!`;
    dialogBox.querySelectorAll('p')[1].innerText = `Click to return`;

    gameArea.classList.add('fade-out');

    setTimeout(() => {gameArea.innerHTML = "";
                      dialogBox.classList.add('appear')}, 4000);

    dialogBox.addEventListener('click', () => {dialogBox.classList.remove('appear');
                                                 mainMenu.classList.add('appear');})
;};

function game() {

mainMenu.classList.add('hidden');

gameArea.classList.remove('hidden');
gameAreaBorders = gameArea.getBoundingClientRect()

loadMap(mapDiamond);
console.table(gameSettings._gameMap);

renderGame();

}

// GAME | RENDERING 
function renderGame() {



const noBallsLeft = getInPlay();
if (noBallsLeft) {
    return gameOver()
}

movePaddle(player1);
movePaddle(player2);
BouncePaddle(gameSettings._opponents.left.ballsInPlay[0], player1); // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
BouncePaddle(gameSettings._opponents.right.ballsInPlay[0], player2); // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
moveBalls();

hitAndScore(gameSettings._opponents.left.ballsInPlay[0]); // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
hitAndScore(gameSettings._opponents.right.ballsInPlay[0]); // FIX THIS AWFUL ARGUMENTATION AND SET THE BALLINPLAY AS A SINGLE KEY VALUE OBJECT
displayScoreAndLives();

if (isGameInProgress()) {requestAnimationFrame(renderGame)}
else {gameOver(); console.log(`Good Game!`)};

};

// GAME | LAUNCH
//renderGame();
//gameOver();
