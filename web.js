//const { initialState, level2 } = require("./snake");

//const { level2 } = require("./snake");

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let updateRate = 100

let highscore = 0;

let gameheaderScore = document.getElementById('gameheader_score')
let gamemenu = document.getElementById('gamemenu')
let gamemenuScore = document.getElementById('gamemenu_scoreboard_score')
let gamemenuHighscore = document.getElementById('gamemenu_scoreboard_highscore')


let settingsmenu = document.getElementById('settingsmenu')

let playbutton1 = document.getElementById('gamemenu_playbutton1');
playbutton1.addEventListener("click", playlevel1)

let playbutton2 = document.getElementById('gamemenu_playbutton2');
playbutton2.addEventListener("click", playlevel2)

let playbutton3 = document.getElementById('gamemenu_playbutton3');
playbutton3.addEventListener("click", playlevel3)

let settingsbutton = document.getElementById('gamemenu_settingsbutton')
settingsbutton.addEventListener("click", () => {
  settingsmenu.style.display = 'flex'
})

let settingsexitbutton = document.getElementById('settingsmenu_exitbutton')
settingsexitbutton.addEventListener("click", () => {
  settingsmenu.style.display = 'none'
})

//globalAnimationFrame
let frameCount = 0;

// // Should Load These from js src, not html element
const snakeRight = document.getElementById("snakeright");
const snakeUp = document.getElementById("snakeup");
const snakeLeft = document.getElementById("snakeleft");
const snakeDown = document.getElementById("snakedown");
const snakeEatRight = document.getElementById("snakeeatright");
const snakeEatUp = document.getElementById("snakeeatup");
const snakeEatLeft = document.getElementById("snakeeatleft");
const snakeEatDown = document.getElementById("snakeeatdown");

// load audio files
// audio not working imediately
let dead = new Audio();
let eat = new Audio();
let up = new Audio();
let right = new Audio();
let left = new Audio();
let down = new Audio();

dead.src = "audio/dead.mp3";
eat.src = "audio/eat.mp3";
up.src = "audio/up.mp3";
right.src = "audio/right.mp3";
left.src = "audio/left.mp3";
down.src = "audio/down.mp3";

// Mutable state
let state = initialState()

// Grid Unit Size
const gridUnitSize = {
  x: canvas.width / state.cols,
  y: canvas.height / state.rows,
}

// Position helpers
const x = c => Math.round(c * gridUnitSize.x)
const y = r => Math.round(r * gridUnitSize.y)

// Alternate position helpers for circular items
const Ox = c => Math.round(c * (canvas.width / state.cols)) + (canvas.width / state.cols)/2
const Oy = r => Math.round(r * (canvas.height / state.rows)) + (canvas.height / state.rows)/2

// Game loop draw
const draw = (delta, uAnimationFrame, bUpdated) => {
  let AnimationPulse = Math.abs(uAnimationFrame-15)

  // clear
  ctx.fillStyle = '#232323'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawBackground('darkgreen', 'green');

    // draw apples
    

    for (let i = 0; i<state.edibles.length; i++) {
      ctx.fillStyle = state.edibles[i].type
      ctx.fillRect(
      x(state.edibles[i].x)-(AnimationPulse/4), 
      y(state.edibles[i].y)-(AnimationPulse/4), 
      x(1)+(AnimationPulse/4)*2, 
      y(1)+(AnimationPulse/4)*2,
      )
    }



  // DRAW SNAKE



  // determine head direction
  state.snake.map((p, i) => {
      // Snake color
  ctx.fillStyle = 'rgb(0,' + Math.max(1, 200- i*5) + ',' +Math.min(254, 150 + i*10) +')'
    let nodeDirection = {x:0, y:0};
    if (i > 0 ) {
      nodeDirection.x = state.snake[i-1].x - p.x
      nodeDirection.y =state.snake[i-1].y - p.y
      if (Math.abs(nodeDirection.x) > 1 ) nodeDirection.x = 0;
      if (Math.abs(nodeDirection.y) > 1 ) nodeDirection.y = 0;
    } else {
        nodeDirection = state.moves[0];
      }

      // choose head image based on direction
      (nodeDirection.x == 1) ? imageDirection = snakeRight : imageDirection = snakeLeft;
      (nodeDirection.y == 1) ? imageDirection = snakeDown : (nodeDirection.y == -1) ? imageDirection = snakeUp : imageDirection = imageDirection;
        
      // draw head
      if (i==0){
          for (let i=0; i<state.edibles.length; i++) {
            if (willEatEdible(state)(state.edibles[i])) {
              (nodeDirection.x == 1) ? imageDirection = snakeEatRight : imageDirection = snakeEatLeft;
              (nodeDirection.y == 1) ? imageDirection = snakeEatDown : (nodeDirection.y == -1) ? imageDirection = snakeEatUp : imageDirection = imageDirection;
              ctx.drawImage(imageDirection, 
                (x(p.x)-gridUnitSize.x/2) + (Math.ceil( gridUnitSize.x * (delta/updateRate) *nodeDirection.x )), 
                (y(p.y)-gridUnitSize.y/2)+ (Math.ceil( gridUnitSize.y * (delta/updateRate) *nodeDirection.y )) - (nodeDirection.y*i), 
                gridUnitSize.x*2, gridUnitSize.y*2);
                break;
            } else {
              ctx.drawImage(imageDirection, 
                (x(p.x)-gridUnitSize.x/2) + (Math.ceil( gridUnitSize.x * (delta/updateRate) *nodeDirection.x )), 
                (y(p.y)-gridUnitSize.y/2)+ (Math.ceil( gridUnitSize.y * (delta/updateRate) *nodeDirection.y )) - (nodeDirection.y*i), 
                gridUnitSize.x*2, gridUnitSize.y*2);
            }
          }
          
          //draw tail node
        } else if (i == state.snake.length -1) {
          ctx.beginPath();
          ctx.arc(
           Ox(p.x)+ (Math.ceil( gridUnitSize.x * (delta/updateRate) *nodeDirection.x )),
           Oy(p.y)+ (Math.ceil( gridUnitSize.y * (delta/updateRate) *nodeDirection.y )), 
           gridUnitSize.x/2, 
           0,
           Math.PI*2, 
           true
          );
          ctx.fill();

// if snake[i].x||.y != snake[i+1]
// &&
// if snake[i].x||.y != snake[i-1]
// then
//draw begin is static
//+-height +- width increases

          //draw corner nodes (might need nested conditonals?)
        } else if ((state.snake[i].x != state.snake[i-1].x) && 
                   (state.snake[i].y != state.snake[i+1].y) || 
                   (state.snake[i].x != state.snake[i+1].x) &&
                   (state.snake[i].y != state.snake[i-1].y)) {
                    for (let n=0; n<gridUnitSize.x*(delta/(updateRate)); n++) {
                    ctx.beginPath();
                    ctx.arc(
                     Ox(p.x)+ (Math.ceil( gridUnitSize.x  *nodeDirection.x )) -nodeDirection.x*gridUnitSize.x + (nodeDirection.x*n),
                     Oy(p.y)+ (Math.ceil( gridUnitSize.y  *nodeDirection.y )) -nodeDirection.y*gridUnitSize.y + (nodeDirection.y*n), 
                     Math.max(1, (gridUnitSize.x/2) - (i/2)), 
                     0,
                     Math.PI*2, 
                     true
                    );
                    ctx.fill();

                    }
          //draw snakenodes
        } 
        else {

          // OLD CIRCLE BASED DRAWING METHOD
          for (let n=0; n<gridUnitSize.x + i; n++) {
            ctx.beginPath();
            ctx.arc(
             Ox(p.x)+ (Math.ceil( gridUnitSize.x * (delta/updateRate) *nodeDirection.x )) - (nodeDirection.x*n),
             Oy(p.y)+ (Math.ceil( gridUnitSize.y * (delta/updateRate) *nodeDirection.y )) - (nodeDirection.y*n), 
             Math.max(1, (gridUnitSize.x/2) - (i/8)), 
             0, 
             Math.PI*2, 
             true
            );
            ctx.fill();
          }

          //// DRAWING 2.0
          // for (let n=gridUnitSize.x*(delta/(updateRate))/2; n>0 ; n--) {
          //   console.log(n)
          //   ctx.beginPath();
          //   ctx.arc(
          //    Ox(p.x)+ (Math.ceil( gridUnitSize.x * (delta/updateRate) *nodeDirection.x )) - (nodeDirection.x*n) ,
          //    Oy(p.y)+ (Math.ceil( gridUnitSize.y * (delta/updateRate) *nodeDirection.y )) - (nodeDirection.y*n) , 
          //    Math.max(1, (gridUnitSize.x/2) - (i/2)), 
          //    Math.PI * (0 - (nodeDirection.x/2) + (Math.min(0,nodeDirection.y))) ,
          //    Math.PI * (0 + (nodeDirection.x/2) + (Math.max(0,nodeDirection.y))) , 
          //    true
          //   );
          //   ctx.fill();
          // }


        }
  })
  

  //eat sound

  for (let i=0; i<state.edibles.length; i++) {
    if (willEatEdible(state)(state.edibles[i])) {
      eat.play();
    }
  }


  // add crash
  if (state.snake.length == 0) {
    dead.play()
    ctx.fillStyle = 'rgb(255,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

  }
}

// Game loop update
const step = t1 => t2 => {
  let deltaTime = t2 - t1;
  frameCount = frameCount + 1;
  if (frameCount > 29) {frameCount = 0}

  (deltaTime > updateRate) ?
  draw(deltaTime, frameCount, true) : draw(deltaTime, frameCount, false);

  if (deltaTime > updateRate) {
    gameheaderScore.innerText = "Score: "+state.score;
    gamemenuScore.innerText = "Score: "+state.score;
    gamemenuHighscore.innerText = "High Score: "+highscore;

    if (state.score>highscore) {highscore = state.score};

    if (state.snake.length == 0) {
      state = initialState()
      gamemenu.style.visibility = 'visible';
    } else {
      if (checkWinCondition(state)) {
        state = level2(state)
        gamemenu.style.visibility = 'visible';
      } else {
          state = next(state)
          window.requestAnimationFrame(step(t2))
      }
    
      
    }

  } else {
    window.requestAnimationFrame(step(t1))
  }

}

// Key events
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'w': case 'k': case 'ArrowUp':    state = enqueue(state, directions.NORTH); break
    case 'a': case 'h': case 'ArrowLeft':  state = enqueue(state, directions.WEST);  break
    case 's': case 'j': case 'ArrowDown':  state = enqueue(state, directions.SOUTH); break
    case 'd': case 'l': case 'ArrowRight': state = enqueue(state, directions.EAST);  break

  }
})

function playlevel1() {
  state = initialState(state)
  gamemenu.style.visibility = "hidden"
  let sel = document.getElementById('selectspeed')
  updateRate = sel.options[sel.selectedIndex].value;
  window.requestAnimationFrame(step(0));
}

function playlevel2() {
  state = level2(state)
  gamemenu.style.visibility = "hidden"
  let sel = document.getElementById('selectspeed')
  updateRate = sel.options[sel.selectedIndex].value;
  window.requestAnimationFrame(step(0));
}

function playlevel3() {
  gamemenu.style.visibility = "hidden"
  let sel = document.getElementById('selectspeed')
  updateRate = sel.options[sel.selectedIndex].value;
  window.requestAnimationFrame(step(0));
}

// Main
draw(0, frameCount, false);


function drawBackground(color1, color2) {
  for (let i = 0; i<state.cols;i+=2) {
    let bit=0
    for (let j = 0; j<state.rows;j++) {
      ctx.fillStyle = color1;
      ctx.fillRect(x(i + (bit^1) ),y(j) , gridUnitSize.x, gridUnitSize.y)
      
      bit = bit ^ 1;

      ctx.fillStyle = color2;
      ctx.fillRect(x(i+(bit^1)),y(j) , gridUnitSize.x, gridUnitSize.y)

    }
  }
}

