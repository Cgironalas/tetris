import React from 'react'
import ReactDOM from 'react-dom'

import  axios from 'axios'

import './index.css'
import Board from './Board'
import Piece from './pieces'
import getTurnPoints from './scoring'
import {
  BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_TIMER, LB_UPDATE_RATE, ROTATE_RIGHT, ROTATE_LEFT,
  MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN, DROP, HOLD, PAUSE, PIECE_O, SHADOW_COLOR,
  DOWN, LEFT, RIGHT,
} from './constants'

class Game extends React.Component {
  // Create the game board as a React Component.
  state = {
    // Side Data
    score: 0,
    nextPiece: ' ',
    holdPiece: ' ',
    leaderboard: [],
    holdBlocked: false,

    // In Board components
    shadow: [],
    movingPiece: {
      color: 0,
      type: ' ',
      coords: [],
      rotation: 0,
      rotations: [],
    },
    board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0)),

    // Timer Interval
    timer: DEFAULT_TIMER,  // how ofter the piece will automatically go down

    // General Game State
    paused: true,
    submitted: false,
    finishedGame: false,
  }

  // Print the game board on console.
  consoleBoard = (board = this.state.board) => {
    let output = ""
    for (let row of board) {
      const rowString = row.join(' - ')
      output = rowString + '\n' + output
    }
    console.log(output)
  }

/** For automatic component updates **/
  // updateLeaderboard, componentDidMount and componentWillUnmount

  // Fetch the leaderboard from the API
  updateLeaderboard = () => {
    axios.get('http://0.0.0.0:5000/api/leaderboard')
      .then(res => {
        this.setState({ leaderboard: res.data })
      })
  }

  componentDidMount() {
    this.downInterval = setInterval(() => {
      if (!this.state.finishedGame && !this.state.paused) {
        this.movePiece(DOWN)
      }
    }, this.state.timer)

    this.updateLeaderboard()
    this.updateLeaderboardInterval = setInterval(() => {
      this.updateLeaderboard()
    }, LB_UPDATE_RATE)
  }

  componentWillUnmount() {
    clearInterval(this.downInterval)
    clearInterval(this.updateLeaderboardInterval)
  }
/** END **/

/** Piece generation **/
  getNewPiece = () => {
    const newPiece = Piece.getPiece(this.state.nextPiece)

    const finishCheck = newPiece.coords.filter(([x, y]) => (
      this.state.board[y-1][x] !== 0
    ))
    if (finishCheck.length) {
      alert('End match')
      this.setState({ finishedGame: true })
      return
    }
    else {
      this.setState({
        shadow: [],
        holdBlocked: false,
        movingPiece: { ...newPiece },
        nextPiece: Piece.generateNextPieceType(),
      })
    }
  }
/** END **/

/* Board repainting */
  // erasePiece, paintPiece, checkFinishedRows

  erasePiece = (coords, board = this.state.board) => {
    let newBoard = board.slice()
    for (let [x, y] of coords) {
      newBoard[y][x] = 0
    }
    return newBoard
  }
  paintPiece = (coords, color, board = this.state.board) => {
    let newBoard = board.slice()
    for (const [x, y] of coords) {
      newBoard[y][x] = color
    }
    return newBoard
  }
  updatePiece = (oldCoords, newCoords, color, board = this.state.board) => {
    const erasedBoard = this.erasePiece(oldCoords, board)
    const paintedBoard = this.paintPiece(newCoords, color, erasedBoard)
    return paintedBoard
  }

  /*
    Checks every row to see if it was completely filled. Each filled row will
    be ignored for the next version of the board, the score will be added
    accordingly and the board will be topped again.
    Forces re-render.
  */
  checkFinishedRows = () => {
    //console.log('\nChecking finished rows...');
    const newBoard = this.state.board.filter((row) => (
      row.indexOf(0) > -1
    ));

    const completedRows = BOARD_HEIGHT - newBoard.length
    //console.log('lines completed: ' + completedRows);

    if (completedRows > 0) {
      // Finish filling the board with 0s
      const filledBoard = this.state.board.reduce((board, row) => {
        if (row.indexOf(0) === -1) {
          return [...board, (Array(10).fill(0))]
        }
        return board
      }, newBoard)


      // Get the new score.
      const newScore = this.state.score + getTurnPoints(completedRows);

      const newTimer = Math.max(this.state.timer - (completedRows * 20), 100);

      this.setState({
        score: newScore,
        board: filledBoard,
        timer: newTimer,
      })
      clearInterval(this.downInterval);
      this.downInterval = setInterval(() => {
        if (!this.state.finishedGame && !this.state.paused) {
          this.movePiece('down');
        }
      }, this.state.timer)
    }
  }

  holdPiece = () => {
    if (this.state.holdBlocked === false) {
      const nextPieceType = this.state.nextPiece
      const currentHold = this.state.holdPiece
      const oldPiece = this.state.movingPiece
      const oldShadow = this.state.shadow

      let newPiece, nextPiece, newShadow

      if (currentHold === ' ') {
        //console.log('hold and create new')
        nextPiece = Piece.generateNextPieceType()
        newPiece = Piece.getPiece(nextPieceType)
        newShadow = this.getShadowCoords(newPiece, oldPiece)
      }
      else {
        //console.log('hold and switch')
        nextPiece = nextPieceType
        newPiece = Piece.getPiece(currentHold)
        newShadow = this.getShadowCoords(newPiece, oldPiece)
      }

      const shadowBoard = this.updatePiece(oldShadow, newShadow, SHADOW_COLOR)
      console.log('here')
      const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, shadowBoard)
      //const erasedBoard = this.erasePiece(oldPiece.coords)
      //const board = this.paintPiece(newPiece, erasedBoard)

      this.setState({
        holdBlocked: true,
        nextPiece: nextPiece,
        holdPiece: oldPiece.type,
        shadow: [ ...newShadow ],
        board: [ ...updatedBoard ],
        movingPiece: { ...newPiece },
      })
    }
    else {
      console.log('you are already holding a piece')
    }
  }

  getShadowCoords = (piece, oldPiece={coords:[]}) => {
    let counter = BOARD_HEIGHT
    const board = this.state.board
    const oldShadow = this.state.shadow

    const oldPieceCoords = Piece.getCoordsObject(oldPiece)
    const pieceCoordsObj = Piece.getCoordsObject(piece)
    const shadowCoordsObj = Piece.getCoordsObject({coords: oldShadow})

    const movableCoords = piece.coords.filter( ([x, y]) => (y > 0) )
    if (movableCoords.length !== 4) {
      return piece.coords
    }

    for (let [x, y] of movableCoords) {
      let counterAux = 0
      for(let tempY = y - 1; tempY >= 0; tempY--) {
        counterAux++
        const str = String(x) + ',' + String(tempY)
        if (board[tempY][x] > 0 && !pieceCoordsObj.has(str) && !shadowCoordsObj.has(str) && !oldPieceCoords.has(str)) {
          counter = Math.min(counterAux-1, counter)
          break
        }
        if (tempY === 0) {
          counter = Math.min(counterAux, counter)
        }
      }
    }
    if (counter === BOARD_HEIGHT) {
      return
    }

    // Get the new coords based on the counter from the last loop
    const newCoords = piece.coords.map(([x, y]) => ( [x, y-counter] ))
    return newCoords
  }
/* End board repainting */

/* Piece movement */
  // dropPiece, movePiece, removePause

  dropPiece = () => {
  /*
    // It should idealy be changed, if not the drop command was wasted.
    let counter = BOARD_HEIGHT

    // Object used to make sure the piece does not consider its own blocks
    // as possible stop locations.
    const coordsObj = Piece.getCoordsObject(this.state.movingPiece)

    // Filter coordinates to make sure they are not already at the base of the
    // board
    const movableCoords = this.state.movingPiece.coords.filter((item) => (
      item[1] > 0
    ))
    if (movableCoords.length !== 4) {
      return
    }

    // For all the blocks of the piece check how much each one can drop and keep
    // the lowest value in the counter variable
    for (let [x, y] of movableCoords) {
      let counterAux = 0
      for(let tempY = y - 1; tempY >= 0; tempY--) {
        counterAux++
        if (this.state.board[tempY][x] > 0 && !coordsObj.has(String([x, tempY]))) {
          counter = Math.min(counterAux - 1, counter)
        }
        if (tempY === 0) {
          counter = Math.min(counterAux, counter)
        }
      }
    }
    if (counter === BOARD_HEIGHT) {
      return
    }

    // Get the new coords based on the counter from the last loop
    const newCoords = this.state.movingPiece.coords.map(([x, y]) => (
      [x, y-counter]
    ))
  */
    const oldPiece = this.state.movingPiece
    const newPiece = { ...oldPiece, coords: this.state.shadow }//newCoords }

    const erasedShadowBoard = this.erasePiece(this.state.shadow)
    const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, erasedShadowBoard)
    //this.erasePiece(this.state.movingPiece)
    //this.paintPiece(newPiece)
    this.setState({
      movingPiece: { ...newPiece },
      board: updatedBoard.slice(),
      shadow: [],
    })
  }

  movePiece = (direction) => {
    const shadowCoordsObj = Piece.getCoordsObject({coords: this.state.shadow})
    const pieceCoordsObj = Piece.getCoordsObject(this.state.movingPiece)
    const oldPiece = this.state.movingPiece
    const {board} = this.state

    let newCoords

    switch(direction) {
      case LEFT:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          x > 0 && board[y][x-1] !== undefined && (
            board[y][x-1] === 0 || (
              board[y][x-1] !== 0 && (
                pieceCoordsObj.has(String(x-1) + ',' + String(y)) ||
                shadowCoordsObj.has(String(x-1) + ',' + String(y))
              )
            )
          )
        )).map(([x, y]) => ( [x-1, y] ))
        break
      case RIGHT:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          x < 9 && board[y][x+1] !== undefined && (
            board[y][x+1] === 0 || (
              board[y][x+1] !== 0 && (
                pieceCoordsObj.has(String(x+1) + ',' + String(y)) ||
                shadowCoordsObj.has(String(x+1) + ',' + String(y))
              )
            )
          )
        )).map(([x, y]) => ( [x+1, y] ))
        break
      case DOWN:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          y > 0 && board[y-1][x] !== undefined && (
            board[y-1][x] === 0 || (
              board[y-1][x] !== 0 && (
                pieceCoordsObj.has(String(x) + ',' + String(y-1)) ||
                shadowCoordsObj.has(String(x) + ',' + String(y-1))
              )
            )
          )
        )).map(([x, y]) => ( [x, y-1] ))

        if (newCoords.length < 4) {

          this.getNewPiece()
          this.checkFinishedRows()
          return
        }
        break
      default:
        return
    }
    if (newCoords.length < 4) {
      return
    }

    const newPiece = { ...oldPiece, coords: newCoords }

    let shadowCoords
    shadowCoords = this.getShadowCoords(newPiece, oldPiece)

    const updatedShadowBoard = this.updatePiece(this.state.shadow, shadowCoords, SHADOW_COLOR)
    const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, updatedShadowBoard)
    this.setState({ movingPiece: { ...newPiece}, board: updatedBoard.slice(), shadow: shadowCoords })
  }

  removePause = () => {
    this.setState({ paused: false })
  }
/* End piece movement */

/* Pice rotation */
  checkKicks = (coords) => {
    let good
    let xSum = 0
    let ySum = 0
    do {
      good = true
      for (let [x, y] of coords) {
        x = x + xSum
        y = y + ySum
        xSum = 0
        ySum = 0
        if (x < 0) {
          good = false
          ySum = Math.max(ySum, 0)
          xSum = Math.abs(xSum, x)
          break
        }
        if (x > 9) {
          good = false
          ySum = 0
          xSum = 0 - x + 9
        }
        if (y < 0) {
          good = false
          ySum = Math.max(ySum, Math.abs(y))
        }
      }
    } while (!good);
    let checkedCoords = coords
    return checkedCoords
  }

  getNextRotation = (piece, rotation) => {
    const currentRotationIndex = piece.rotation
    const rotationMath = piece.rotations[(currentRotationIndex + rotation) % 4]

    const rotatedCoords = piece.coords.map(([x, y], index) => {
      const xSum = rotationMath[index][0]
      const ySum = rotationMath[index][1]
      return [x + xSum, y + ySum]
    })

    const pieceCoordObj = Piece.getCoordsObject(piece)
    const shadowCoordObj = Piece.getCoordsObject({coords: this.state.shadow})

    const outsideCoords = rotatedCoords.filter(([x, y]) => (
      x < 0 || x > 9 || y < 0 || (
        this.state.board[y][x] !== 0 &&
        !pieceCoordObj.has(String(x)+','+String(y)) &&
        !shadowCoordObj.has(String(x)+','+String(y))
      )
    ))
    if (outsideCoords.length) {
      return null
    }
    else {
      return this.checkKicks(rotatedCoords)
    }
  }

  rotatePiece = (rotation) => {
    const oldPiece = this.state.movingPiece
    const oldShadowCoords = this.state.shadow

    if (oldPiece.type === PIECE_O) {
      return
    }
    else {
      const newCoords = this.getNextRotation(oldPiece, rotation)
      if (newCoords === null) {
        return
      }
      const newPiece = {
        ...oldPiece,
        rotation: oldPiece.rotation + rotation,
        coords: newCoords
      }

      const newShadowCoords = this.getShadowCoords(newPiece, oldPiece)

      const erasedShadowBoard = this.updatePiece(oldShadowCoords, newShadowCoords, SHADOW_COLOR)
      const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, erasedShadowBoard)
      this.setState({
        shadow: newShadowCoords,
        board: [ ...updatedBoard],
        movingPiece: { ...newPiece },
      })
    }
  }
/** End piece rotation **/

/** Key press handling **/
  handleKeyPress = (event) => {
    if (!this.state.finishedGame) {
    /* Rotations */
      if (ROTATE_RIGHT.has(event.keyCode)) {
        this.rotatePiece(1)
        return
      }
      if (ROTATE_LEFT.has(event.keyCode)) {
        //console.log('ROTATE LEFT')
        this.rotatePiece(-1)
        return
      }
    /* End Rotations */

    /* Movement */
      if (MOVE_LEFT.has(event.keyCode)) {
        this.removePause()
        this.movePiece(LEFT)
        return
      }
      if (MOVE_RIGHT.has(event.keyCode)) {
        this.removePause()
        this.movePiece(RIGHT)
        return
      }
      if (MOVE_DOWN.has(event.keyCode)) {
        this.removePause()
        this.movePiece(DOWN)
        return
      }
      if (DROP.has(event.keyCode)) {
        this.removePause()
        this.dropPiece()
        return
      }
    /* End Movement */

    /* Hold piece */
      if (HOLD.has(event.keyCode)) {
        this.removePause()
        this.holdPiece()
        return
      }
    /* End Hold */

    /* Pause */
      if (PAUSE.has(event.keyCode)) {
        this.setState(state => ({ paused: !state.paused }))
        return
      }
    /* End Pause */
    }
  }
/** END **/

/** Button handlers **/
  gameStart = (event) => {
    this.updateLeaderboard()

    const piece = Piece.getPiece()
    const shadow = this.getShadowCoords(piece)
    const board = Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0))

    const shadowBoard = this.paintPiece(shadow, SHADOW_COLOR, board)
    const updatedBoard = this.paintPiece(piece.coords, piece.color, shadowBoard)


    this.setState({
      paused: false,
      shadow: [ ...shadow ],
      board: [ ...updatedBoard],
      movingPiece: { ...piece },
      nextPiece: Piece.generateNextPieceType(),
    })
  }

  submitScore = (event) => {
    this.setState({ submitted: true })

    const data = new FormData()
    data.set('name', this.state.name)
    data.set('score', this.state.score)
    const link = 'http://0.0.0.0:5000/api/register'

    axios({
      url: link,
      data: data,
      method: 'post',
      config: { headers: { 'Content-Type': 'multipart/form-data' }},
    })
      .then(res => {
        this.updateLeaderboard()

        // Get the data and format it as a list of objects with name and score.
        const data = res.data
        alert(data.message)

        const piece = Piece.getPiece()
        this.setState({
          // Side Data
          score: 0,
          nextPiece: ' ',
          holdPiece: ' ',
          holdBlocked: false,

          // In Board components
          shadow: [],
          movingPiece: { ...piece },
          board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0)),

          // Timer Interval
          timer: DEFAULT_TIMER,  // how ofter the piece will automatically go down

          // General Game State
          paused: true,
          submitted: false,
          finishedGame: false,
        })
      })
  }

  captureInput = (event) => {
    this.setState({ name: event.target.value })
  }
/** END **/

  render() {
    return (
      <div className="game" onKeyDown={this.handleKeyPress}>
        <div className='pause'>
          {
            this.state.paused ?
              this.state.nextPiece === ' ' ?
                <h1>NEW GAME</h1>
              : <h1>GAME PAUSED</h1>
            : null
          }
          <br/>
        </div>

        <div className="game-board">
          <Board rows={this.state.board} />
        </div>
        <div className="game-info">
          <div className='game-info'><b>Score</b></div>
          <div className='game-detail'>{this.state.score}</div>

          <div className='game-info'><b>Next Piece</b></div>
          <div className='game-detail'>{this.state.nextPiece}</div>

          <div className='game-info'><b>Hold Piece</b></div>
          <div className='game-detail'>{
            this.state.holdPiece === ' ' ?
              'Not holding a piece' : this.state.holdPiece
          }</div>

          <div className='game-info'><b>Leaderboard</b></div>
          <table className='game-detail'>
            <thead>
              <tr>
                <th>User name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.leaderboard.map((ranker, index) => {
                  return <tr key={index}><td>{ranker.name}</td><td>{ranker.score}</td></tr>
                })
              }
            </tbody>
          </table>
          {
            this.state.nextPiece === ' ' ? <button className='game-info' type='button' onClick={this.gameStart}>Start Game</button> : null
          }
          {
            this.state.finishedGame ?
              <div className='game-info'>
                <input
                  className='game-detail'
                  type='text'
                  placeholder='Type your name here'
                  onChange={this.captureInput} />
                <button className='game-detail' type='button' disabled={this.state.submitted} onClick={this.submitScore}>
                  Submit Score
                </button>
              </div>
            : null
          }
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)
