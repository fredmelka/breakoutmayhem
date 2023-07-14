
// Import Export | Global Variables
import { gameSettings } from './code.js';
import { gameArea } from './code.js';

export const boxSet = {
                            wall:   {name: 'wall', width: 3.9, height: 3.9},
                            brick:  {name: 'brick', width: 3.9, height: 3.9}};

const OpacityLevels = [0, 25, 50, 100]; // Abolute remaining energy points of the Brick
const spells        = {
    nothing:        {threshold: 0.70},
    superPaddle:    {threshold: 0.80, duration: 15000, isActive: false},
    giantBall:      {threshold: 0.90, duration: 10000, isActive: false},
    invisiBall:     {threshold: 0.95, duration: 10000},
    extraLife:      {threshold: 0.99},
    mayhem:         {threshold: 1.00, hasOccured: false}
};


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

popSpell(side)              {let draw = Math.random();

                            // Exits if no Spell has been cast
                            if (draw < spells.nothing.threshold) {return;};

                            // Create an empty 'candy' node in DOM
                            const candy = document.createElement('div');
                            gameArea.append(candy);
                            candy.style.left = `${this.x}vw`; candy.style.top = `${this.y}vh`;
                            candy.classList.add('candy', `${side}`);
                            setTimeout(() => candy.remove(), 4000);

                            // Super Paddle | Double the size of the Paddle for both Players for 15 seconds!
                            if (draw < spells.superPaddle.threshold) {

                                candy.innerHTML = `<i class='fa-solid fa-gears fa-bounce fa-lg' style='color: #b5f5ec;'></i>`;
                                this.playSound('superPaddle');

                                if (spells.superPaddle.isActive) {return;} else {spells.superPaddle.isActive = true};

                                gameSettings._paddle.height *= 2;
                                document.querySelectorAll('.paddle').forEach(paddle => paddle.style.height = `${gameSettings._paddle.height}vh`);
                                
                                setTimeout(() => {
                                    gameSettings._paddle.height /= 2;
                                    document.querySelectorAll('.paddle').forEach(paddle => paddle.style.height = `${gameSettings._paddle.height}vh`);
                                    spells.superPaddle.isActive = false;
                                    this.playSound('superPaddle');
                                }, spells.superPaddle.duration);
                            return;};
                            
                            // Giant Ball | Double Ball'size! Double the Ball'strength! for 10 seconds! 
                            if (draw < spells.giantBall.threshold) {
                            
                                candy.innerHTML = `<i class='fa-solid fa-burst fa-beat fa-lg'></i>`;
                                this.playSound('giantBall');
                                if (spells.giantBall.isActive) {return;};

                                spells.giantBall.isActive = true;
                                gameSettings._opponents[side].ballsInPlay[0].element.style.width = `${gameSettings._ballSet.size * 2}vw`;
                                gameSettings._opponents[side].ballsInPlay[0].element.style.borderRadius = `${gameSettings._ballSet.size}vw`;
                                gameSettings._opponents[side].ballsInPlay[0].strength *= 2;
                                
                                setTimeout(() => {
                                    if (!gameSettings._opponents[side].ballsInPlay[0]) {return;};
                                    gameSettings._opponents[side].ballsInPlay[0].element.style.width = `${gameSettings._ballSet.size}vw`;
                                    gameSettings._opponents[side].ballsInPlay[0].element.style.borderRadius = `${gameSettings._ballSet.size / 2}vw`;
                                    gameSettings._opponents[side].ballsInPlay[0].strength /= 2;
                                    spells.giantBall.isActive = false;
                                }, spells.giantBall.duration);
                            return;};

                            // Invisible Ball | Opponent's ball becomes invisible for 10 seconds!
                            if (draw < spells.invisiBall.threshold) {

                                candy.innerHTML = `<i class='fa-solid fa-ghost fa-fade fa-lg'></i>`;
                                this.playSound('invisiBall');

                                let opponent = side === 'left' ? 'right' : 'left';
                                if (!gameSettings._opponents[opponent].ballsInPlay[0]) {return;};
                                gameSettings._opponents[opponent].ballsInPlay[0].element.classList.replace(`${opponent}`, 'invisiBall');

                                setTimeout(() => {
                                    if (!gameSettings._opponents[opponent].ballsInPlay[0]) {return;};
                                    gameSettings._opponents[opponent].ballsInPlay[0].element.classList.replace('invisiBall', `${opponent}`);
                                }, spells.invisiBall.duration);
                            return;};

                            // Extra Life | Player gets an additional ball!
                            if (draw < spells.extraLife.threshold) {
                                candy.innerHTML = `<i class='fa-solid fa-heart-circle-plus fa-flip fa-lg' style='color: #fff566;'></i>`;
                                this.playSound('extraLife');
                                gameSettings._opponents[side].lives ++;
                            return;};

                            // Wall Mayhem! | REMAINING OCCURENCE CASE (if no mandatory) | All Walls explode and disappear!
                            if (draw < spells.mayhem.threshold) {

                                if (spells.mayhem.hasOccured) {return;} else {spells.mayhem.hasOccured = true;};

                                let allWalls = gameSettings._gameMap.filter(box => box.name === 'wall');
                                candy.innerHTML = `<i class="fa-solid fa-rocket fa-beat-fade fa-xl" style="color: #f5222d;"></i>`;
                                this.playSound('mayhem');

                                setTimeout(() => {
                                    allWalls.forEach(wall => wall.element.remove());
                                    gameSettings._gameMap = gameSettings._gameMap.filter(box => box.name !== 'wall');
                                }, 4000);

                                allWalls.forEach(wall => {
                                    wall.element.classList.replace('wall','wallToExplode');
                                    wall.element.innerHTML += `<img src='../img/breakoutmayhem.png'>`;
                                    wall.element.classList.add('fade-out');})
                            
                            document.querySelector('body').classList.add('mayhem');
                            return;};
                            }

playSound(effect)           {let soundPalette = {
                                explosion: document.getElementById('music-brick-explosion'),
                                giantBall: document.getElementById('music-brick-spell-giantBall'),
                                invisiBall: document.getElementById('music-brick-spell-invisiBall'),
                                extraLife: document.getElementById('music-brick-spell-extraLife'),
                                superPaddle: document.getElementById('music-brick-spell-superPaddle'),
                                mayhem: document.getElementById('music-brick-spell-mayhem')
                            };
                            return soundPalette[effect].play();}
};