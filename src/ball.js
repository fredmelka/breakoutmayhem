
// IMPORT | EXPORT | GLOBAL VARIABLES
import { gameSettings } from './code.js';
import { gameArea } from './code.js';
import Paddle from './paddle.js';

export const ballSet = {
                            basket: {src: '', size: 1.5, strength: 20, speed: 0.4},
                            foot:   {src: '', size: 1.5, strength: 20, speed: 0.4},
                            rugby:  {src: '', size: 1.5, strength: 15, speed: 0.5},
                            tennis: {src: '', size: 1.5, strength: 10, speed: 0.8},
                            volley: {src: '', size: 1.5, strength: 20, speed: 0.4}};

// CLASS | BALL
export default class Ball {

constructor(name, side, x, y, gameAreaBorders) {
 
this._name                  = name;
this._side                  = side;             //left or right
this._element               = this.createBall();
this._x                     = x;
this._y                     = y;
this._vector                = { x: this.side == 'left' ? -1 : +1, y: 1 };
this._strength              = ballSet[this.name].strength;
this.gameAreaBorders = gameAreaBorders

this.setPosition()
}

get name()                  {return this._name;}
get side()                  {return this._side;}
get element()               {return this._element;}
get x()                     {return this._x;}
get y()                     {return this._y;}
get vector()                {return this._vector;}
get strength()              {return this._strength;}

set name(str)               {this._name = str;}
set side(str)               {this._side = str;}
set x(num)                  {this._x = num;}
set y(num)                  {this._y = num;}
set strength(num)           {this._strength = num;}

createBall()                {const div = document.createElement('div');
                            div.classList.add('ball');
                            div.classList.add(this.side);
                            div.innerText = ballSet[this.name].src;
                            div.style.fontSize = `${ballSet[this.name].size}rem`;
                            gameArea.append(div);
                            return div;}

setPosition()               {this.element.style.left = `${this.x}vw`; this.element.style.top = `${this.y}vh`;}

move()                      {this.x += ballSet[this.name].speed * this.vector.x;                                                          
                            this.y += ballSet[this.name].speed * this.vector.y;
                            let ballBounding = this.element.getBoundingClientRect();
                            
                            if (ballBounding.top <= this.gameAreaBorders.top) {this.vector.y = +1; this.playSound('wallBounce');};
                            if (ballBounding.bottom >= this.gameAreaBorders.bottom) {this.vector.y = -1; this.playSound('wallBounce');};
                            
                            switch (this.side) {
                                case 'left':
                                    if (ballBounding.left <= this.gameAreaBorders.left) {this.element.remove(); gameSettings._opponents[this.side].isInPlay = false;};
                                    if (ballBounding.right >= this.gameAreaBorders.right) {this.vector.x = -1; this.playSound('fieldBounce');};
                                    break;
                                case 'right':
                                    if (ballBounding.left <= this.gameAreaBorders.left) {this.vector.x = +1; this.playSound('fieldBounce');};
                                    if (ballBounding.right >= this.gameAreaBorders.right) {this.element.remove(); gameSettings._opponents[this.side].isInPlay = false;};        
                                    break;
                            };

                            this.setPosition();};

playSound(effect)           {let soundPalette = {
                                    wallBounce: document.querySelector('#ball-wall-bounce'),
                                    fieldBounce: document.querySelector('#ball-field-bounce')};
                            return soundPalette[effect].play();
                            };

};