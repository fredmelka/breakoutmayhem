
// IMPORT | EXPORT | GLOBAL VARIABLES
import Paddle from './paddle.js';
import Ball, { ballSet } from './ball.js';
import Box, { Brick } from './brick.js'
import { mapDiamond, mapFace, mapIsland } from './map.js'

export const gameSettings = {
    _gameBoard: {width: 80, height: 80},            // VW, VH CSS units //
    _gameMap: [],
    _paddle: {height: 12, width: 1.5, speed: 0.7},
    _opponents: {
            left:   {score: 0, lives: 3, isInPlay: false, ballsInPlay: []},
            right:  {score: 0, lives: 3, isInPlay: false, ballsInPlay: []}}
    };                                 

export const gameArea = document.getElementById('gameArea'); // ADD addEventListener("resize", (event) => {}); TO KEEP GAME ZONE OK AND BALLS INSIDE WHILE RESIZING
export const gameAreaBorders = gameArea.getBoundingClientRect();

const scoreLeft = document.querySelector('.score.left');
const scoreRight = document.querySelector('.score.right');

// GAME | OBJECT CREATION AND TESTING 
const player1 = new Paddle("gabriel", 0, 37, 'left');
const player2 = new Paddle("Diane", 78.5, 37, 'right');

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

loadMap(mapDiamond);
console.table(gameSettings._gameMap);

// KEYBOARD LISTENER | PADDLE CONTROLS
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

// GAME LOGIC | FUNCTIONS

function getInPlay() {

    for (let player in gameSettings._opponents) {
        if (gameSettings._opponents[player].lives > 0 && gameSettings._opponents[player].isInPlay == false) {
                gameSettings._opponents[player].ballsInPlay.pop();
                gameSettings._opponents[player].lives -- ;
                gameSettings._opponents[player].isInPlay = true;
                gameSettings._opponents[player].ballsInPlay.push(new Ball ('foot', player, 40, 0));
        };
    };
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

    let ballEdge = ball.element.getBoundingClientRect();
    let paddleEdge = paddle.element.getBoundingClientRect();
    let paddleSide = paddle.side;

    // PADDLE CONTROL PARAMETERS TO MOVE UP
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

for (let i in gameSettings._gameMap)    {let block = gameSettings._gameMap[i];
                                        let test = collisionDetection(block, ball);
                                            if (test && block.name == 'brick')  {gameSettings._opponents[ball.side].score += block.receiveDamage(ball.strength);};
                                            if (block.energyPoints <= 0)        {gameSettings._gameMap.splice(i,1);}
                                        };
};

function displayScore() {
    
    let stringify = (num) => {

        let stringed = Math.min(9999, num).toString().split('').reverse().slice(0,4);
           
        let units = typeof stringed[0] != 'undefined' ? stringed[0] : stringed.push('0') ;
        let tens = typeof stringed[1] != 'undefined' ? stringed[1] : stringed.push('0') ;
        let hundreds = typeof stringed[2] != 'undefined' ? stringed[2] : stringed.push('0') ;
        let thousands = typeof stringed[3] != 'undefined' ? stringed[3] : stringed.push('0') ;
    
    return stringed.reverse().join('');}

    scoreLeft.innerText = stringify(gameSettings._opponents.left.score);
    scoreRight.innerText = stringify(gameSettings._opponents.right.score);

};

// GAME | RENDERING 
function renderGame() {

getInPlay();

//for (let player in gameSettings._opponents) {console.log(player, gameSettings._opponents[player].lives);};

movePaddle(player1);
movePaddle(player2);

BouncePaddle(gameSettings._opponents.left.ballsInPlay[0], player1);
BouncePaddle(gameSettings._opponents.right.ballsInPlay[0], player2);

moveBalls();

hitAndScore(gameSettings._opponents.left.ballsInPlay[0]);
hitAndScore(gameSettings._opponents.right.ballsInPlay[0]);

displayScore();

if      ((gameSettings._opponents.left.lives !== 0 && gameSettings._opponents.left.ballsInPlay.length > 0)
        ||
        (gameSettings._opponents.right.lives !== 0 && gameSettings._opponents.right.ballsInPlay.length > 0))
        
        {requestAnimationFrame(renderGame);}

else    {console.log(`game over!!`)};

};

// GAME | LAUNCH
renderGame();
