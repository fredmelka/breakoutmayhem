
// Import Export | Global Variables
import { gameSettings } from './code.js';
import { gameArea } from './code.js';


// Class | Ball
export default class Ball {

constructor(side, x, y, gameAreaBorders) {
 
this._side                  = side; // left || right
this._element               = this.createBall();
this._x                     = x;
this._y                     = y;
this._vector                = { x: this.side == 'left' ? -1 : +1, y: 1 };
this._strength              = gameSettings._ballSet.strength;
this._speed                 = gameSettings._ballSet.speed;
this.gameAreaBorders        = gameAreaBorders;
this.setPosition()
}

get name()                  {return this._name;}
get side()                  {return this._side;}
get element()               {return this._element;}
get x()                     {return this._x;}
get y()                     {return this._y;}
get vector()                {return this._vector;}
get strength()              {return this._strength;}
get speed()                 {return this._speed;}

set name(str)               {this._name = str;}
set side(str)               {this._side = str;}
set x(num)                  {this._x = num;}
set y(num)                  {this._y = num;}
set strength(num)           {this._strength = num;}
set speed(num)              {this._speed = num;}

createBall()                {const div = document.createElement('div');
                            div.classList.add('ball');
                            div.classList.add(this.side);
                            div.style.width = `${gameSettings._ballSet.size}vw`;
                            gameArea.append(div);
                            return div;}

setPosition()               {this.element.style.left = `${this.x}vw`; this.element.style.top = `${this.y}vh`;}

move()                      {this.x += this.speed * this.vector.x;                                                          
                            this.y += this.speed * this.vector.y;
                            let ballBounding = this.element.getBoundingClientRect();
                            
                            if (ballBounding.top <= this.gameAreaBorders.top) {this.vector.y = +1; this.playSound('wallBounce');};
                            if (ballBounding.bottom >= this.gameAreaBorders.bottom) {this.vector.y = -1; this.playSound('wallBounce');};
                            
                            switch (this.side) {
                                case 'left':
                                    if (ballBounding.left <= this.gameAreaBorders.left) {this.element.remove(); gameSettings._opponents[this.side].isInPlay = false;};
                                    if (ballBounding.right >= this.gameAreaBorders.right) {this.vector.x = -1; this.playSound('touchDown'); this.touchDown();};
                                    break;
                                case 'right':
                                    if (ballBounding.left <= this.gameAreaBorders.left) {this.vector.x = +1; this.playSound('touchDown'); this.touchDown();};
                                    if (ballBounding.right >= this.gameAreaBorders.right) {this.element.remove(); gameSettings._opponents[this.side].isInPlay = false;};        
                                    break;
                            };
                            this.setPosition();}

touchDown()                 {let opponentSide = this.side == 'left' ? 'right' : 'left';
                            if (!gameSettings._opponents[opponentSide].ballsInPlay[0]) {return;};

                            gameSettings._opponents[opponentSide].ballsInPlay[0].speed *= 0.1;
                            setTimeout(() => {gameSettings._opponents[opponentSide].ballsInPlay[0].speed /= 0.1;}, 5000);}

playSound(effect)           {let soundPalette = {
                                wallBounce: document.querySelector('#music-ball-wall-bounce'),
                                touchDown: document.querySelector('#music-ball-touchdown')};
                            return soundPalette[effect].play();}
};