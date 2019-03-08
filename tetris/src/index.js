import React from 'react';
import ReactDOM from 'react-dom';
import  axios from 'axios';
import './index.css';
import Board from './Board';

const ROTATE_RIGHT = new Set([75, 38, 188, 87, 32])
const ROTATE_LEFT = new Set([88])
const MOVE_RIGHT = new Set([76, 39, 69, 68])
const MOVE_LEFT = new Set([72, 37, 65])
const MOVE_DOWN = new Set([74, 40, 79, 83])
const PAUSE = new Set([76, 80])
const HOLD = new Set([16])
const DROP = new Set([13])

const BOARD_HEIGHT = 23
const BOARD_WIDTH = 10
const DEFAULT_TIMER = 1000

const SCORE_PER_ROW = 500
const MULTIPLIERS = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 }

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

/* For automatic component updates */
  // updateLeaderboard, componentDidMount and componentWillUnmount

  // Fetch the leaderboard from the API
  updateLeaderboard = () => {
    axios.get('http://0.0.0.0:5000/api/leaderboard')
      .then(res => {
        // Get the data
        this.setState({ leaderboard: res.data })
      })
  }

  // REFACTOR TO FUNCTION?
  componentDidMount() {
    this.downInterval = setInterval(() => {
      if (!this.state.finishedGame && !this.state.paused) {
        this.movePiece('down');
      }
    }, this.state.timer)

    this.updateLeaderboardInterval = setInterval(() => {
      this.updateLeaderboard()
    }, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.downInterval)
    clearInterval(this.updateLeaderboardInterval)
  }
/* End for automatic component updates*/

/* Score related functions */
  // getMultiplier and getScore
  // Get the score multiplier to use based on completed rows in a turn.
  getMultiplier = (rowsCompleted) => (
    MULTIPLIERS.hasOwnProperty(rowsCompleted) ? MULTIPLIERS[rowsCompleted] : 0
  )

  // Get the new score based on completed rows in a turn.
  getScore = (rowsCompleted) => {
    if (rowsCompleted <= 0) {
      return this.state.score
    }
    else {
      const multiplier = this.getMultiplier(rowsCompleted)
      return this.state.score + ((rowsCompleted * SCORE_PER_ROW) * multiplier)
    }
  }
/* End score related functions */

/* Piece generation and data functions*/
  // getCoordsObject, generateNextPieceType
  // getPiece and getNewPiece

  // Will return an object with the piece coords where the keys will be
  // [x, y] as a string and the values all 0s.
  getCoordsObject = (piece) => {
    let obj = {};
    for (let coords of piece.coords) {
      obj[coords] = 0;
    }
    return obj;
  }

  // Will return the string character to be used for the next piece.
  generateNextPieceType = () => {
    // pieceTypes is hard coded since those are the standard piece types for
    // the tetris game.
    let pieceTypes = ['o','i','t','l','j','s','z'];
    let currentTypeIndex = pieceTypes.indexOf(this.state.movingPiece.type);
    if (currentTypeIndex > -1) {
      pieceTypes.splice(currentTypeIndex, 1);
    }

    let nextPieceType =
      pieceTypes[Math.floor(Math.random()*pieceTypes.length)];
    return nextPieceType;
  }

  // Default settings to create any new piece.
  // if a type is given that piece will be created
  // else it will create a random piece
  getPiece = (type = '') => {
    switch(type) {
      case 'o':
        return {
          color: 1,
          type: 'o',
          rotation: 0,
          rotations: [[0,0]],
          coords: [[4,21],[5,21],[4,20],[5,20]],
        }

      case 'i':
        return {
          color: 2,
          type: 'i',
          rotation: 0,
          rotations: [
            [
              [-1, 2], [0, 1], [1, 0], [2, -1]
            ],
            [
              [2, 1], [1, 0], [0, -1], [-1, -2]
            ],
            [
              [1, -2], [0, -1], [-1, 0], [-2, 1]
            ],
            [
              [-2, -1], [-1, 0], [0, 1], [1, 2]
            ]
          ],
          coords: [[3,20],[4,20],[5,20],[6,20]],
        }

      case 't':
        return {
          color: 3,
          type: 't',
          rotation: 0,
          rotations: [
            [
              [1, 1], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [1, -1], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [-1, -1], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [-1, 1], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[4,21],[3,20],[4,20],[5,20]],
        }

      case 'l':
        return {
          color: 4,
          type: 'l',
          rotation: 0,
          rotations: [
            [
              [2, 0], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [0, -2], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [-2, 0], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [0, 2], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[5,21],[3,20],[4,20],[5,20]],
        }

      case 'j':
        return {
          color: 5,
          type: 'j',
          rotation: 0,
          rotations: [
            [
              [0, 2], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [2, 0], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [0, -2], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [-2, 0], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[3,21],[3,20],[4,20],[5,20]],
        }

      case 's':
        return {
          color: 6,
          type: 's',
          rotation: 0,
          rotations: [
            [
              [1, 1], [2, 0], [-1, 1], [0, 0]
            ],
            [
              [1, -1], [0, -2], [1, 1], [0, 0]
            ],
            [
              [-1, -1], [-2, 0], [1, -1], [0, 0]
            ],
            [
              [-1, 1], [0, 2], [-1, -1], [0, 0]
            ]
          ],
          coords: [[4,21],[5,21],[3,20],[4,20]],
        }

      case 'z':
        return {
          color: 7,
          type: 'z',
          rotation: 0,
          rotations: [
            [
              [0, 2], [1, 1], [0, 0], [1, -1]
            ],
            [
              [2, 0], [1, -1], [0, 0], [-1, -1]
            ],
            [
              [0, -2], [-1, -1], [0, 0], [-1, 1]
            ],
            [
              [-2, 0], [-1, 1], [0, 0], [1, 1]
            ]
          ],
          coords: [[3,21],[4,21],[4,20],[5,20]],
        }

      default://random piece
        let nextPiece = 'i'//this.generateNextPieceType();
        return this.getPiece(nextPiece);
    }
  }

  // Will create a new piece based on the type in nextPiece and randomly
  // generate a new nextPiece type that won't be a repeat of the last one.
  getNewPiece = (type = '') => {
    const newPiece = this.getPiece(this.state.nextPiece);

    this.setState({
      nextPiece: this.generateNextPieceType(),
      movingPiece: { ...newPiece },
      holdBlocked: false,
    });
  }
/* End piece generation */

/* Board repainting */
  // erasePiece, paintPiece, updateBoard, checkFinishedRows
  //NOT IMPLEMENTED
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

  // Erases old piece, paints the new one and re-renders
  updateBoard = (movingPiece, toWhite, toColor) => {
    //let newBoard;
    //newBoard = erasePiece(oldPiece);
    //newBoard = paintPiece(newPiece, newBoard);
    let tempCoords;
    let tempRow = [];
    let newBoard = [];

    for(let y = 0; y < 23; y++) {
      tempRow = [];

      for(let x = 0; x < 10; x++) {
        tempCoords = [x, y];

        if (toColor.hasOwnProperty(tempCoords)) {
          tempRow.push(movingPiece.color);
        }
        else {
          if (toWhite.hasOwnProperty(tempCoords)) {
            tempRow.push(0);
          }
          else {
            tempRow.push(this.state.board[y][x]);
          }
        }
      }

      newBoard.push(tempRow);
    }

    this.setState({
      board: newBoard,
      movingPiece: { ...movingPiece },
    });
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
      const newScore = this.getScore(completedRows);

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
        piece = this.getPiece(this.state.nextPiece)
        nextPiece = this.generateNextPieceType()
      }
      else {
        //console.log('hold and switch')
        piece = this.getPiece(currentHold)
        nextPiece = this.state.nextPiece
      }

      const board = this.paintedBoard(piece)

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
  // movePiece, removePause, handleKeyPress

  dropPiece = () => {
    // It should idealy be changed, if not the drop command was wasted.
    let counter = BOARD_HEIGHT

    // Object used to make sure the piece does not consider its own blocks
    // as possible stop locations.
    const coordsObj = this.getCoordsObject(this.state.movingPiece)

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
        if (this.state.board[tempY][x] > 0 && !coordsObj.hasOwnProperty([x, tempY])) {
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
  /*
    let newCoords
    const {coords} = this.state.movingPiece
    const {board} = this.state

    const coordsObj = this.getCoordsObject(this.state.movingPiece)

    switch(direction) {
      case 'left':
        newCoords = coords.filter(([x, y]) => (
          x > 0 && board[y][x--] !== undefined && board[y][x--] > 0 && !coordsObj.hasOwnProperty([x, y])
        )).map(([x, y]) => (
          [x-1, y]
        ))
        break
      case 'right':
        newCoords = coords.filter(([x, y]) => (
          x < 9 && board[y][x++] !== undefined && board[y][x++] > 0 && !coordsObj.hasOwnProperty([x, y])
        )).map(([x, y]) => (
          [x+1, y]
        ))
        break
      case 'down':
        newCoords = coords.filter(([x, y]) => (
          y > 0
        )).map(([x, y]) => (
          [x, y-1]
        ))
        console.log('new coords after map')
        console.log(newCoords)

        const finishCheck = newCoords.filter(([x, y]) => (
          y > 20
        ))
        if (finishCheck.length) {
          this.setState({ finishedGame: true })
          alert('End match')
          return
        }

        const canMove = newCoords.filter(([x, y]) => (
          board[y][x] === 0 || !coordsObj.hasOwnProperty([x, y])
        ))
        if (canMove.length < 4) {
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

    this.consoleBoard()
    const newPiece = { ...this.state.movingPiece, coords: newCoords }
    console.log(newPiece)
    const newBoard = this.erasePiece(this.state.movingPiece)
    this.consoleBoard(newBoard)
    const paintedBoard = this.paintPiece(newPiece, newBoard)
    this.consoleBoard(paintedBoard)
    this.setState({ movingPiece: { ...newPiece}, board: paintedBoard.slice() })
  //*/
  //*
    let counter = BOARD_HEIGHT
    let toWhite = {}
    let toColor = {}
    let newCoords = []
    let generateNew = false
    let finishedGame = false
    let minHeight = BOARD_HEIGHT
    const {type, color, coords, rotation, rotations} = this.state.movingPiece
    const coordsObj = this.getCoordsObject(this.state.movingPiece)

    for (let [x, y] of coords) {
      switch(direction) {
        case 'left':
          if (x > 0) {
            toWhite[[x, y]] = 0;
            x--
            toColor[[x, y]] = 0;
            newCoords.push([x,y]);
            if (this.state.board[y][x] > 0 && !coordsObj.hasOwnProperty([x, y])) {
              return;
            }
          }
          else {
            return;
          }
          break;

        case 'right':
          if (x < 9) {
            toWhite[[x, y]] = 0;
            x++;
            toColor[[x, y]] = 0;
            newCoords.push([x,y]);
            if (this.state.board[y][x] > 0 && !coordsObj.hasOwnProperty([x, y])) {
              return;
            }
          }
          else {
            return;
          }
          break;

        case 'drop':
          if (y <= 0) {
            return;
          }
          minHeight = Math.min(22, y);
          let counterAux = 0;
          for(let aux = minHeight - 1; aux >= 0; aux--) {
            counterAux++;
            console.log({
              x: x,
              y: y,
              aux: aux,
              block: this.state.board[aux][x],
              check: coordsObj.hasOwnProperty([x, aux])
            });
            if (this.state.board[aux][x] > 0 && !coordsObj.hasOwnProperty([x, aux])) {
              console.log({height: aux, counter: counterAux});
              minHeight = aux;
              counter = Math.min(counterAux - 1, counter);
              console.log(counter);
            }
          }
          if (counter === 99) {
            minHeight = 0;
            counter = Math.min(counterAux - 1, counter);
          }


          toWhite[[x, y]] = 0;
          break;

        default:
          if (y > 0) {
            toWhite[[x, y]] = 0;
            y--;
            toColor[[x, y]] = 0;
            newCoords.push([x,y]);
            if (this.state.board[y][x] > 0 && !coordsObj.hasOwnProperty([x, y])) {
              if (y >= 19) {
                finishedGame = true;
                break;
              }
              else {
                generateNew = true;
                break;
              }
            }
          }
          else {
            generateNew = true;
            break;
          }
          break;
      }
      if (generateNew) {
        break;
      }
    }
    if (direction === 'drop') {
      for(let [x, y] of coords) {
        y -= counter;
        toColor[[x, y]] = 0;
        newCoords.push([x,y]);
      }
    }
    if (generateNew) {
      this.getNewPiece();
      this.checkFinishedRows();
      //this.consoleBoard();
    }
    else {
      //console.log({color: color, type: type, coords: newCoords});
      this.updateBoard({color: color, type: type, coords: newCoords,
        rotation: rotation, rotations: rotations}, toWhite, toColor);
    }
    if (finishedGame) {
      this.setState({ finishedGame: true });
      alert('End match');
    }
  //*/
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

    return this.checkNewCoords(rotatedCoords)
  }

  rotatePiece = (rotation) => {
    const piece = this.state.movingPiece

    if (piece.type === 'o') {
      return
    }
    else {
      const newCoords = this.getNextRotation(piece, rotation)
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
      //console.log("key pressed: ");
      //console.log({charCode: event.charCode, key: event.key, keyCode: event.keyCode});

    /* Rotations */
      if (ROTATE_RIGHT.has(event.keyCode)) {
        //console.log('ROTATE RIGHT');
        this.rotatePiece(1);
        return;
      }
      if (ROTATE_LEFT.has(event.keyCode)) {
        //console.log('ROTATE LEFT');
        this.rotatePiece(-1);
        return;
      }
    /* End Rotations */

    /* Movement */
      // MOVE LEFT
      if (MOVE_LEFT.has(event.keyCode)) {
        //console.log('MOVE LEFT');
        this.removePause();
        this.movePiece('left');
        return;
      }
      // MOVE RIGHT
      if (MOVE_RIGHT.has(event.keyCode)) {
        //console.log('MOVE RIGHT');
        this.removePause();
        this.movePiece('right');
        return;
      }
      // MOVE DOWN
      if (MOVE_DOWN.has(event.keyCode)) {
        //console.log('MOVE DOWN');
        this.removePause();
        this.movePiece('bottom');
        return;
      }
      // DROP
      if (DROP.has(event.keyCode)) {
        console.log('DROP');
        this.removePause();
        this.dropPiece();
        return;
      }
    /* End Movement */

    /* Hold piece */
      if (HOLD.has(event.keyCode)) {
        //console.log('HOLD');
        this.removePause();
        this.holdPiece();
        return;
      }
    /* End Hold */

    /* Pause */
      if (PAUSE.has(event.keyCode)) {
        //console.log('pause');
        this.setState(state => ({ paused: !state.paused }));
        return;
      }
    /* End Pause */
    }
  }
/* End key press handling */

/* Button handlers */
  gameStart = (event) => {
    this.updateLeaderboard()
    const piece = this.getPiece()
    console.log(piece)
    this.setState({
      nextPiece: this.generateNextPieceType(),
      movingPiece: { ...piece },
      paused: false,
    })
    this.paintPiece(piece)
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
        const piece = this.getPiece()
        this.setState({
          score: 0,
          nextPiece: ' ',
          holdPiece: ' ',
          holdBlocked: false,
          leaderboard: [],

          // In Board components
          board: Array(BOARD_HEIGHT).fill(null).map(_ => Array(BOARD_WIDTH).fill(0)),

          movingPiece: { ...piece },

          // Timer Interval
          counter: 29,   // will reset and fetch leaderboard every 30s
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
