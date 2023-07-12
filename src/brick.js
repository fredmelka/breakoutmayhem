
// Import Export | Global Variables
import { gameSettings } from './code.js';
import { gameArea } from './code.js';

export const boxSet = {
                            wall:   {name: 'wall', width: 3.9, height: 3.9},
                            brick:  {name: 'brick', width: 3.9, height: 3.9}};

export const OpacityLevels   = [0, 25, 50, 100]; // Abolute remaining energy points of the Brick 


// Main Class | Box
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


// Class Extension | Brick
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

receiveDamage(damage,hitter){let bonusKill = 100;
                            this.energyPoints -= damage;
                            this.element.style.opacity = `${OpacityLevels.find(threshold => threshold > this.energyPoints) / 100}`;
                            this.energyPoints > 0
                                ? console.log(`A brick has received ${damage} points of damage!`)
                                : console.log(`A brick has been exploded: ${bonusKill} bonus points!`);
                            if (this.energyPoints <= 0) {this.element.remove(); damage += bonusKill; this.playSound('explosion'); this.popSpell(hitter);};
                            return damage;}

popSpell(side)          {let spellOdds = {nothing: 0.60, giantBall: 0.70, invisiBall: 0.80, extraLife: 0.90};
                            let odds = Math.random();

                            // Exits if no candy released
                            if (odds < spellOdds.nothing) {return;};
                            
                            // Create a empty candy box in DOM
                            const candy = document.createElement('div');
                            gameArea.append(candy);
                            candy.style.left = `${this.x}vw`; candy.style.top = `${this.y}vh`;
                            candy.classList.add('candy', `${side}`);
                            setTimeout(() => candy.remove(), 4000);
                            
                            // Giant Ball Spell | Ball'size * 2 & Ball'strength * 4 for 8 seconds! 
                            if (odds < spellOdds.giantBall) {
                                this.playSound('giantBall');
                                candy.innerHTML = `<i class='fa-solid fa-burst fa-beat'></i>`;
                                gameSettings._opponents[side].ballsInPlay[0].element.style.width = `${gameSettings._ballSet.size * 2}vw`;
                                gameSettings._opponents[side].ballsInPlay[0].element.style.borderRadius = `${gameSettings._ballSet.size}vw`;
                                gameSettings._opponents[side].ballsInPlay[0].strength *= 4; 
                                setTimeout(() => {
                                    if (!gameSettings._opponents[side].ballsInPlay[0]) {return;};
                                    gameSettings._opponents[side].ballsInPlay[0].element.style.width = `${gameSettings._ballSet.size}vw`;
                                    gameSettings._opponents[side].ballsInPlay[0].element.style.borderRadius = `${gameSettings._ballSet.size / 2}vw`;
                                    gameSettings._opponents[side].ballsInPlay[0].strength /= 4;
                                }, 8000);
                            return;};

                            // Invisible Ball | Opponent's ball becomes invisible for 8 seconds!
                            if (odds < spellOdds.invisiBall) {
                                this.playSound('invisiBall');
                                candy.innerHTML = `<i class='fa-solid fa-ghost fa-fade'></i>`;
                                let opponent = side === 'left' ? 'right' : 'left';
                                if (!gameSettings._opponents[opponent].ballsInPlay[0]) {return;};
                                gameSettings._opponents[opponent].ballsInPlay[0].element.classList.replace(`${opponent}`, 'invisiBall');
                                setTimeout(() => {
                                    if (!gameSettings._opponents[opponent].ballsInPlay[0]) {return;};
                                    gameSettings._opponents[opponent].ballsInPlay[0].element.classList.replace('invisiBall', `${opponent}`);
                                }, 8000);
                            return;};

                            }

playSound(effect)           {let soundPalette = {
                                explosion: document.getElementById('music-brick-explosion'),
                                giantBall: document.getElementById('music-brick-spell-giantBall'),
                                invisiBall: document.getElementById('music-brick-spell-invisiBall')
                            };
                            return soundPalette[effect].play();}
};