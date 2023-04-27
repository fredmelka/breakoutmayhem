
// IMPORT | EXPORT | GLOBAL VARIABLES
import { gameSettings } from "./code.js";

// CLASS | PADDLE //
export default class Paddle {

constructor(name, x, y, side) {
            
this._name                  = typeof name === 'string' ? name[0].toUpperCase() + name.slice(1).toLowerCase() : console.log(`Enter a real first name.`);
this._x                     = x;                                                                                // x => CSS units VW => OFFSET FROM TOP LEFT CORNER //
this._y                     = y;                                                                                // y => CSS units VW => OFFSET FROM TOP LEFT CORNER //
this._position              = {top: this.x, left: this.y};                                                      // object {x,y} => CSS units {VW,VH} => OFFSET FROM TOP LEFT CORNER //
this._upPressed             = false;
this._downPressed           = false;
this._side                  = side;                                                                             // CSS class
this._element               = this.createPaddle();
this.setPosition()
}
    
get name()                  {return this._name;}
get element()               {return this._element;}
get x()                     {return this._x;}
get y()                     {return this._y;}
get position()              {return this._position;}
get upPressed()             {return this._upPressed;}
get downPressed()           {return this._downPressed;}    
get side()                  {return this._side;}
    
set name(str)               {this._name = typeof str === 'string'                                               // NAME DISPLAY RESETTING
                                ? str[0].toUpperCase() + str.slice(1).toLowerCase()
                                : console.log(`Enter a real first name.`);}
    
set x(num)                  {if (num < 0 || num > gameSettings._gameBoard.width - gameSettings._paddle.width)   // SETTER USED TO CONTROL GAMEAREA BORDERS
                                {console.log(`Oups, ${this.name} cannot stand outside the gameboard!`)}
                            else {this._x = num};}
        
set y(num)                  {if (num < 0 || num > gameSettings._gameBoard.height - gameSettings._paddle.height) // SETTER USED TO CONTROL GAMEAREA BORDERS
                                {console.log(`Oups, ${this.name} cannot stand outside the gameboard!`);}
                            else {this._y = num;};}                  
        
set upPressed(boolean)      {this._upPressed = boolean;}
set downPressed(boolean)    {this._downPressed = boolean;}
set side(cssClass)          {this._side = cssClass;}

createPaddle()              {const div = document.createElement("div");                                         // CREATE OBJECT ON SCREEN (DOM)
                            div.classList.add("paddle");                                                        // CSS CLASS PADDLE STYLING
                            div.classList.add(this.side);                                                       // CSS CLASS PLAYER MOVE
                            gameArea.append(div);
                            div.style.height = `${gameSettings._paddle.height}vh`;
                            div.style.width = `${gameSettings._paddle.width}vw`;
                            return div;}
    
setPosition()               {this.element.style.top = `${this.y}vh`; this.element.style.left = `${this.x}vw`;}
    
moveUp()                    {let moveUp = this.y; moveUp -= gameSettings._paddle.speed; this.y = moveUp;}
    
moveDown()                  {let moveDown = this.y; moveDown += gameSettings._paddle.speed; this.y = moveDown;}
    
};