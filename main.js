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

const grassChar   = '.';
const wallChar    = '#';

let skill = {
  name: '',// (string)
  requiredLevel: 0,// (number - the skill should not be useable if player level is lower)
  cooldown:0,// (number - initial value is 0 meaning it's useable, over 0 means we have to wait. This gets updated to the cooldown value when skill is used and gradually decreases until it's back to 0)
  use: function use(){},// (function - takes a target / entity as a parameter and uses the skill on it)
}
let confuse = {
  use: function use(){},//- use: expects a target as parameter and reverses the name of the target entity as well as dealing [player level \* 25] damage (e.g. level 1 -> deals 25hp)
};
let steal   = {
  use: function use(){},//- use: expects a target as parameter and steals all items of rarity 1 or lower (i.e. unusual or common). Stolen items should be added to the player and removed from the target entity.
};
confuse.__x__ = skill;
steal.__x__   = skill;

confuse.name     = 'confuse';
confuse.required = 1;         // level is 1
confuse.cooldown = 1000;      //is 10000

steal.name      = 'steal';
steal.required  = 3;          // level is 3
steal.cooldown  = 25000;      //is 25000

let player = {// The player object
  name:           '',  
  level:          1,                // (number - 1)  
  items:          [],               // (array of objects - [])
  skills:         [confuse, steal], // (array of objects - [])
  attack:         10,               // (number - 10)
  speed:          3000,             // (number - 2000)
  hp:             100,              // (number - 100)
  gold:           0,                // (number - 0 to start. Can get gold by selling items to the tradesman)
  exp:            0,                // (number - 0 to start. Experience points, increase when slaying monsters)
  type:           'player',         // (string - 'player')
  position:       {row:0,column:0}, //(object - can be left out and set when needed)
  getMaxHp:       ()=>{},           //(function - a method that returns max hp. Value is level \* 100, e.g. level 2 -> 200 max hp)
  levelUp:        ()=>{},           //(function - a method to update the level and the different properties affected by a level change. Level up happens when exp >= [player level * 20])
  getExpToLevel:  ()=>{},           //(function - a method returning exp required to level. Value is level \* 20, e.g. level 2 -> 40exp required)
  setItems:       setItems,
  getSymbol:      function(){return this.type.charAt(0).toUpperCase(); },
  //When leveling up, exp must be decreased by the amount used to level up, e.g. exp required to level up = 100. current exp = 120  
  //-> levelUp is called, incrementing by 1 the level and updating exp to exp = 120 - 100 = 20
}; // The player object

const grass = {
  symbol:   grassChar,
  type:     'grass',
  position: {row:0,column:0},  //(object)
  getSymbol: function(){ return this.symbol},
}

const wall = {
  symbol:   wallChar,
  type:     'wall',
  position: {row:0,column:0},  //(object)
  getSymbol: function(){ return this.symbol},
}

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count, char, color){ //(title, count = 20) {
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
function assertEqual(original, cloned) {
  let keys = Object.keys(original);
  return keys.every(key => original[key]===cloned[key]);/*for(let i=0; i<keys.length;i++){if(original[keys[i]] !== clone[keys[i]]) return false;}return true;*/
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
  return objs.map(elem => clone(elem));
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
        let newWall = clone(wall);
        newWall.position = {row:i, columns:j};
        board[i][j] = [newWall];//wallChar;//'#'
      }else{
        let newGrass = clone(grass);
        newGrass.position = {row:i, columns:j};
        board[i][j] = [newGrass]//grassChar;//'.'
      }
    }
  }
  //print('Creating board: rows: ' + rows + ' cols: ' + columns);
}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  if(entity.position !== undefined) board[entity.position.row][entity.position.column].push(entity);
  printBoard();
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer() {
  const x = Math.floor(board.length/2);
  const y = Math.floor(board[0].length/2);
  board[x][y].push(player);//'P';
  //print('Placing player in position x: ' + x + " y:" + y);

  //printBoard();
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows,columns);

  placePlayer();//place player in the middle

  print('Creating board and placing player...');
}

// Prints the board
function printBoard() {
  let xyBoard = '';
  
  board.forEach(row => {
                        let rowsBoard = '';
                        row.forEach(col => {  rowsBoard +=(col[col.length-1]).getSymbol()  });
                        xyBoard += rowsBoard + '\n';
                        });//for(let i=0; i< board.length; i++){let rowsBoard = ''for(let j=0; j< board[0].length; j++){rowsBoard += board[i][j]; }xyBoard += rowsBoard + '\n'}

  print(xyBoard,'blue');
}


// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level, items) {//name, level = 1, items = []) {
  if(typeof name  === 'string') player.name = name;
  if(typeof level === 'number') player.level = level;
  player.setItems(items);

  print('Create player with name ' + player.name + ' and level ' + player.level);
  return player;
}

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
    items     : [],         //(array of objects - may be empty or not depending on parameters)
    position  : position,   //(object - specified in parameters)
    type      : 'monster',  //(string - 'monster')
    //Monsters give exp (experience points) when defeated following this rule: level \* 10; e.g. level is 2 -> 2 \* 10 = 20 exp points
    setItems  : setItems,
    getSymbol : function(){ return this.type.charAt(0).toUpperCase(); },
  }

  monster.name = getMonsterRandomName();
  monster.setItems(items);
  //if(monster.position !== undefined) board[monster.position.row][monster.position.column].push(monster);
  print("Creating monster: " + monster.name, 'red');

  return monster;
}

// 
function getMonsterRandomName() {
  var num = Math.floor((Math.random() * monsterNames.length-1) + 1);
  return monsterNames[num];
}

// Creates a tradesman object with the specified items and position. hp is Infinity
function createTradesman(items, position) {
  let tradesman = {
    name        :'',                    // (string - can be anything)
    hp          :0,                     // (number - Infinity)
    items       :[],                    // (array of objects - may be empty or not depending on parameters)
    position    : {row:0, columns:0},   // (object - specified in parameters)
    type        :'tradesman',           // (string - 'tradesman')
    setItems    : setItems,
    getSymbol   : function(){ return this.type.charAt(0).toUpperCase();},
  }
  print("Creating tradesman", 'red');
  tradesman.position = position;
  //if(tradesman.position !== undefined) board[tradesman.position.row][tradesman.position.column].push(tradesman);
  tradesman.setItems(items);
  return tradesman;
}

function setItems(items){ if(typeof items === 'object'){if(items.length >=0) this.items = cloneArray(items);} }

function fillInItemsArray(){
  // let item = {
  //   symbol:     'I',
  //   name:       'Item',
  //   type:       '',  
  //   value:       0, 
  //   rarity:      0,
  //   use:         function use(){},
  //   position:    {row:0, column:0},
  //   getSymbol :  function(){ return this.symbol; },
  // };

  let potion = {
    name      :   'Common potion',//'Common potion' (if rarity 0)
    type      :   'potion',
    value     :   5,  
    rarity    :   0,//Bonus:Potion with rarity 3 restores 100% hp (sets hp back to max hp)  
    use       :   function use(){},//restores 25hp to the specified target
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
  }
  //potion.__proto__ = item;

  let bomb= {
    name      :   'Common bomb',// (if rarity 0)   
    type      :   'bomb',  
    value     :   7, 
    rarity    :   0,//Bonus: Bomb with rarity 3 deals 90% damage of hp 
    use       :   function use(){},//deals 50hp damage to the specified target
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
  }
  // bomb.__proto__ = item;

  let key={
    name      :   'Epic key',
    type      :   'key',
    value     :   150,  
    rarity    :   3,
    use       :   function use(){},//Unlocks the door to a dungeon
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
  }  
  //key.__proto__ = item;

  let unusualPotion     =   createItem(potion,{row:0, columns:0});
  unusualPotion.name    =   "Unusual potion";
  unusualPotion.value   =   10;
  unusualPotion.rarity  =   1;

  let rarePotion        =   createItem(potion,{row:0, columns:0});
  rarePotion.name       =   "Rare potion";
  rarePotion.value      =   20;
  rarePotion.rarity     =   2;

  let epicPotion = { 
    rarity: 3,
    value:  50,
    name: "Epic potion",
    use: function use(){},//Potion with rarity 3 restores 100% hp (sets hp back to max hp)
  }
  epicPotion.__proto__      =  potion;

  let unusualBomb       =   createItem(bomb,{row:0, columns:0});
  unusualBomb.name      =   "Unusual bomb";
  unusualBomb.value     =   12;
  unusualBomb.rarity    =   1;

  let rareBomb          =   createItem(bomb,{row:0, columns:0});
  rareBomb.name         =   "Rare bomb";
  rareBomb.value        =   25;
  rareBomb.rarity       =   2;

  let epicBomb = { 
    rarity: 3,
    value:  100,
    use: function use(){},//Bomb with rarity 3 deals 90% damage of hp
  }
  epicBomb.__proto__    =  bomb;
  
  items.push(potion);
  items.push(unusualPotion);
  items.push(rarePotion);
  items.push(epicPotion);

  items.push(bomb);
  items.push(unusualBomb);
  items.push(rareBomb);
  items.push(epicBomb);

  items.push(key);
}



// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  let newItem = clone(item);
  newItem.position = position;
  return newItem;
}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  let dungeon = {
    position    : position,      // (object - specified in parameters)
    type        : 'dungeon',     // (string - 'tradesman')
    getSymbol   : function(){ return this.type.charAt(0).toUpperCase();},
  } 
  //if(dungeon.position !== undefined) board[dungeon.position.row][dungeon.position.column].push(dungeon);
  print("Creating dungeon", 'red');
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

fillInItemsArray();

run();


function run() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      //createPlayer('HopperCat');
      createPlayer('HopperCat',1,[items[0],items[2]]);//setName('HopperCat');
      next();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      initBoard(7, 15);
      printBoard();
      updateBoard(createMonster(1,[items[1], items[4]],{row:1, column:5}));
      updateBoard(createMonster(1,[items[1], items[4]],{row:1, column:6}));
      updateBoard(createMonster(3,[items[1], items[4]],{row:1, column:2}));
      updateBoard(createItem(items[0], {row:2, column:7})); 
      updateBoard(createTradesman(items, {row:4, column:7}));
      updateBoard(createDungeon({row:1,column:7}));
      printBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}