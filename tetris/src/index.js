import React from 'react'
import ReactDOM from 'react-dom'

import  axios from 'axios'

import './index.css'
import Board from './Board'
import Piece from './pieces'
import getTurnPoints from './scoring'
import {
  BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_TIMER, ROTATE_RIGHT, ROTATE_LEFT,
  MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN, DROP, HOLD, PAUSE, PIECE_O,
} from './constants'

class Game extends React.Component {
  // Create the game board as a React Component.
  state = {
    // Side Data
    score: 0,
    nextPiece: ' ',
    holdPiece: ' ',
    holdBlocked: false,
    leaderboard: [],

    // In Board components
    board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0)),
    movingPiece: {
      color: 0,
      type: ' ',
      coords: [],
      rotation: 0,
      rotations: [],
    },

    // Timer Interval
    counter: 29,   // will reset and fetch leaderboard every 30s
    timer: DEFAULT_TIMER,  // how ofter the piece will automatically go down

    // General Game State
    paused: true,
    submitted: false,
    finishedGame: false,
  }

  // Print the game board on console.
  consoleBoard = (board = this.state.board) => {
    let output = "";
    for (let row of board) {
      const rowString = row.join(' - ');
      output = rowString + '\n' + output;
    }
    console.log(output);
  }

/* For automatic component updates **/
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
        this.movePiece('down')
      }
    }, this.state.timer)

    this.updateLeaderboard()
    this.updateLeaderboardInterval = setInterval(() => {
      this.updateLeaderboard()
    }, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.downInterval)
    clearInterval(this.updateLeaderboardInterval)
  }
/* End for automatic component updates*/

/* Piece generation and data functions*/
  // Will create a new piece based on the type in nextPiece and randomly
  // generate a new nextPiece type that won't be a repeat of the last one.
  getNewPiece = (type = '') => {
    const newPiece = Piece.getPiece(this.state.nextPiece);

    const finishCheck = newPiece.coords.filter(([x, y]) => (
      this.state.board[y-1][x] !== 0
    ))
    if (finishCheck.length) {
      this.setState({ finishedGame: true })
      alert('End match')
      return
    }

    this.setState({
      nextPiece: Piece.generateNextPieceType(),
      movingPiece: { ...newPiece },
      holdBlocked: false,
    })
  }
/* End piece generation */

/* Board repainting */
  // erasePiece, paintPiece, checkFinishedRows
  erasePiece = (piece, board = this.state.board) => {
    let newBoard = board.slice()
    for (let [x, y] of piece.coords) {
      newBoard[y][x] = 0
    }
    return newBoard;
  }
  paintPiece = (piece, board = this.state.board) => {
    const {color, coords} = piece
    let newBoard = board.slice()
    for (const [x, y] of coords) {
      newBoard[y][x] = color
    }
    return newBoard
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
      const currentHold = this.state.holdPiece
      const oldPiece = this.state.movingPiece
      const type = this.state.movingPiece.type
      const erasedBoard = this.erasePiece(oldPiece)
      let piece, nextPiece;

      if (currentHold === ' ') {
        //console.log('hold and create new')
        piece = Piece.getPiece(this.state.nextPiece)
        nextPiece = Piece.generateNextPieceType()
      }
      else {
        //console.log('hold and switch')
        piece = Piece.getPiece(currentHold)
        nextPiece = this.state.nextPiece
      }

      const board = this.paintPiece(piece, erasedBoard)

      this.setState({
        nextPiece: nextPiece,
        holdPiece: type,
        holdBlocked: true,
        board: board.slice(),
        movingPiece: { ...piece },
      })
    }
    else {
      console.log('you are already holding a piece')
    }
  }
/* End board repainting */

/* Piece movement */
  // dropPiece, movePiece, removePause

  dropPiece = () => {
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
    const newPiece = { ...this.state.movingPiece, coords: newCoords }

    this.erasePiece(this.state.movingPiece)
    this.paintPiece(newPiece)
    this.setState({ movingPiece: { ...newPiece } })
  }

  movePiece = (direction) => {
    let newCoords
    const {coords} = this.state.movingPiece
    const {board} = this.state

    const coordsObj = Piece.getCoordsObject(this.state.movingPiece)

    switch(direction) {
      case 'left':
        newCoords = coords.filter(([x, y]) => (
          x > 0 && board[y][x-1] !== undefined && (board[y][x-1] === 0 || (board[y][x-1] !== 0 && coordsObj.has(String(x-1) + ',' + String(y))))
        )).map(([x, y]) => (
          [x-1, y]
        ))
        break
      case 'right':
        newCoords = coords.filter(([x, y]) => (
          x < 9 && board[y][x+1] !== undefined && (board[y][x+1] === 0 || (board[y][x+1] !== 0 && coordsObj.has(String(x+1) + ',' + String(y))))
        )).map(([x, y]) => (
          [x+1, y]
        ))
        break
      case 'down':
        newCoords = coords.filter(([x, y]) => (
          y > 0 && board[y-1][x] !== undefined && (board[y-1][x] === 0 || (board[y-1][x] !== 0 && coordsObj.has(String(x) + ',' + String(y-1))))
        )).map(([x, y]) => (
          [x, y-1]
        ))

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

    const newPiece = { ...this.state.movingPiece, coords: newCoords }
    const newBoard = this.erasePiece(this.state.movingPiece)
    const paintedBoard = this.paintPiece(newPiece, newBoard)
    this.setState({ movingPiece: { ...newPiece}, board: paintedBoard.slice() })
  }

  removePause = () => {
    this.setState({ paused: false });
  }
/* End piece movement */

/* Pice rotation */
  checkNewCoords = (coords) => {
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

    const coordObj = Piece.getCoordsObject(piece)
    const outsideCoords = rotatedCoords.filter(([x, y]) => (
      x < 0 || x > 9 || y < 0 || (this.state.board[y][x] !== 0 && !coordObj.has(String(x)+','+String(y)))
    ))
    if (outsideCoords.length > 0) {
      return null
    }
    else {
      return this.checkNewCoords(rotatedCoords)
    }
  }

  rotatePiece = (rotation) => {
    const piece = this.state.movingPiece

    if (piece.type === PIECE_O) {
      return
    }
    else {
      const newCoords = this.getNextRotation(piece, rotation)
      if (newCoords === null) {
        return
      }
      const newPiece = {
        ...piece,
        rotation: piece.rotation + rotation,
        coords: newCoords
      }

      this.erasePiece(piece)
      this.paintPiece(newPiece)
      this.setState({
        movingPiece: { ...newPiece }
      })
    }
  }
/* End piece rotation */

/* Key press handling */
  handleKeyPress = (event) => {
    if (!this.state.finishedGame) {
      //console.log("key pressed: ")
      //console.log({charCode: event.charCode, key: event.key, keyCode: event.keyCode})

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
      // MOVE LEFT
      if (MOVE_LEFT.has(event.keyCode)) {
        this.removePause()
        this.movePiece('left')
        return
      }
      // MOVE RIGHT
      if (MOVE_RIGHT.has(event.keyCode)) {
        this.removePause()
        this.movePiece('right')
        return
      }
      // MOVE DOWN
      if (MOVE_DOWN.has(event.keyCode)) {
        this.removePause()
        this.movePiece('down')
        return
      }
      // DROP
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
/* End key press handling */

/* Button handlers */
  gameStart = (event) => {
    const piece = Piece.getPiece()
    this.setState({
      nextPiece: Piece.generateNextPieceType(),
      movingPiece: { ...piece },
      paused: false,
    })
    this.paintPiece(piece)
    this.updateLeaderboard()
  }

  submitScore = (event) => {
    this.setState({ submitted: true })

    const link = 'http://0.0.0.0:5000/api/register'
    const data = new FormData()
    data.set('name', this.state.name)
    data.set('score', this.state.score)

    axios({
      method: 'post',
      url: link,
      data: data,
      config: { headers: { 'Content-Type': 'multipart/form-data' }},
    })
      .then(res => {
        // Get the data and format it as a list of objects with name and score.
        const data = res.data
        alert(data.message)
        const piece = Piece.getPiece()
        this.setState({
          score: 0,
          nextPiece: ' ',
          holdPiece: ' ',
          holdBlocked: false,

          // In Board components
          board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0)),

          movingPiece: { ...piece },

          // Timer Interval
          timer: 1000,  // how ofter the piece will automatically go down

          // General Game State
          paused: true,
          submitted: false,
          finishedGame: false,
        })
        this.updateLeaderboard()
      })
  }

  captureInput = (event) => {
    this.setState({ name: event.target.value });
  }
/* End button handlers */

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
);
