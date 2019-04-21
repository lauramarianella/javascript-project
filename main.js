/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/

const monsterNames = [
  'Bigfoot',
  'Centaur',
  'Cerberus',
  'Chimera',
  'Ghost',
  'Goblin',
  'Golem',
  'Manticore',
  'Medusa',
  'Minotaur',
  'Ogre',
  'Vampire',
  'Wendigo',
  'Werewolf',
];

const RARITY_LIST = ['Common', 'Unusual', 'Rare', 'Epic'];
const items = []; // Array of item objects. These will be used to clone new items with the appropriate properties.
const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.

const grassChar = '.';
const wallChar = '#';

const items = []; // Array of item objects. These will be used to clone new items with the appropriate properties.

const player = {
  name:      '',
  level:     0,               // (number - 1)
  items:     [],              // (array of objects - [])
  skills:    [],              // (array of objects - [])
  attack:    0,               // (number - 10)
  speed:     0,               // (number - 2000)
  hp:        0,               // (number - 100)
  gold:      0,               // (number - 0 to start. Can get gold by selling items to the tradesman)
  exp:       0,               // (number - 0 to start. Experience points, increase when slaying monsters)
  type:     'player',         // (string - 'player')
  position: {row:0,column:0}, //(object - can be left out and set when needed)
  levelUp:  0,                // (a method to update the level and the different properties affected by a level change. Level up happens when exp >= [player level * 10])
  
  //When leveling up, exp must be decreased by the amount used to level up, e.g. exp required to level up = 100. current exp = 120  
  //-> levelUp is called, incrementing by 1 the level and updating exp to exp = 120 - 100 = 20
  
  setName: setName
}; // The player object

const grass = {
  symbol:   grassChar,
  type:     'grass',
  position: {row:0,column:0}  //(object)
}

const wall = {
  symbol:   wallChar,
  type:     'wall',
  position: {row:0,column:0}  //(object)
}

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count, char, color){ //function printSectionTitle(title, count = 20) {
  const defaultCount = 20;
  const defaultChar = '-';
  const defaultColor = 'blue';
  if(count === undefined || typeof count !== 'number') count = defaultCount;
  if(char  === undefined || typeof char  !== 'string') char  = defaultChar;
  if(color === undefined || typeof color !== 'string') color = defaultColor;

  let arrStringsOfChar = new Array(count); 
  arrStringsOfChar.fill(char);

  let arg = arrStringsOfChar.join('') + title + arrStringsOfChar.join('') ;
  print(arg, color);
}

// Sets the name property for the player and prints a message to notice the user of the change
function setName(name) {
  this.name = name;
  console.log('*** name set to: ' + this.name);
}

function setPosition(x,y) {
  this.position.row = x;
  this.position.column = y;
  console.log(this.name + ' position set to: x:' + x + " y:" + y);
}

// 
function getMonsterRandomName() {
  var num = Math.floor(Math.random() * monsterNames.length + 1);
  return monsterNames[num];
}

// 
// function getMonsterRandomXY() {
//   var x = Math.floor(Math.random() * board.length + 1);
//   var y = Math.floor(Math.random() * board[0].length + 1);
//   let xyObj = {};
//   xyObj.x = x;
//   xyObj.y = y;
//   return xyObj;
// }

// Returns a new object with the same keys and values as the input object
function clone(entity) {
  let keys = Object.keys(entity);
  let cloned = {};
  
  keys.forEach((key) => cloned[key]=entity[key]);/*for(let i=0; i<keys.length; i++){let key = keys[i];clone[key] = entity[key];}*/

  return cloned;
}


function printObj(obj) {
  let keys = Object.keys(obj);
  
  keys.forEach((key) => console.log(key + " : " + obj[key]));
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEquality(original, cloned) {
  let keys = Object.keys(original);
  return keys.every(key => original[key]===cloned[key]);/*for(let i=0; i<keys.length;i++){if(original[keys[i]] !== clone[keys[i]]) return false;}return true;*/
}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  board = [];
  
  for(let i=0; i< rows; i++){
    board[i] = [];
    for(let j=0; j< columns; j++){      
      if( i===0 || i===rows-1 || j===0 || j===columns-1 ) {
        board[i][j] = wallChar;//'#'
      }else{
        board[i][j] = grassChar;//'.'
      }
    }
  }
  print('Creating board: rows: ' + rows + ' cols: ' + columns);
}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer(x,y) {
  board[x][y] = 'P';
  print('Placing player in position x: ' + x + " y:" + y);

  printBoard();
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows,columns);

  placePlayer(Math.floor(rows/2), Math.floor(columns/2));//place player in the middle
}

// Prints the board
function printBoard() {
  let xyBoard = '';
  
  board.forEach(row => {
                        let rowsBoard = '';
                        row.forEach(col => rowsBoard +=col);
                        xyBoard += rowsBoard + '\n';
                        });//for(let i=0; i< board.length; i++){let rowsBoard = ''for(let j=0; j< board[0].length; j++){rowsBoard += board[i][j]; }xyBoard += rowsBoard + '\n'}

  print(xyBoard,'blue');
}

function updateBoard(entity) {
  board[entity.position.row][entity.position.column] = entity.type.slice(0,1);
  
  printBoard();
}



// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  let monster = {
    name      : '',         //(string - random from list of monster names)
    level     : level,      //(number - specified in parameters)
    hp        : 0,          //(number - max is level \* 100)
    attack    : 0,          //(number - level \* 10)
    speed     : 0,          //(number - 6000 / level)
    items     : items,      //(array of objects - may be empty or not depending on parameters)
    position  : position,   //(object - specified in parameters)
    type      : 'monster',  //(string - 'monster')
    //Monsters give exp (experience points) when defeated following this rule: level \* 10; e.g. level is 2 -> 2 \* 10 = 20 exp points
  }

  monster.name = getMonsterRandomName();
  
  print("Creating monster: " + monster.name, 'red');

  return monster;
}




// Creates a tradesman object with the specified items and position. hp is Infinity
function createTradesman(items, position) {
  let tradesman = {
    name        :'',                // (string - can be anything)
    hp          :0,                 // (number - Infinity)
    items       :items,             // (array of objects - may be empty or not depending on parameters)
    position    : position,         // (object - specified in parameters)
    type        :'tradesman'        // (string - 'tradesman')
  }
  print("Creating tradesman: " + tradesman.name, 'red');
  return tradesman;
}

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {}


// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  let dungeon = {
    position    : position,      // (object - specified in parameters)
    type        : 'dungeon',     // (string - 'tradesman')
  } 
  print("Creating dungeon: " + dungeon.name, 'red');
  return dungeon;
}


// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {}

function setupPlayer() {
  printSectionTitle('SETUP PLAYER');
  print("Please create a player using the createPlayer function. Usage: createPlayer('Bob')");
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle('SETUP BOARD');
  print('Please create a board using initBoard(rows, columns)');
  print(
    'Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)'
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle('START GAME');
  print('Hello ' + player.name);
  print("You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going.");
  printBoard();
}

function gameOver() {
  printSectionTitle('GAME OVER');
}

function next() {
  gameStep++;
  run();
}

function runORI() {
  //const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
  //let gameStep = 0;
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}

//functions calls
print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

run();


function run() {
  //const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
  //let gameStep = 0;
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      setName('Hopper');
      next();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      initBoard(7, 15);
      //let position = getMonsterRandomXY();
      updateBoard(createMonster(1,[],{row:1, column:5}));
      updateBoard(createMonster(1,[],{row:1, column:6}));
      updateBoard(createMonster(3,[],{row:1, column:2}));
      //createItem(itemIdx, pos), 
      updateBoard(createTradesman([], {row:4, column:4}));
      updateBoard(createDungeon({row:2,column:7}));

      break;
    case 'GAME_START':
      startGame();
      break;
  }
}