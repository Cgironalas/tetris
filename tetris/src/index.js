import React from 'react'
import ReactDOM from 'react-dom'

import  axios from 'axios'

import './index.css'
import Board from './Board'
import Leaderboard from './Leaderboard'

import getTurnPoints from './scoring'
import {
  getTetriminoCoordsSet, getRandomTetriminoType, getTetrimino
} from './tetriminos'
import {
  BOARD_HEIGHT, BOARD_WIDTH, NO_HOLD, NO_NEXT,
  ROTATE_RIGHT, ROTATE_LEFT, MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN, DROP, HOLD, CLOSE_MODAL,
  PAUSE, DOWN, LEFT, RIGHT,
  O_TETRIMINO, SHADOW_COLOR, EMPTY_COLOR,
  MINIMUM_TIMER, DEFAULT_TIMER, LB_UPDATE_RATE, TIMER_REDUCTION_PER_ROW,
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
      color: EMPTY_COLOR,
      type: ' ',
      coords: [],
      rotation: 0,
      rotations: [],
    },
    board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(EMPTY_COLOR)),

    // Timer Interval
    timer: DEFAULT_TIMER,  // how ofter the piece will automatically go down

    // General Game State
    paused: true,
    showModal: false,
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
    axios.get('/flask/leaderboard')
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
    const newPiece = getTetrimino(this.state.nextPiece)

    const finishCheck = newPiece.coords.filter(([x, y]) => (
      this.state.board[y-1][x] !== EMPTY_COLOR
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
        nextPiece: getRandomTetriminoType(),
      })
    }
  }
/** END **/

/* Board repainting */
  // erasePiece, paintPiece, checkFinishedRows

  erasePiece = (coords, board = this.state.board) => {
    let newBoard = board.slice()
    for (let [x, y] of coords) {
      newBoard[y][x] = EMPTY_COLOR
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
      row.indexOf(EMPTY_COLOR) > -1
    ))

    const completedRows = BOARD_HEIGHT - newBoard.length
    //console.log('lines completed: ' + completedRows);

    if (completedRows > 0) {
      // Finish filling the board with 0s
      const filledBoard = this.state.board.reduce((board, row) => {
        if (row.indexOf(EMPTY_COLOR) === -1) {
          return [...board, (Array(BOARD_WIDTH).fill(EMPTY_COLOR))]
        }
        return board
      }, newBoard)


      // Get the new score.
      const newScore = this.state.score + getTurnPoints(completedRows)

      const newTimer = Math.max(this.state.timer - (completedRows * TIMER_REDUCTION_PER_ROW), MINIMUM_TIMER)

      this.setState({
        score: newScore,
        board: filledBoard,
        timer: newTimer,
      })
      clearInterval(this.downInterval)
      this.downInterval = setInterval(() => {
        if (!this.state.finishedGame && !this.state.paused) {
          this.movePiece(DOWN);
        }
      }, this.state.timer)
    }
  }

  holdPiece = () => {
    if (this.state.holdBlocked === false) {
      const nextPieceType = this.state.nextPiece
      const holdPieceType = this.state.holdPiece
      const oldPiece = this.state.movingPiece
      const oldShadow = this.state.shadow

      let newPiece, nextPiece, newShadow

      if (holdPieceType === ' ') {
        nextPiece = getRandomTetriminoType()
        newPiece = getTetrimino(nextPieceType)
        newShadow = this.getShadowCoords(newPiece, oldPiece)
      }
      else {
        nextPiece = nextPieceType
        newPiece = getTetrimino(holdPieceType)
        newShadow = this.getShadowCoords(newPiece, oldPiece)
      }

      const boardShadowUpdated = this.updatePiece(oldShadow, newShadow, SHADOW_COLOR)
      const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, boardShadowUpdated)

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

    const pieceCoordsObj = getTetriminoCoordsSet(piece)
    const oldPieceCoords = getTetriminoCoordsSet(oldPiece)
    const shadowCoordsObj = getTetriminoCoordsSet({coords: oldShadow})

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
    if (this.state.shadow.length) {
      const oldPiece = this.state.movingPiece
      const newPiece = { ...oldPiece, coords: this.state.shadow }

      const erasedShadowBoard = this.erasePiece(this.state.shadow)
      const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, erasedShadowBoard)

      this.setState({
        shadow: [],
        board: [ ...updatedBoard ],
        movingPiece: { ...newPiece },
      })
    }
  }

  movePiece = (direction) => {
    const pieceCoordsObj = getTetriminoCoordsSet(this.state.movingPiece)
    const oldPiece = this.state.movingPiece
    const {board} = this.state

    let newCoords

    switch(direction) {
      case LEFT:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          x > 0 && board[y][x-1] !== undefined && (
            board[y][x-1] === EMPTY_COLOR || board[y][x-1] === SHADOW_COLOR ||
            pieceCoordsObj.has(String(x-1) + ',' + String(y))
          )
        )).map(([x, y]) => ( [x-1, y] ))
        break
      case RIGHT:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          x < 9 && board[y][x+1] !== undefined && (
            board[y][x+1] === EMPTY_COLOR || board[y][x+1] === SHADOW_COLOR ||
            pieceCoordsObj.has(String(x+1) + ',' + String(y))
          )
        )).map(([x, y]) => ( [x+1, y] ))
        break
      case DOWN:
        newCoords = oldPiece.coords.filter(([x, y]) => (
          y > 0 && board[y-1][x] !== undefined && (
            board[y-1][x] === EMPTY_COLOR || board[y-1][x]  === SHADOW_COLOR ||
            pieceCoordsObj.has(String(x) + ',' + String(y-1))
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

    const shadowCoords = this.getShadowCoords(newPiece, oldPiece)

    const updatedShadowBoard = this.updatePiece(this.state.shadow, shadowCoords, SHADOW_COLOR)
    const updatedBoard = this.updatePiece(oldPiece.coords, newPiece.coords, newPiece.color, updatedShadowBoard)
    this.setState({ movingPiece: { ...newPiece}, board: updatedBoard.slice(), shadow: shadowCoords })
  }

  removePause = () => {
    this.setState({ paused: false })
  }
/* End piece movement */

/* Pice rotation */
  checkKicks = (coords, piece, nextRotation) => {
    const testsKey = String(piece.rotation) + ',' + String(nextRotation)
    const currentTests = piece.wallKickTests[testsKey]

    const board = [ ...this.state.board ]
    const pieceCoordsObj = getTetriminoCoordsSet(piece)

    const tests = currentTests.map( ([sumX, sumY]) => (
      coords.map( ([x, y]) => (
        [x + sumX, y + sumY]
      )).filter( ([X, Y]) => (
        board[Y] !== undefined  && board[Y][X] !== undefined && (
          board[Y][X] === EMPTY_COLOR || board[Y][X] === SHADOW_COLOR || (
            pieceCoordsObj.has(String(X) + ',' + String(Y))
          )
        )
      ))
    ))

    for (coords of tests) {
      if (coords.length === 4) {
        return coords
      }
    }

    return null
  }

  getNextRotation = (piece, rotation, nextRotation) => {
    const rotationMath = piece.rotations[nextRotation]

    const rotatedCoords = piece.coords.map(([x, y], index) => {
      const xSum = rotationMath[index][0] * rotation
      const ySum = rotationMath[index][1] * rotation
      return [x + xSum, y + ySum]
    })

    return this.checkKicks(rotatedCoords, piece, nextRotation)
  }

  rotatePiece = (rotation) => {
    const oldPiece = this.state.movingPiece
    const oldShadowCoords = this.state.shadow

    const prevRotation = oldPiece.rotation
    const sum = prevRotation + rotation
    const nextRotation = sum === 4 ? 0 : sum === -1 ? 3 : sum

    if (oldPiece.type === O_TETRIMINO) {
      return
    }
    else {
      const newCoords = this.getNextRotation(oldPiece, rotation, nextRotation)
      if (newCoords === null) {
        return
      }
      const newPiece = {
        ...oldPiece,
        rotation: nextRotation,
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
    /* If Modal Closed*/
      if (!this.state.finishedGame) {
      /* Rotations */
        if (ROTATE_RIGHT.has(event.keyCode)) {
          this.removePause()
          this.rotatePiece(1)
          return
        }

        // if (ROTATE_LEFT.has(event.keyCode)) {
        //   this.removePause()
        //   this.rotatePiece(-1)
        //   return
        // }
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
    /* End if modal closed */

    /* Close modal */
      if (this.state.showModal && CLOSE_MODAL.has(event.keyCode)) {
        this.hideModalEvent(null)
      }
    /* End Close Modal */
  }
/** END **/

/** Button handlers **/
  gameStart = (event) => {
    this.updateLeaderboard()

    const piece = getTetrimino()
    const shadow = this.getShadowCoords(piece)
    const board = Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(EMPTY_COLOR))

    const shadowBoard = this.paintPiece(shadow, SHADOW_COLOR, board)
    const updatedBoard = this.paintPiece(piece.coords, piece.color, shadowBoard)


    this.setState({
      paused: false,
      timer: DEFAULT_TIMER,
      shadow: [ ...shadow ],
      board: [ ...updatedBoard],
      movingPiece: { ...piece },
      nextPiece: getRandomTetriminoType(),
    })
    document.getElementById("game").focus()
  }

  submitScore = (event) => {
    this.setState({ submitted: true })

    const data = new FormData()
    data.set('name', this.state.name)
    data.set('score', this.state.score)
    const link = '/flask/register'

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

        const piece = getTetrimino()
        this.setState({
          // Side Data
          score: 0,
          nextPiece: ' ',
          holdPiece: ' ',
          holdBlocked: false,

          // In Board components
          shadow: [],
          movingPiece: { ...piece },
          board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(EMPTY_COLOR)),

          // Timer Interval
          timer: DEFAULT_TIMER,  // how ofter the piece will automatically go down

          // General Game State
          paused: true,
          submitted: false,
          finishedGame: false,
        })
        this.downInterval = setInterval(() => {
          if (!this.state.finishedGame && !this.state.paused) {
            this.movePiece(DOWN);
          }
        }, this.state.timer)
      })
  }

  captureInput = (event) => {
    this.setState({ name: event.target.value })
  }

  showModalEvent = (event) => {
    axios.get('/flask/rankings')
      .then(res => {
        this.setState({ showModal: res.data})
      })
  }
  hideModalEvent = (event) => {
    this.setState({ showModal: false })
  }
/** END **/

  printLeaderboard = (leaderboard, type) => (
    <div className='leaderboard'>
      <div className='game-info leaderboard'><b>Leaderboard</b></div>

      <table className='game-info leaderboard'>
        <thead>
          <tr>
            { type === 'long' ? <th>Id</th> : null }
            <th>User name</th>
            <th>Score</th>
            { type === 'long' ? <th>Date</th> : null }
          </tr>
        </thead>
        <tbody>
          {
            leaderboard.map((ranker, index) => {
              if (type === 'long') {
                return (
                  <tr key={index}>
                    <td>{ranker.id}</td>
                    <td>{ranker.name}</td>
                    <td>{ranker.score}</td>
                    <td>{ranker.date_time}</td>
                  </tr>
                )
              }
              else {
                return (
                  <tr key={index}>
                    <td>{ranker.name}</td>
                    <td>{ranker.score}</td>
                  </tr>
                )
              }
            })

          }
        </tbody>
      </table>
    </div>
  )


  render() {
    const modal = this.state.showModal ? (
      <Leaderboard>
        <div className="modal">
          <div>
            { this.printLeaderboard(this.state.showModal, 'long') }
            <br/>
            <button onClick={this.hideModalEvent}>Close Modal</button>
          </div>
        </div>
      </Leaderboard>
    ) : null;

    return (
      <div id="game" className="game" onKeyDown={this.handleKeyPress} tabIndex="0">
        {modal}
        <div className='instructions'>
          <h1 className='Title'>
          {
            this.state.paused ?
              this.state.nextPiece === ' ' ?
                'NEW GAME'
              :
                'GAME PAUSED'
            :
              "\u00a0"
          }
          </h1>
          <br/>
	  <div className='game-info'>
            <h4>CONTROLS</h4>
            <p>To move left you can use:<br/>'LEFT ARROW, H, or A'</p>
            <p>To move right you can use:<br/>'RIGHT ARROW, L, D, or E'</p>
            <p>To move down you can use:<br/>'DOWN ARROW, J, S, or O'</p>
            <p>To rotate the current piece use:<br/>'SPACEBAR, UP ARROW, K, or R'</p>
            <p>To hold a piece press<br/>'SHIFT'</p>
            <p>To drop the current piece press<br/>'ENTER or G'</p>
            <p>You can pause the game by pressing<br/>'P'</p>
	  </div>

        </div>

        <div className="game-board">
          <Board rows={this.state.board.slice(0, 20)} />
        </div>


        <div className="side-bar">
          <div className='game-info'>
            <b>Score</b>
          </div>
          <div className='game-detail'>
            {this.state.score}
          </div>

          <div className='game-info'>
            <b>Next Piece</b>
          </div>
          <div className='game-detail'>
            {
              this.state.nextPiece === ' ' ?
                NO_NEXT
              :
                this.state.nextPiece
            }
          </div>

          <div className='game-info'>
            <b>Hold Piece</b>
          </div>
          <div className='game-detail'>
            {
              this.state.holdPiece === ' ' ?
                NO_HOLD
              :
                this.state.holdPiece
            }
          </div>

          {
            this.printLeaderboard(this.state.leaderboard, 'short')
          }
          {
            this.state.paused ?
              <div>
                <button className='game-info' type='button' onClick={this.showModalEvent}>
                  Show Complete
                </button>
                <br/>
              </div>
            :
              null
          }
          {
            this.state.nextPiece === ' ' ?
              <button className='game-info' type='button' onClick={this.gameStart}>
                Start Game
              </button>
            :
              null
          }
          {
            this.state.finishedGame ?
              <div>
                <input
                  className='game-info'
                  type='text'
                  placeholder='Type your name here'
                  onChange={this.captureInput} />
                <br/>
                <button className='game-info' type='button' disabled={this.state.submitted} onClick={this.submitScore}>
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
