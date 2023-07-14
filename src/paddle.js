
// Import Export | Global Variables
import { gameSettings } from "./code.js";
import { gameArea } from "./code.js";


// CLASS | Paddle
export default class Paddle {

constructor(x, y, side) {
            
this._x                     = x;
this._y                     = y;
this._position              = {top: this.x, left: this.y};
this._upPressed             = false;
this._downPressed           = false;
this._side                  = side; // also defines the CSS class for rendering
this._element               = this.createPaddle();
this.setPosition()
}

get element()               {return this._element;}
get x()                     {return this._x;}
get y()                     {return this._y;}
get position()              {return this._position;}
get upPressed()             {return this._upPressed;}
get downPressed()           {return this._downPressed;}    
get side()                  {return this._side;}
    
set x(num)                  {if (num < 0 || num > gameSettings._gameBoard.width - gameSettings._paddle.width) // Setter that prevents moves outside the game Area
                                {console.log(`Oups, ${this.side}-paddle cannot stand outside the gameboard!`)}
                            else {this._x = num};}
        
set y(num)                  {if (num < 0 || num > gameSettings._gameBoard.height - gameSettings._paddle.height) // Setter that prevents moves outside the game Area
                                {console.log(`Oups, ${this.side}-paddle cannot stand outside the gameboard!`);}
                            else {this._y = num;};}
                                    
set upPressed(boolean)      {this._upPressed = boolean;}
set downPressed(boolean)    {this._downPressed = boolean;}
set side(cssClass)          {this._side = cssClass;}

createPaddle()              {const div = document.createElement("div");
                            div.classList.add('paddle');
                            div.classList.add(this.side);
                            gameArea.append(div);
                            div.style.height = `${gameSettings._paddle.height}vh`;
                            div.style.width = `${gameSettings._paddle.width}vw`;
                            return div;}
    
setPosition()               {this.element.style.top = `${this.y}vh`; this.element.style.left = `${this.x}vw`;}
    
moveUp()                    {let moveUp = this.y; moveUp -= gameSettings._paddle.speed; this.y = moveUp;}
    
moveDown()                  {let moveDown = this.y; moveDown += gameSettings._paddle.speed; this.y = moveDown;}

bounceControl(ball)         {if (!ball) {return;};

                            let ballEdge = ball.element.getBoundingClientRect();
                            let paddleEdge = this.element.getBoundingClientRect();

                            // Parameters for controlling the ball bounce off the paddle
                            let ballCenter = (ballEdge.top + ballEdge.bottom) / 2;
                            let paddleCenter = (paddleEdge.top + paddleEdge.bottom) / 2;
                            let radiusFactor = 1.8;
                            let bounceAngle = Math.floor(10 * radiusFactor * Math.max(-1, Math.min((ballCenter - paddleCenter) * 2 / paddleEdge.height, 1))) / 10;
    
                            switch (this.side) {
                            case 'left':
                                if (ballEdge.left < paddleEdge.right && ballEdge.bottom > paddleEdge.top && ballEdge.top < paddleEdge.bottom)
                                {ball.vector.x = 1; ball.vector.y = bounceAngle; this.playSound();};
                                break;

                            case 'right':
                                if (ballEdge.right > paddleEdge.left && ballEdge.bottom > paddleEdge.top && ballEdge.top < paddleEdge.bottom)
                                {ball.vector.x = -1; ball.vector.y = bounceAngle; this.playSound();};
                                break;
                            };
                            }

playSound()                 {document.querySelector('#music-paddle-ball-bounce').play();}
};