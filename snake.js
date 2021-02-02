const base = require('./base')
Object.getOwnPropertyNames(base).map(p => global[p] = base[p])

// Constants

const directions = {
NORTH: { x: 0, y:-1 },
SOUTH: { x: 0, y: 1 },
EAST : { x: 1, y: 0 },
WEST : { x:-1, y: 0 },
}

const gametypes = {
  FORBIDDEN_FRUIT: 'forbidden_fruit',
  FRUIT_OF_THE_POISONOUS_TREE: 'fruit_of_the_poisonous_tree',
  EASY_AS_APPLE_PIE: 'easy_as_apple_pie',
}


// Point operations
const pointEq = p1 => p2 => p1.x == p2.x && p1.y == p2.y

// Booleans
                                        // This is a curried function
const willEatEdible = state => Edible => pointEq(nextHead(state))(Edible)

const willCrash = state => { return ( state.snake.find(pointEq(nextHead(state))) || state.snake[0].x < 0 || state.snake[0].y < 0 || state.snake[0].x >= state.cols || state.snake[0].y >= state.rows ) }



// const willCrash = state => state.snake.find(pointEq(nextHead(state)))
const validMove = move => state =>
  state.moves[0].x + move.x != 0 || state.moves[0].y + move.y != 0

// Next values based on state
const nextMoves = state => state.moves.length > 1 ? dropFirst(state.moves) : state.moves

const nextEdibles = state => {
  let nextEdibles = [];
  state.edibles.map((e) => {
  if (willEatEdible(state)(e)) {
    nextEdibles.push(Object.assign(e, rndPos(state), {hp: e.hp-1}))  
    //
    state.score += 15;
  } else {
    nextEdibles.push(e);
  }
})
return nextEdibles;
}

// This is the code for snake that can go beyond borders

const nextHead  = state => state.snake.length == 0
  ? { x: 2, y: 2 }
  : {
    x: state.snake[0].x + state.moves[0].x,
    y: state.snake[0].y + state.moves[0].y
  }

// //This Is the code for snake the wraps around borders
// const nextHead  = state => state.snake.length == 0
//   ? { x: 2, y: 2 }
//   : {
//     x: mod(state.cols)(state.snake[0].x + state.moves[0].x),
//     y: mod(state.rows)(state.snake[0].y + state.moves[0].y)
//   }

const nextSnake  = state => {
  if (willCrash(state)) {return []} 
  else {
    for (let i=0; i<state.edibles.length; i++) {
      if (willEatEdible(state)(state.edibles[i])) {
        let ns;
        ns = (!state.edibles[i].bClean) ? [nextHead(state)].concat(state.snake) : [nextHead(state)].concat(dropLast(state.snake))
        return ns;
      }
    }
    return [nextHead(state)].concat(dropLast(state.snake))
  }
}  


// Randomness
const rndPos = table => ({
  x: rnd(0)(table.cols - 1),
  y: rnd(0)(table.rows - 1),
})

// Initial state
const initialState = () => ({
  gametype: gametypes.FORBIDDEN_FRUIT,
  rows:  15,
  cols:  15,
  moves: [directions.EAST],
  snake: [{x:5,y:3},{x:4,y:3},{x:3,y:3},{x:2,y:3},{x:1,y:3}],
  edibles: [{type:'red', x: 14, y: 2 , hp: 5, bClean:true}],
  score: 280,
})

const next = spec({
  gametype: prop('gametype'),
  rows:  prop('rows'),
  cols:  prop('cols'),
  moves: nextMoves,
  snake: nextSnake,
  edibles: nextEdibles,
  score: prop('score'),
})

const level2 = () => ({
  gametype: gametypes.FRUIT_OF_THE_POISONOUS_TREE,
  rows:  15,
  cols:  15,
  moves: [directions.EAST],
  snake: [{x:5,y:3},{x:4,y:3},{x:3,y:3}],
  edibles: [{type:'orange', x: 14, y: 2 , hp: 5, bClean:false},{type:'blue', x: 14, y: 3 , hp: 5, bClean:true},{type:'orange', x: 9, y: 14 , hp: 5, bClean:false},],
  // What score to start at?
  score: 280,
})

// issue : can enqeue *non-imediate* invalid moves (turning directly arround and eating self)
// (valid move only test against current direction, but not all consecutive moves in the queue)
const enqueue = (state, move) => validMove(move)(state)
  ? merge(state)({ moves: state.moves.concat([move]) })
  : state;


  const checkWinCondition = state => {
    let condition;
    switch (state.gametype) {
                                                                                        //Set true for hp to matter
      case gametypes.FORBIDDEN_FRUIT : (state.edibles[0].hp > 0) ? condition = false : condition = false
      break
    }
    return condition;
  }

module.exports = {directions, initialState, enqueue, next, level2, checkWinCondition}






