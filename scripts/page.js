/* ------------------- EECS 493 Assignment 3 Starter Code ------------------ */

/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 3;            // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1240;
const maxPersonPosY = 680;
const minPersonPosX = 40;
const minPersonPosY = 40;
const PERSON_SPEED = 5;                // #pixels each time player moves by
const portalOccurrence = 6000;         // portal spawns every 6 seconds
const portalGone = 3000;               // portal disappears in 3 seconds
const shieldOccurrence = 9000;         // shield spawns every 9 seconds
const shieldGone = 3000;               // shield disappears in 3 seconds

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;

// TODO: ADD YOUR GLOBAL HELPER VARIABLES (IF NEEDED)
// let maxX = 1280;
// let maxY = 720;
let isStopped = false;
let isPaused = false;
let showTutorial = true;
let asteroidSpawnRate = 1000;
let portalSpawnRate = 6000;
let portalLifetime = 3000;
let shieldSpawnRate = 9000;
let shieldLifetime = 3000;
let playerRefreshRate = AST_OBJECT_REFRESH_RATE;
let scoreRefreshRate = 500;
let player;
let playerPosX = 0;
let playerPosY = 0;
let isShielded = false;

let updatePlayerInterval;
let asteroidSpawnInterval;
let shieldSpawnInterval;
let portalSpawnInterval;
let updateScoreInterval;

let score = 0;
let danger = 20;
let level = 1;
let difficulty = 1;

let volume = 0.5;
let deathSound = new Audio("./src/audio/die.mp3");
let collectSound = new Audio("./src/audio/collect.mp3");

/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
  // jQuery selectors
  game_window = $('.game-window');
  game_screen = $("#actual-game");
  asteroid_section = $('.asteroidSection');
  // hide all other pages initially except landing page
  game_screen.hide(); // Comment me out when testing the spawn() effect below


  /* -------------------- ASSIGNMENT 2 SELECTORS BEGIN -------------------- */
  $(".tutorial-window").hide();

  $(".settings-window").hide();

  $(".play-button").click(function () {
    if(isPaused)
    {
      $(".asteroidSection").show();
      $(".pause-window").show();
      $(".pause-overlay").show();
      $(".get-ready-screen").show();
  
      $("#main-menu").hide();
      $(".tutorial-window").hide();
      $("pause-window").show();
      return;
    }
    if (showTutorial) {
      $(".tutorial-window").show();
      showTutorial = false;
    }
    else {
      $("#main-menu").hide();
      $(".tutorial-window").hide();

      startGame();
    }
  });

  $(".start-over-button").click(function () {
    $("#main-menu").hide();
    $(".game-over-window").hide();
    startGame();

  })

  $(".settings-button").click(function () {
    $(".settings-window").show();
  })

  $(".close-settings-button").click(function () {
    $(".settings-window").hide();
  })

  $("#difficulty-button-normal").css("outline", "6px groove yellow");

  $("#difficulty-button-hard").click(difficultyInputHandler);

  $("#difficulty-button-easy").click(difficultyInputHandler);

  $("#difficulty-button-normal").click(difficultyInputHandler);

  var slider = document.getElementById("volume-slider");
  var output = document.getElementById("volume-label");
  output.innerHTML = slider.value;
  deathSound.volume = slider.value / 100;
  collectSound.volume = slider.value / 100;
  slider.oninput = function () {
    output.innerHTML = this.value;
    deathSound.volume = this.value / 100;
    collectSound.volume = this.value / 100;
  }
  /* --------------------- ASSIGNMENT 2 SELECTORS END --------------------- */


  // TODO: DEFINE YOUR JQUERY SELECTORS (FOR ASSIGNMENT 3) HERE
  player = $(".player-img");

  $(".asteroidSection").hide();
  $(".game-over-window").hide();
  $(".restart-confirmation-window").hide();
  $(".pause-window").hide();
  $(".pause-overlay").hide();

  $(".start-game-button").click(function () {
    $("#main-menu").hide();
    $(".tutorial-window").hide();
    startGame();
  });
  $(".pause-button-img").click(pauseGame);
  $(".resume-button").click(resumeGame);

  $(".exit-button").click(function () {
    $(".asteroidSection").hide();
    $(".pause-window").hide();
    $(".pause-overlay").hide();
    $(".get-ready-screen").hide();

    $("#main-menu").show();
    $(".play-button").show();
    $(".play-button").text("Resume Game");
    $(".settings-button").show();
  });

  $(".restart-button").click(function () {
    $(".restart-confirmation-window").show();
    $(".pause-window").hide();
  })

  $("#restart-yes").click(function () {
    $(".restart-confirmation-window").hide();
    stopGame();
    $(".curAsteroid").remove();
    $(".shield").remove();
    $(".portal").remove();  
    setTimeout(() => {
      $(".pause-overlay").hide();
      startGame();
      }, 3000);
  });

  $("#restart-no").click(function () {
    $(".restart-confirmation-window").hide();
    $(".pause-window").show();
  });
  // Example: Spawn an asteroid that travels from one border to another
  // spawn(); // Uncomment me to test out the effect!
});


/* ---------------------------- EVENT HANDLERS ----------------------------- */
// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') LEFT = true;
  if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') RIGHT = true;
  if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') UP = true;
  if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') DOWN = true;
  if (e.key == 'Escape') {
    pauseGame();
  }
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') LEFT = false;
  if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') RIGHT = false;
  if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') UP = false;
  if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') DOWN = false;
}



/* ------------------ ASSIGNMENT 2 EVENT HANDLERS BEGIN ------------------ */
function difficultyInputHandler() {
  $("#scoreboard-level-value").text(level);
  $("#scoreboard-score-value").text(score);

  if (this.id == "difficulty-button-easy") {
    difficulty = 0;
    updateDifficulty();
    $("#scoreboard-danger-value").text(10);
    this.style.outline = "6px groove yellow";
    document.getElementById("difficulty-button-normal").style.outline = "";
    document.getElementById("difficulty-button-hard").style.outline = "";
  }
  else if (this.id == "difficulty-button-normal") {
    difficulty = 1;
    updateDifficulty();
    $("#scoreboard-danger-value").text(20);
    this.style.outline = "6px groove yellow";
    document.getElementById("difficulty-button-easy").style.outline = "";
    document.getElementById("difficulty-button-hard").style.outline = "";

  }
  else if (this.id == "difficulty-button-hard") {
    difficulty = 2;
    updateDifficulty();
    $("#scoreboard-danger-value").text(30);
    this.style.outline = "6px groove yellow";
    document.getElementById("difficulty-button-normal").style.outline = "";
    document.getElementById("difficulty-button-easy").style.outline = "";
  }
}

function updateDifficulty() {
  if(difficulty == 0)
  {
    astProjectileSpeed = 1 + (level-1) * 0.5;
    asteroidSpawnRate = 1000;
  }
  else if (difficulty == 1)
  {
    astProjectileSpeed = 3 + (level-1) * 0.5;
    asteroidSpawnRate = 800;
  }
  else if (difficulty == 2)
  {
    astProjectileSpeed = 5 + (level-1) * 0.5;
    asteroidSpawnRate = 600;
  }
}
function updateProjectileSpeed()
{
  astProjectileSpeed += (level-1) * 0.5;
}
/* ------------------- ASSIGNMENT 2 EVENT HANDLERS END ------------------- */

// TODO: ADD MORE FUNCTIONS OR EVENT HANDLERS (FOR ASSIGNMENT 3) HERE
function startGame() {
  level = 1;
  score = 0;
  $(".asteroidSection").hide();
  setDefaultDanger();
  updateScoreboard();
  updateDifficulty();
  player.attr("src", "./src/player/player.gif")
  isStopped = false;
  isPaused = false;

  game_screen.show();
  $(".game-overlay-container").show().find("*").show();
  setTimeout(() => {
    $(".get-ready-central-container").hide();
    $(".asteroidSection").show();

    updatePlayerInterval = setInterval(() => {
      updatePlayer();
    }, playerRefreshRate);

    asteroidSpawnInterval = setInterval(() => {
      spawnAsteroid();
    }, asteroidSpawnRate);


    shieldSpawnInterval = setInterval(() => {
      spawnShield();
    }, shieldSpawnRate);

    portalSpawnInterval = setInterval(() => {
      spawnPortal();
    }, portalLifetime);

    updateScoreInterval = setInterval(() => {
      updateScoreboard();
    }, scoreRefreshRate);


  }, 3000);
}

function stopGame() {
  isStopped = true;
  clearInterval(updatePlayerInterval);
  clearInterval(asteroidSpawnInterval);
  clearInterval(shieldSpawnInterval);
  clearInterval(portalSpawnInterval);
  clearInterval(updateScoreInterval);
}


function pauseGame() {
  $(".pause-overlay").show();
  $(".pause-window").show();
  isPaused = true;
}

function resumeGame() {
  $(".pause-overlay").hide();
  $(".pause-window").hide();
  isPaused = false;
  updateDifficulty();
}

function setDefaultDanger()
{
  if (difficulty == 0)
  {
    danger = 10;
  }
  if (difficulty == 1)
  {
    danger = 20;
  }
  if(difficulty == 2)
  {
    danger = 30;
  }
}

function updateScoreboard() {
  if (!(isStopped || isPaused)) {
    score += 40;
  }


  $("#scoreboard-score-value").text(score);
  $("#scoreboard-danger-value").text(danger);
  $("#scoreboard-level-value").text(level);
}

function updatePlayer() {

  //let asteroids = document.getElementsByClassName("curAsteroid");
  let asteroids = $(".curAsteroid");
  let shields = $(".shield");
  let portals = $(".portal");
  //console.log("Asteroids Array: ", typeof(asteroids), asteroids);
  asteroids.each(function () {
    let asteroidImg = $(this).find("img");
    //console.log("Asteroid Img: ", typeof(asteroidImg), asteroidImg)

    if (isColliding(player, asteroidImg)) {
      if (isShielded) {
        isShielded = false;
        this.remove();
      }
      else {
        stopGame();
        console.log("Player Collided with an ASTEROID!");
        player.attr("src", "./src/player/player_touched.gif")
        deathSound.play();
    
        setTimeout(() => {
          $("#actual-game").hide();
          $("#main-menu").show();
          $(".play-button").hide();
          $(".settings-button").hide();
          $(".score-value").text(score);
          $(".game-over-window").show();
          $(".asteroidSection").hide();

          $(".curAsteroid").remove();
          $(".shield").remove();
          $(".portal").remove();
          }, 2000);
      }
    }

    shields.each(function () {
      // console.log(typeof(this), this);
      // console.log(typeof(player), player);
      let $shieldImg = $(this);
      // console.log(typeof($shieldImg), $shieldImg);
      if (isColliding(player, $shieldImg)) {
        console.log("Player Collided with a SHIELD!");
        collectSound.play();
        isShielded = true;
        this.remove();
      }
    });

    portals.each(function () {
      // console.log(typeof(this), this);
      // console.log(typeof(player), player);
      let $portalImg = $(this);
      // console.log(typeof($portalImg), $portalImg);
      if (isColliding(player, $portalImg)) {
        console.log("Player Collided with a PORTAL!");
        collectSound.play();
        this.remove();
        level++;
        danger += 2;
        updateProjectileSpeed();
      }
    });


    //$("#scoreboard-score-value").text = ;

  });


  if (isStopped || isPaused) {
    return;
  }
  playerPosX = player.position().left + player.width() / 2;
  playerPosY = player.position().top + player.height() / 2;
  // console.log(`X: ${playerPoxX}`);
  // console.log(`Y: ${playerPoxY}`);
  $("#debug-player-coords-x").text(parseFloat(playerPosX.toPrecision(4)));
  $("#debug-player-coords-y").text(parseFloat(playerPosY.toPrecision(4)));
  let diagFactor = Math.sqrt(2);
  if (LEFT && UP) {
    if (isShielded) {
      player.attr("src", "./src/player/player_shielded_left.gif")
    }
    else {
      player.attr("src", "./src/player/player_left.gif")
    }
    playerPosX -= PERSON_SPEED / diagFactor;
    playerPosY -= PERSON_SPEED / diagFactor;
  }
  else if (LEFT && DOWN) {
    if (isShielded) {
      player.attr("src", "./src/player/player_shielded_left.gif")
    }
    else {
      player.attr("src", "./src/player/player_left.gif")
    }
    playerPosX -= PERSON_SPEED / diagFactor;
    playerPosY += PERSON_SPEED / diagFactor;
  }
  else if (RIGHT && UP) {
    if (isShielded) {
      player.attr("src", "./src/player/player_shielded_right.gif")
    }
    else {
      player.attr("src", "./src/player/player_right.gif")
    }
    playerPosX += PERSON_SPEED / diagFactor;
    playerPosY -= PERSON_SPEED / diagFactor;
  }
  else if (RIGHT && DOWN) {
    if (isShielded) {
      player.attr("src", "./src/player/player_shielded_right.gif")
    }
    else {
      player.attr("src", "./src/player/player_right.gif")
    }
    playerPosX += PERSON_SPEED / diagFactor;
    playerPosY += PERSON_SPEED / diagFactor;
  }
  else {
    if (LEFT) {
      if (isShielded) {
        player.attr("src", "./src/player/player_shielded_left.gif")
      }
      else {
        player.attr("src", "./src/player/player_left.gif")
      }
      playerPosX -= PERSON_SPEED;
    }
    if (RIGHT) {
      if (isShielded) {
        player.attr("src", "./src/player/player_shielded_right.gif")
      }
      else {
        player.attr("src", "./src/player/player_right.gif")
      }
      playerPosX += PERSON_SPEED;
    }
    if (UP) {
      if (isShielded) {
        player.attr("src", "./src/player/player_shielded_up.gif")
      }
      else {
        player.attr("src", "./src/player/player_up.gif")
      }
      playerPosY -= PERSON_SPEED;
    }
    if (DOWN) {
      if (isShielded) {
        player.attr("src", "./src/player/player_shielded_down.gif")
      }
      else {
        player.attr("src", "./src/player/player_down.gif")
      }
      playerPosY += PERSON_SPEED;
    }
  }

  if (!LEFT && !RIGHT && !UP && !DOWN) {
    if (isShielded) {
      player.attr("src", "./src/player/player_shielded.gif")
    }
    else {
      player.attr("src", "./src/player/player.gif")
    }
  }

  if (playerPosX < minPersonPosX) {
    playerPosX = minPersonPosX;
  }
  if (playerPosX > maxPersonPosX) {
    playerPosX = maxPersonPosX;
  }
  if (playerPosY < minPersonPosY) {
    playerPosY = minPersonPosY;
  }
  if (playerPosY > maxPersonPosY) {
    playerPosY = maxPersonPosY;
  }
  player.css("left", playerPosX);
  player.css("top", playerPosY);
}

/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
  // constructs an Asteroid object
  constructor() {
    /*------------------------Public Member Variables------------------------*/
    // create a new Asteroid div and append it to DOM so it can be modified later
    const objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAsteroid' > <img src = 'src/asteroid.png'/></div>";
    asteroid_section.append(objectString);
    // select id of this Asteroid
    this.id = $('#a-' + currentAsteroid);
    currentAsteroid++; // ensure each Asteroid has its own id
    // current x, y position of this Asteroid
    this.cur_x = 0; // number of pixels from right
    this.cur_y = 0; // number of pixels from top

    /*------------------------Private Member Variables------------------------*/
    // member variables for how to move the Asteroid
    this.x_dest = 0;
    this.y_dest = 0;
    // member variables indicating when the Asteroid has reached the border
    this.hide_axis = 'x';
    this.hide_after = 0;
    this.sign_of_switch = 'neg';
    // spawn an Asteroid at a random location on a random side of the board
    this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    // get the current position of interest (either the x position or the y position):
    const cur_pos = this.hide_axis === "x" ? this.cur_x : this.cur_y;
    // determine if the asteroid has reached its destination:
    return this.sign_of_switch === "pos" ? (cur_pos > this.hide_after) : (cur_pos < this.hide_after);
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
    // ensures all asteroids travel at current level's speed
    this.cur_y += this.y_dest * astProjectileSpeed;
    this.cur_x += this.x_dest * astProjectileSpeed;
    // update asteroid's css position
    this.id.css('top', this.cur_y);
    this.id.css('right', this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    const x = getRandomNumber(0, 1280);
    const y = getRandomNumber(0, 720);
    const floor = 784;
    const ceiling = -64;
    const left = 1344;
    const right = -64;
    const major_axis = Math.floor(getRandomNumber(0, 2));
    const minor_aix = Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if (major_axis == 0 && minor_aix == 0) {
      this.cur_y = floor;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 0 && minor_aix == 1) {
      this.cur_y = ceiling;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = 784;
      this.sign_of_switch = 'pos';
    }
    if (major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 1 && minor_aix == 1) {
      this.cur_y = y;
      this.cur_x = right;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = 1344;
      this.sign_of_switch = 'pos';
    }
    // show this Asteroid's initial position on screen
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    const speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }
}

// Spawns an Asteroid travelling from one side to another
function spawnAsteroid() {
  if (isStopped || isPaused) {
    return;
  }
  console.log("spawning asteroid");
  // create an Asteroid object in the DOM
  const asteroid = new Asteroid();
  // move this Asteroid across the screen
  move(asteroid);
}

let shieldId = 0;
function spawnShield() {
  if (isStopped || isPaused) {
    return;
  }

  console.log("spawning shield");
  const x = getRandomNumber(80, 1200);
  const y = getRandomNumber(80, 640);
  const objectString = `<img id='shield${shieldId}' class='shield' src = 'src/shield.gif'></img>`;
  asteroid_section.append(objectString);
  let curShield = $(`#shield${shieldId}`);
  curShield.offset({ top: y, left: x });
  setTimeout(() => {
    curShield.remove();
  }, shieldLifetime);
  shieldId++;
}

let portalId = 0;
function spawnPortal() {
  if (isStopped || isPaused) {
    return;
  }

  console.log("spawning portal");
  const x = getRandomNumber(80, 1200);
  const y = getRandomNumber(80, 640);
  const objectString = `<img id='portal${portalId}' class='portal' src = 'src/port.gif'></img>`;
  asteroid_section.append(objectString);
  let curPortal = $(`#portal${portalId}`);
  curPortal.css("top", y);
  curPortal.css("right", x);
  setTimeout(() => {
    curPortal.remove();
  }, portalLifetime);
  portalId++;
}

function move(asteroid) {
  // create an interval to move an Asteroid (i.e. repeatedly update an Asteroid's position)
  let asteroidMoveInterval = setInterval(function () {
    // HINT: Consider checking collision and other game states here

    // update Asteroid position on screen
    if (!isPaused) {
      asteroid.updatePosition();
    }

    // determine whether Asteroid has reached its end position
    if (asteroid.hasReachedEnd()) { // i.e. outside the game border
      // remove this Asteroid from DOM (using jQuery .remove() method)
      asteroid.id.remove();
      // clear the interval that moves this Asteroid
      clearInterval(asteroidMoveInterval);
    }

    if (isStopped) {
      clearInterval(asteroidMoveInterval);
    }

  }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}
