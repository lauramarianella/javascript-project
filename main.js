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

const RARITY_LIST       = ['Common', 'Unusual', 'Rare', 'Epic'];
const items             = []; // Array of item objects. These will be used to clone new items with the appropriate properties.
const GAME_STEPS        = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep            = 0; // The current game step, value is index of the GAME_STEPS array.
let board               = []; // The board holds all the game entities. It is a 2D array.

let confuse = {
  name          : 'confuse',            // (string)
  requiredLevel : 1,                    // (number - the skill should not be useable if player level is lower)
  cooldown      : 0,                    // (number - initial value is 0 meaning it's useable, over 0 means we have to wait. This gets updated to the cooldown value when skill is used and gradually decreases until it's back to 0)
  use           : function use(target){ //- use: expects a target as parameter and reverses the name of the target entity as well as dealing [player level \* 25] damage (e.g. level 1 -> deals 25hp)
                    if(player.level < this.requiredLevel){//if(this.parent.parent.level < this.requiredLevel){
                      print("The skill '" + this.name + "' can't be use in level " + player.level,'red');
                      return;
                    }
                    if(this.cooldown === 0){
                      let reverseNameStr = target.name.split('').reverse().join('');
                      print("Confusing " + target.name + "...", 'red');
                      print("..." + reverseNameStr + ", target is confused and hurts itself in the process");
                      target.hp-= 25;
                      if(target.hp < 0) target.hp = 0;
                      print(target.name +' hit! -25hp', 'green');  
                      print('HP left:' + target.hp, 'green'); 
                      this.cooldown = 10000;//##################

                      let idIntervalCoolDown = setInterval(()=> (this.cooldown <=0)?clearInterval(idIntervalCoolDown):this.cooldown -= 100,100);
                    }else{
                      print('Skill in cooldown. ' + this.cooldown + 'ms remaining.');
                    }
                  },
};

let steal   = {
  name          : 'steal',              // (string)
  requiredLevel : 3,                    // (number - the skill should not be useable if player level is lower)
  cooldown      : 0,                 // (number - initial value is 0 meaning it's useable, over 0 means we have to wait. This gets updated to the cooldown value when skill is used and gradually decreases until it's back to 0)  
  use:          function use(target){   //- use: expects a target as parameter and steals all items of rarity 1 or lower (i.e. unusual or common). Stolen items should be added to the player and removed from the target entity.
                  if(player.level < this.requiredLevel){
                    print("The skill '" + this.name + "' can't be use in level " + player.level,'red');
                    return;
                  }
                  if(this.cooldown === 0){
                    target.items.forEach( (item, i)=> {
                                                        if(item.rarity <= 1){
                                                          player.setItems(player.items.concat(item));
                                                          target.items.splice(i,1)[0];//return item
                                                          print('Stoling item: ' + item.name);
                                                        }
                                                      }); 
                      this.cooldown = 25000;//##################
                      
                    let idIntervalCoolDown = setInterval(()=> (this.cooldown <=0)?clearInterval(idIntervalCoolDown):this.cooldown -= 100,100);
                  }else{
                    print('Skill in cooldown. ' + this.cooldown + 'ms remaining.');
                  }
                },
};

let player = {// The player object
  name:           '',  
  level:          1,                        // (number - 1)  
  items:          [],                       // (array of objects - [])
  skills:         [confuse, steal],         // (array of objects - [])
  attack:         10,                       // (number - 10)
  speed:          3000,                     // (number - 2000)
  hp:             100,                      // (number - 100)
  gold:           0,                        // (number - 0 to start. Can get gold by selling items to the tradesman)
  exp:            0,                        // (number - 0 to start. Experience points, increase when slaying monsters)
  type:           'player',                 // (string - 'player')
  position:       {row:0,column:0},         //(object - can be left out and set when needed)
  getMaxHp:       function(){ return this.level*100; }, //(function - a method that returns max hp. Value is level \* 100, e.g. level 2 -> 200 max hp)
  levelUp:        function() {              //(function - a method to update the level and the different properties affected by a level change. 
                                            //Level up happens when exp >= [player level * 20])
                                            //When leveling up, exp must be decreased by the amount used to level up, 
                                            //e.g. exp required to level up = 100. current exp = 120  
                                            //-> levelUp is called, incrementing by 1 the level and updating exp to exp = 120 - 100 = 20
                                if(this.exp >= this.getExpToLevel()){
                                  this.exp -= this.getExpToLevel();
                                  this.setLevel(++this.level);
                                }
                              
                              },                   
  getExpToLevel:  function(){return this.level*20;},//(function - a method returning exp required to level. Value is level \* 20, e.g. level 2 -> 40exp required)
  setItems:       setItems,
  getSymbol:      function(){return this.type.charAt(0).toUpperCase(); },
  setLevel:       function(level){
                    this.level  = level;      //1
                    this.hp     = level*100;  //100
                    this.speed  = 3000/level; //3000
                    this.attack = level*10;   //10
                  },
  getSkill:       getSkill,
  getIndexSkill:  getIndexSkill,
}; // The player object

const grass = {
  symbol:   '.',
  type:     'grass',
  position: {row:0,column:0},  //(object)
  getSymbol: function(){ return this.symbol},
}

const wall = {
  symbol:   '#',
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
function useItem(itemName, target) {
  if(target === undefined){
    let arrayEntities = board[player.position.row][player.position.column];
    target = arrayEntities[arrayEntities.length-2];
  }
  if(target.type === 'wall' || target.type === 'grass') return;

  let item = undefined;//the item to use against the entity
  item = popItem(itemName, player);

  if(item !== undefined){
    if(item.type === 'potion') {
      item.use(player);
    }else{
      item.use(target);
    }
  }else{
    print("Player doesn't have such item: '" + itemName + "'");
  }
}

function popItem(itemName, entity){
  let index = undefined;
  entity.items.forEach( (item, i) => { if(item.name.toLowerCase() === itemName.toLowerCase()){ 
                                          index = i;  
                                        } });
  if(index !== undefined){
    return entity.items.splice(index,1)[0];//return item
  }
  return undefined;
}

function getSkill(skillName){
  let index = undefined;
  this.skills.forEach( (item, i) => { if(item.name.toLowerCase() === skillName.toLowerCase()){ 
                                          index = i;  
                                        } });
  if(index !== undefined){
    return this.skills[index];//return skill
  }
  return undefined;
}

function getIndexSkill(skillName){
  let index = undefined;
  this.skills.forEach( (item, i) => { if(item.name.toLowerCase() === skillName.toLowerCase()){ 
                                          index = i;  
                                        } });
  return index;
}


// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {
  if(target === undefined){
    let arrayEntities = board[player.position.row][player.position.column];
    target = arrayEntities[arrayEntities.length-2];
  }
  if(target.type === 'wall' || target.type === 'grass') return;
  skillName = skillName.toLowerCase();

  let skill = player.getSkill(skillName);
  if(skill === undefined) {
    print("Player doesn't have the skill: '" + skillName + "'");
    return;
  }
  skill.use(target);

  // let indexSkill = player.getIndexSkill(skillName);
  // player.skills[indexSkill].use(target);
}


// First item of matching type is used
//target is the Tradesman
function buy(itemIdx, target) {
  let arrayEntities = board[player.position.row][player.position.column];
  target = arrayEntities[arrayEntities.length-2];
  let item = target.items[itemIdx];//before buying it
  
  if(item !== undefined){
    //item.use(target);//no bcz it's not using it...
    if(player.gold>=item.value){//if enough gold
      player.gold -= item.value;
      item = target.items.splice(itemIdx,1)[0];//popItem(itemName, target);
      player.setItems(player.items.concat(item));
      print("Purchased " + item.name, 'red');
      print("Gold: " + player.gold, 'red');
    }else{ print("Not enough gold :( Required:" + item.value + " gold: " + player.gold, 'red');}
  }else{
    print(target.name + " doesn't have an item with id: '" + itemIdx + "'", 'red');
  }
}

// First item of matching type is used
//target is the Tradesman
function sell(itemIdx, target) {
  let arrayEntities = board[player.position.row][player.position.column];
  target = arrayEntities[arrayEntities.length-2];
  let item = player.items[itemIdx];//before buying it
  
  if(item !== undefined){
    //item.use(target);//no bcz it's not using it...
    //if(tradesman.gold >=item.value){//if enough gold
      item = player.items.splice(itemIdx,1)[0];//popItem(itemName, target);
      target.setItems(target.items.concat(item));
      player.gold = item.value;
      print('Sold ' + item.name, 'blue');
      print('Gold: ' + player.gold, 'blue');
    //}
  }else{
    print("Player " + player.name + " can sell an inexistent item with id: '" + itemIdx + "'", 'red');
  }
}

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
        board[i][j] = [newWall];//'#'
      }else{
        let newGrass = clone(grass);
        newGrass.position = {row:i, columns:j};
        board[i][j] = [newGrass];//'.'
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
  player.position.row = x;
  player.position.column = y;
  board[x][y].push(player);//'P';
  //print('Placing player in position x: ' + x + " y:" + y);

  //printBoard();
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows,columns);

  placePlayer();//place player in the middle

  print('Creating board and placing player...');
  printBoard();
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
  if(typeof level === 'number'){ 
    player.setLevel(level);
  }
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
    level     : 1,          //(number - specified in parameters)
    hp        : 100,        //(number - max is level \* 100)
    attack    : 10,         //(number - level \* 10)
    speed     : 6000,       //(number - 6000 / level)??
    items     : [],         //(array of objects - may be empty or not depending on parameters)
    position  : position,   //(object - specified in parameters)
    type      : 'monster',  //(string - 'monster')
    //Monsters give exp (experience points) when defeated following this rule: level \* 10; e.g. level is 2 -> 2 \* 10 = 20 exp points
    setItems  : setItems,
    getSymbol : function(){ return this.type.charAt(0).toUpperCase(); },//return M for show it in the board
    setLevel  : function(level){
                  this.level  = level;      //1
                  this.hp     = level*100;  //100
                  this.speed  = 6000/level; //6000
                  this.attack = level*10;   //10
                },
    getMaxHp  : function(){ return this.level * 100; },
    getExp    : function(){ return this.level * 10;  },
  }

  monster.name = getMonsterRandomName();
  monster.setItems(items);
  if(level > 0) monster.setLevel(level);
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
    getMaxHp    :()=> Infinity,
    setItems    : setItems,
    getSymbol   : function(){ return this.type.charAt(0).toUpperCase();},
  }
  print("Creating tradesman", 'red');
  tradesman.name ='Mysterious trader';
  tradesman.position = position;
  //if(tradesman.position !== undefined) board[tradesman.position.row][tradesman.position.column].push(tradesman);
  tradesman.setItems(items);
  return tradesman;
}

function setItems(items){ if(typeof items === 'object'){if(items.length >=0) this.items = cloneArray(items);} }

function initializeItemsArray(){//use RARITY_LIST
  setItemName = function(){ return this.name = RARITY_LIST[this.rarity] + ' ' + this.type };

  let potion = {   
    name      :   '',//'Common potion',//'Common potion' (if rarity 0) 
    type      :   'potion',
    value     :   5,  
    rarity    :   0,//Bonus:Potion with rarity 3 restores 100% hp (sets hp back to max hp) 
    use       :   function use(target){//restores 25hp to the specified target
                    let maxHp = target.getMaxHp();
                    switch(this.rarity){
                      case 3://Bonus:Potion with rarity 3 restores 100% hp (sets hp back to max hp) 
                        target.hp = maxHp;
                        print('Used potion! 100%hp (Total HP: ' + target.hp +')');
                        break;
                      default:
                        target.hp += 25;
                        if(target.hp>maxHp) target.hp = maxHp;
                        print('Used potion! +25hp (Total HP: ' + target.hp +')');
                        break;                      
                    }
                  },
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
    setItemName : setItemName,
  }
  potion.setItemName();
  
  let bomb= {
    name      :   '',//'Common bomb',// (if rarity 0) 
    type      :   'bomb',  
    value     :   7, 
    rarity    :   0,//Bonus: Bomb with rarity 3 deals 90% damage of hp 
    use       :   function use(target){//deals 50hp damage to the specified target                   
                    switch(this.rarity){                      
                      case 3://bomb with rarity 3 deals 90% of hp
                        target.hp = target.hp*10/100;
                        if(target.hp<0) target.hp = 0;
                        print('Used bomb! -90%hp (Total HP: ' + target.hp +')');
                        break;
                      default://case 0,1,2
                        target.hp -= 25;
                        if(target.hp<0) target.hp = 0;
                        print('Used bomb! -25hp (Total HP: ' + target.hp +')');
                        break;
                    }
                  },
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
    setItemName : setItemName,
  }
  bomb.setItemName();

  let key={
    name      :   '',//'Epic key',
    type      :   'key',
    value     :   150,  
    rarity    :   3,
    use       :   function use(targetDungeon){//Unlocks the door to a dungeon
                    print('Unlocking dungeon...');
                    targetDungeon.unlock();                    
                  },
    position  :   {row:0, column:0},
    symbol    :   'I',
    getSymbol :   function(){ return this.symbol; },
    setItemName : setItemName,
  } 
  key.setItemName();

  let unusualPotion     =   createItem(potion,{row:0, columns:0});
  unusualPotion.value   =   10;
  unusualPotion.rarity  =   1;
  unusualPotion.setItemName();//unusualPotion.name    =   "Unusual potion";

  let rarePotion        =   createItem(potion,{row:0, columns:0});  
  rarePotion.value      =   20;
  rarePotion.rarity     =   2;
  rarePotion.setItemName();//rarePotion.name       =   "Rare potion";

  let epicPotion        =   createItem(potion,{row:0, columns:0});  
  epicPotion.value      =  50;
  epicPotion.rarity     =  3;    
  epicPotion.setItemName();//name: "Epic potion";//Potion with rarity 3 restores 100% hp (sets hp back to max hp)


  let unusualBomb       =   createItem(bomb,{row:0, columns:0});
  unusualBomb.value     =   12;
  unusualBomb.rarity    =   1;
  unusualBomb.setItemName();//unusualBomb.name      =   "Unusual bomb";

  let rareBomb          =   createItem(bomb,{row:0, columns:0});  
  rareBomb.value        =   25;
  rareBomb.rarity       =   2;
  rareBomb.setItemName();//rareBomb.name         =   "Rare bomb";

  let epicBomb = createItem(bomb,{row:0, columns:0});
  epicBomb.value =  100;
  epicBomb.rarity= 3,
  epicBomb.setItemName();//"Epic bomb"//Bomb with rarity 3 deals 90% damage of hp
  
  
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
function createDungeon(position, isLocked, hasPrincess, items, gold) {//position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  let dungeon = {    
    isLocked    : true,
    hasPrincess : true,
    items       : [],
    gold        : 0,
    position    : position,      // (object - specified in parameters)
    type        : 'dungeon',     // (string - 'tradesman')
    getSymbol   : function(){ return this.type.charAt(0).toUpperCase();},
    setItems    : setItems,
    unlock      : function unlock(){ 
                                      if(isLocked === false){
                                        print('The dungeon was already unlocked!'); 
                                      }else{
                                        isLocked = false; 
                                        print('The dungeon is unlocked!'); 
                                      }

                                      if(hasPrincess){
                                        print('You have freed the princess! Congratulations!'); 
                                        print('The adventurer ' + player.name + ' and the princess lived happily ever after...');
                                      }else{//player receives items and gold                                        
                                        player.gold = player.gold + this.gold;
                                        player.setItems(player.items.concat(this.items));//
                                        print('There is not a princess!'); 
                                        print("You have received " + this.gold + " in gold and the Dungeon's items");   
                                        console.log(player.items);                                      
                                      }
                                      printSectionTitle("GAME OVER", undefined, undefined, 'red');
                                    },
  } 
  //if(dungeon.position !== undefined) board[dungeon.position.row][dungeon.position.column].push(dungeon);
  dungeon.position = position;

  if(typeof isLocked    === 'boolean') dungeon.isLocked = isLocked;
  if(typeof hasPrincess === 'boolean') dungeon.hasPrincess = hasPrincess,
  dungeon.setItems(items);
  if(typeof gold === 'number') dungeon.gold = gold;

  print("Creating dungeon", 'red');
  return dungeon;
}

// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {//Up, Down, Left, Right
  let toX         = player.position.row;
  let toY         = player.position.column;
  let movePlayer  = false;
  let fromX       = player.position.row;
  let fromY       = player.position.column;

  let currentEntitiesArray;
  let entity;

  direction   = direction.toLowerCase();
  switch (direction) {
    case 'u'://'up':
      toX--;
      currentEntitiesArray = board[toX][toY];
      entity = currentEntitiesArray[currentEntitiesArray.length-1];
      break;
    case 'd'://'down':
      toX++;
      currentEntitiesArray = board[toX][toY];
      entity = currentEntitiesArray[currentEntitiesArray.length-1];
      break;
    case 'l'://'left':
      toY--;
      currentEntitiesArray = board[toX][toY];
      entity = currentEntitiesArray[currentEntitiesArray.length-1];
      break;
    case 'r'://'right':
      toY++;
      currentEntitiesArray = board[toX][toY];
      entity = currentEntitiesArray[currentEntitiesArray.length-1];
      break;
    default:
      break;
  }

  if (entity.type === 'wall') {
    print("Player can't cross the walls");
    return;
  }


  (board[fromX][fromY]).pop();//remove player from former position

  player.position.row     = toX;//change player's position
  player.position.column  = toY;//change player's position
  updateBoard(player);          //add player to board in new x,y
  playGame(entity);
  //printBoard();
}

function playGame(entity){
  if(entity.length >= 0){//could be an array of items or one only item
    player.setItems(player.items.concat(entity));
    print('Found ' + entity.length + ' items! ');
    return true;
  }

  switch(entity.type.toLowerCase()){    
    case 'monster'://fight
      print('Encountered a ' + entity.name);
      fight(entity);
      return false;
    case 'tradesman'://buy or sell
      print('Encountered ' + entity.name + '! You can buy(itemIdx) and sell(itemIdx) items $$$');
      print("Items for sale:");
      console.log(entity.items);      
      return false;
    case 'dungeon'://ehh
      print('Found dungeon!');
      print("You need the key to open it. If you have the key, try useItem('Key') to unlock the door.");
      print("Rumours are some monsters have keys to dungeons. The tradesman might also have spare keys to sell but they don't come cheap");
      checkDungeon(entity);//could be unlocked, also couldn't be a princess 
      return false;
    case 'wall'://don't move
      return false;
    case 'grass'://just move
      return true;
    case 'potion'://pick it up
      player.setItems(player.items.concat(entity));
      print('Found item! ' + entity.name);
      return true;
    case 'bomb'://pick it up
      player.setItems(player.items.concat(entity));
      print('Found item! ' + entity.name);
      return true;
    case 'key'://pick it up
      player.setItems(player.items.concat(entity));
      print('Found item! ' + entity.name);
      return true;
    default:
      return false;
  }
}

let idFightPlayerVsMonster;
let idFightMonsterVsPlayer;
function fight(monster){
  idFightPlayerVsMonster = setInterval(() => attack(player,monster),player.speed);
  idFightMonsterVsPlayer = setInterval(() => attack(monster,player),monster.speed);
}

function attack(attacker, receiver){
  receiver.hp-= attacker.attack;
  if(receiver.hp < 0) receiver.hp = 0;

  let color = 'green';
  if(receiver.type === 'player') color = 'red';
  print(receiver.name +' hit! -' + receiver.attack + 'hp', color);  
  print('Hp left: ' + receiver.hp, color);
  if(receiver.hp <=0 ){//if one of the die
    clearInterval(idFightPlayerVsMonster);
    clearInterval(idFightMonsterVsPlayer);
    receiver.hp = 0; //I got -5 ...
    print(receiver.name + ' defeated.', 'black');    
    if(receiver.type !== 'player'){
      let arrayEntities = board[attacker.position.row][attacker.position.column];
      arrayEntities.splice(arrayEntities.length-2,1);//remove the monster

      attacker.exp = attacker.exp + receiver.getExp();
      print('Congratulations!! You have received '+ receiver.getExp() + ' exp points.', 'black');
      attacker.setItems(attacker.items.concat(receiver.items));
      receiver.items = [];
      //console.log(receiver.items);
      print('You have received the following items:', 'black');      
      console.log(attacker.items);

      attacker.levelUp();
    }else{
      let arrayEntities = board[attacker.position.row][attacker.position.column];
      arrayEntities.splice(arrayEntities.length-1,1);//remove the player
      printSectionTitle('GAME OVER',undefined, undefined, 'red');
    }
  }else if(!assertEqual(attacker.position,receiver.position)){//player moved to another cell
    clearInterval(idFightPlayerVsMonster);
    clearInterval(idFightMonsterVsPlayer);
    print('Player run away...', 'red');
  }
}

function checkDungeon(dungeon){ 
  if(dungeon.isLocked){
    print("Dungeon is locked...",'black');
    (dungeon.hasPrincess)?print(player.name + " needs a key to free the princess",'black'):print('There is not a princess!','black');
  }else{
    if(dungeon.hasPrincess){
      print('You have freed the princess! Congratulations!'); 
      print('The adventurer ' + player.name + ' and the princess lived happily ever after...');
      printSectionTitle("GAME OVER", undefined, undefined, 'red');
    }else{//player receives items and gold                                        
      player.gold = player.gold + dungeon.gold;
      player.setItems(player.items.concat(dungeon.items));//
      print("The dungeon is unlocked!",'black');
      print('Unfortunately, there was no princess.'); 
      print("As consolation, you found " + dungeon.items.length + " items and " + dungeon.gold + " gold.");   
      console.log(player.items);                                      
    }
  }
}

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

function run() {
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
    default:
      break;
  }
}

//functions calls
print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

initializeItemsArray();

run();


function runDebug() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      //createPlayer('HopperCat');
      createPlayer('HopperCat',1,[items[0]]);//setName('HopperCat');
      next();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      initBoard(7, 15);
      updateBoard(createMonster(1,[items[1], items[2], items[5], items[6]],{row:2, column:7}));
      //updateBoard(createMonster(1,[items[1], items[4]],{row:2, column:6}));
      //updateBoard(createMonster(3,[items[1], items[4]],{row:1, column:2}));
      //updateBoard(createItem(items[0], {row:3, column:8})); 
      //updateBoard(createTradesman(items, {row:4, column:7}));
      //updateBoard(createDungeon({row:2,column:7}, false, false));
      //updateBoard(createDungeon({row:2,column:7},true,false, [items[1], items[4]], 50));
      printBoard();
      next();
      break;
    case 'GAME_START':
      startGame();//(3,7)
      // move('U');//(2,7)
      // move('l');//(2,6)
      // move('d');//(3,6)
      // move('r');//(3,7)

      // move('U');//(2,7)
      // move('r');//(2,8)
      // move('U');//(1,8)
      // move('U');//(1,8)
      // move('U');//(1,8)

      // move('r');//(1,9)
      // move('r');//(1,10)
      // move('r');//(1,11)
      // move('r');//(1,12)
      // move('r');//(1,13)
      // move('r');//(1,14)

      move("U");
      //setTimeout(() => useItem('Epic key'),10000);//put it when there is a Dungeon      
      //to test to move when dying setTimeout(()=> move('down'), 10000);
      //printBoard();

      //move("D");
      //setTimeout(()=>(move('u')),10000);
      //setTimeout(() => sell(0),10000);
      //setTimeout(() => buy(0),10000);

      //setTimeout(() => useItem('Common potion'),19000);
      //setTimeout(() => useItem('Epic potion'),19000);

      //setTimeout(() => useItem('Common bomb'),19000);
      //setTimeout(() => useItem('Epic bomb'),19000);

      // setTimeout(() => useSkill('Confuse'),0);
      // setTimeout(() => useSkill('Confuse'),5000);
      // setTimeout(() => useSkill('Confuse'),8000);
      // setTimeout(() => useSkill('Confuse'),9000);
      // setTimeout(() => useSkill('Confuse'),10000);
      // setTimeout(() => useSkill('Confuse'),11000);
      // setTimeout(() => useSkill('Confuse'),15000);
      // setTimeout(() => useSkill('Confuse'),20000);
      
      setTimeout(() => useSkill('Steal'),0);
      setTimeout(() => useSkill('Steal'),5000);
      setTimeout(() => useSkill('Steal'),8000);
      setTimeout(() => useSkill('Steal'),9000);
      setTimeout(() => useSkill('Steal'),10000);
      setTimeout(() => useSkill('Steal'),11000);
      setTimeout(() => useSkill('Steal'),15000);
      setTimeout(() => useSkill('Steal'),20000);

      break;
  } 
}