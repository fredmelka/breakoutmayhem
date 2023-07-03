
// IMPORT | EXPORT | GLOBAL VARIABLES
import { gameSettings } from './code.js';
import { gameArea } from './code.js';
import Paddle from './paddle.js';

export const boxSet = {
                            wall:   {name: 'wall', width: 3.9, height: 3.9},
                            brick:  {name: 'brick', width: 3.9, height: 3.9}};

export const OpacityLevels   = [0, 25, 50, 100];         // SET IN ABSOLUTE LEVELS OF ENERGY POINTS

// CLASS MAIN | BOX
export default class Box {

constructor(name, x, y) {

this._name                  = name;
this._element               = this.createBox();
this._x                     = x;
this._y                     = y;
this.setPosition();
}

get name()                  {return this._name;}
get element()               {return this._element;}
get x()                     {return this._x;}
get y()                     {return this._y;}

set name(str)               {this._name = str;}
set x(num)                  {this._x = num;}
set y(num)                  {this._y = num;}

setPosition()               {this.element.style.left = `${this.x}vw`; this.element.style.top = `${this.y}vh`;}

createBox()                 {const div = document.createElement('div');
                            div.classList.add('box');
                            div.classList.add(this.name);
                            div.style.height = `${boxSet[this.name].height}vh`;
                            div.style.width = `${boxSet[this.name].width}vw`;
                            gameArea.append(div);
                            return div;}

};

// CLASS EXTENSION | BRICK
export class Brick extends Box {

constructor(name, x, y, energyPoints) {

super(name, x, y);
this._energyPoints          = energyPoints;
this.setColor();
}

get energyPoints()          {return this._energyPoints;}
set energyPoints(num)       {this._energyPoints = (typeof num == 'number') ? num : console.log(`Must be a valid number`);}

setColor()                  {let rgb = '#' + Math.floor(Math.random()*16777215).toString(16);
                            this.element.style.backgroundColor = `${rgb}`;}

receiveDamage(damage)       {let bonusKill = 100;
                            this.energyPoints -= damage;
                            this.element.style.opacity = `${OpacityLevels.find(threshold => threshold > this.energyPoints) / 100}`;
                            if (this.energyPoints <= 0) {this.element.remove(); damage += bonusKill; this.playSound('explosion');};
                            this.energyPoints > 0
                                ? console.log(`A brick has received ${damage} points of damage!`)
                                : console.log(`A brick has been exploded: ${bonusKill} bonus points!`);
                            return damage;}

playSound(effect)           {let soundPalette = {
                                explosion: document.querySelector('#brick-explosion')};
                            return soundPalette[effect].play();
                            };

};