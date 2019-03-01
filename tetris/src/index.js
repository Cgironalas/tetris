import React from 'react';
import ReactDOM from 'react-dom';
import  axios from 'axios';
import './index.css';
import Board from './Board';

class Game extends React.Component {
  // Create the game board as a React Component.
  constructor(props) {
    super(props);
    this.state = {
      // Side Data
      score: 0,
      next_piece: ' ',
      hold_piece: ' ',
      hold_blocked: false,
      leaderboard: [],

      // In Board components
      board: Array(23).fill(
        Array(10).fill(0)
      ),
      moving_piece: {
        color: 2,
        type: 'i',
        coords: [[5, 10],[6,10],[7,10],[8,10]],
        rotation: 0,
        rotations: [],
      },

      // Timer Interval
      counter: 29,   // will reset and fetch leaderboard every 30s
      timer: 1000,  // how ofter the piece will automatically go down

      // General Game State
      paused: true,
      submitted: false,
      finished_game: false,
    }
  }

  // Print the game board on console.
  console_board(board = this.state.board) {
    let output = "";
    for (let row of board) {
      let row_string = row.join(' - ');
      output = row_string + '\n' + output;
    }
    console.log(output);
  }

/* For automatic component updates */
  // update_leaderboard, componentDidMount and componentWillUnmount

  // Fetch the leaderboard from the API
  update_leaderboard() {
    axios.get('http://0.0.0.0:5000/leaderboard')
      .then(res => {
        // Get the data and format it as a list of objects with name and score.
        const rankings = res.data.split(';').map((value, index) => {
          let user = value.split(',');
          return { name: user[0], score: user[1] };
        });
        this.setState({leaderboard: rankings});
      });
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      let counter = this.state.counter;
      counter++;
      if (!this.state.finished_game && !this.state.paused) {
        this.move_piece('down');
      }
      if (counter === 30) {
        this.setState({ counter: 0 });
        this.update_leaderboard();
      }
      else {
        this.setState({ counter: counter });
      }
    }, this.state.timer)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
/* End for automatic component updates*/

/* Score related functions */
  // get_multiplier and get_score
  // Get the score multiplier to use based on completed rows in a turn.
  get_multiplier(rows_completed) {
    let multiplier;
    if (rows_completed === 1) {
      multiplier = 1;
    } else if (rows_completed === 2) {
      multiplier = 1.25;
    } else if (rows_completed === 3) {
      multiplier = 1.5;
    } else {
      multiplier = 2;
    }
    return multiplier;
  }

  // Get the new score based on completed rows in a turn.
  get_score(rows_completed) {
    if (rows_completed === 0) {
      return this.state.score;
    }
    else {
      let multiplier = this.get_multiplier(rows_completed);
      return this.state.score + ((rows_completed * 500) * multiplier);
    }
  }
/* End score related functions */

/* Piece generation and data functions*/
  // get_coords_object, generate_next_piece_type
  // get_piece and get_new_piece

  // Will return an object with the piece coords where the keys will be
  // [x, y] as a string and the values all 0s.
  get_coords_object(piece) {
    let obj = {};
    for (let coords of piece.coords) {
      obj[coords] = 0;
    }
    return obj;
  }

  // Will return the string character to be used for the next piece.
  generate_next_piece_type() {
    // piece_types is hard coded since those are the standard piece types for
    // the tetris game.
    let piece_types = ['o','i','t','l','j','s','z'];
    let current_type_index = piece_types.indexOf(this.state.moving_piece.type);
    if (current_type_index > -1) {
      piece_types.splice(current_type_index, 1);
    }

    let next_piece_type =
      piece_types[Math.floor(Math.random()*piece_types.length)];
    return next_piece_type;
  }

  // Default settings to create any new piece.
  // if a type is given that piece will be created
  // else it will create a random piece
  get_piece(type = '') {
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
        let next_piece = 'i'//this.generate_next_piece_type();
        return this.get_piece(next_piece);
    }
  }

  // Will create a new piece based on the type in next_piece and randomly
  // generate a new next_piece type that won't be a repeat of the last one.
  get_new_piece(type = '') {
    let new_piece = this.get_piece(this.state.next_piece);
    let next_piece_type = this.generate_next_piece_type();

    this.setState({
      next_piece: next_piece_type,
      moving_piece: {
        type: new_piece.type,
        color: new_piece.color,
        coords: new_piece.coords,
        rotation: new_piece.rotation,
        rotations: new_piece.rotations,
      },
      hold_blocked: false,
    });
    this.forceUpdate();
  }
/* End piece generation */

/* Board repainting */
  // erase_piece, paint_piece, update_board, check_finished_rows
  //NOT IMPLEMENTED
  erase_piece(piece, board = this.state.board) {
    let x, y;
    let new_board = board.slice();
    for ([x, y] of piece.coords) {
      new_board[y][x] = 0;
    }
    return new_board;
  }
  //NOT IMPLEMENTED
  paint_piece(piece, board = this.state.board) {
    let x, y;
    let color = piece.color;
    let new_board = board.slice();
    for ([x, y] of piece.coords) {
      new_board[y][x] = color;
    }
    return new_board;
  }

  // Erases old piece, paints the new one and re-renders
  update_board(moving_piece, to_white, to_color) {
    //let new_board;
    //new_board = erase_piece(old_piece);
    //new_board = paint_piece(new_piece, new_board);
    let x, y; // x and y used to traverse the game board.
    let temp_coords;
    let temp_row = [];
    let new_board = [];

    for(y = 0; y < 21; y++) {
      temp_row = [];

      for(x = 0; x < 10; x++) {
        temp_coords = [x, y];

        if (to_color.hasOwnProperty(temp_coords)) {
          temp_row.push(moving_piece.color);
        }
        else {
          if (to_white.hasOwnProperty(temp_coords)) {
            temp_row.push(0);
          }
          else {
            temp_row.push(this.state.board[y][x]);
          }
        }
      }

      new_board.push(temp_row);
    }

    this.setState({
      board: new_board,
      moving_piece: {
        type: moving_piece.type,
        color: moving_piece.color,
        coords: moving_piece.coords,
        rotation: moving_piece.rotation,
        rotations: moving_piece.rotations,
      }
    });
    this.forceUpdate();
  }

  /*
    Checks every row to see if it was completely filled. Each filled row will
    be ignored for the next version of the board, the score will be added
    accordingly and the board will be topped again.
    Forces re-render.
  */
  check_finished_rows() {
    //console.log('\nChecking finished rows...');
    let new_board = [];
    let completed_rows = 0;

    // Check to see if any row is complete (no block as 0)
    for (let row of this.state.board) {
      if (row.indexOf(0) > -1) {
        new_board.push(row);
      }
      else {
        completed_rows++;
      }
    }
    //console.log('lines completed: ' + completed_rows);

    if (completed_rows > 0) {
      // Finish filling the board with 0s
      for (let y = 0; y < completed_rows; y++) {
        let temp_row = Array(10).fill(0);
        new_board.push(temp_row);
      }
      //this.console_board(new_board);

      // Get the new score.
      let new_score = this.get_score(completed_rows);
      //console.log('new score: ' + new_score);

      let new_timer = Math.max(this.state.timer - (completed_rows * 200), 300);

      this.setState({
        score: new_score,
        board: new_board,
        timer: new_timer,
      });
      this.forceUpdate();
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        let counter = this.state.counter;
        counter += this.state.timer;
        if (!this.state.finished_game && !this.state.paused) {
          this.move_piece('down');
        }
        if (counter >= 30000) {
          this.setState({ counter: 0 });
          this.update_leaderboard();
        }
        else {
          this.setState({ counter: counter });
        }
      }, this.state.timer)
    }
  }

  hold_piece() {
    if (this.state.hold_blocked === false) {
      let current_hold = this.state.hold_piece;
      let old_piece = this.state.moving_piece;
      let type = this.state.moving_piece.type;
      let piece, next_piece;

      let board = this.erase_piece(old_piece);

      if (current_hold === ' ') {
        //console.log('hold and create new');
        piece = this.get_piece(this.state.next_piece);
        //console.log(piece);
        next_piece = this.generate_next_piece_type();
      }
      else {
        //console.log('hold and switch');
        piece = this.get_piece(current_hold);
        next_piece = this.state.next_piece;
      }
      this.setState({
        next_piece: next_piece,
        hold_piece: type,
        hold_blocked: true,
        board: board.slice(),
        moving_piece: {
          color: piece.color,
          type: piece.type,
          coords: piece.coords,
          rotation: piece.rotation,
          rotations: piece.rotations,
        }
      });
      this.forceUpdate();
    }
    else {
      console.log('you are already holding a piece');
    }
  }
/* End board repainting */

/* Piece movement */
  // move_piece, remove_pause, handleKeyPress

  move_piece(direction) {
    let x, y;
    let to_white = {};
    let to_color = {};
    let new_coords = [];
    let generate_new = false;
    let finished_game = false;

    let type = this.state.moving_piece.type;
    let color = this.state.moving_piece.color;
    let coords = this.state.moving_piece.coords;
    let rotation = this.state.moving_piece.rotation
    let rotations = this.state.moving_piece.rotations
    let coords_obj = this.get_coords_object(this.state.moving_piece);
    let min_height = 21;
    let counter = 99;

    for ([x, y] of coords) {
      //x = pair[0];
      //y = pair[1];

      switch(direction) {
        case 'left':
          if (x > 0) {
            to_white[[x, y]] = 0;
            x--;
            to_color[[x, y]] = 0;
            new_coords.push([x,y]);
            if (this.state.board[y][x] !== 0 && !coords_obj.hasOwnProperty([x, y])) {
              return;
            }
          }
          else {
            return;
          }
          break;

        case 'right':
          if (x < 9) {
            to_white[[x, y]] = 0;
            x++;
            to_color[[x, y]] = 0;
            new_coords.push([x,y]);
            if (this.state.board[y][x] !== 0 && !coords_obj.hasOwnProperty([x, y])) {
              return;
            }
          }
          else {
            return;
          }
          break;

        case 'drop':
          if (y === 0) {
            return;
          }
          min_height = Math.min(22, y);
          let counter_aux = 0;
          let aux;
          for(aux = min_height - 1; aux >= 0; aux--) {
            counter_aux++;
            console.log({
              x: x,
              y: y,
              aux: aux,
              block: this.state.board[aux][x],
              check: coords_obj.hasOwnProperty([x, aux])
            });
            if (this.state.board[aux][x] !== 0 && !coords_obj.hasOwnProperty([x, aux])) {
              console.log({height: aux, counter: counter_aux});
              min_height = aux;
              counter = Math.min(counter_aux - 1, counter);
              console.log(counter);
            }
          }
          if (counter === 99) {
            min_height = 0;
            counter = Math.min(counter_aux - 1, counter);
          }


          to_white[[x, y]] = 0;
          //to_color[[x, y]] = 0;
          //new_coords.push([x,y]);
          break;

        default:
          if (y > 0) {
            to_white[[x, y]] = 0;
            y--;
            to_color[[x, y]] = 0;
            new_coords.push([x,y]);
            if (this.state.board[y][x] !== 0 && !coords_obj.hasOwnProperty([x, y])) {
              if (y >= 19) {
                finished_game = true;
                break;
              }
              else {
                generate_new = true;
                break;
              }
            }
          }
          else {
            generate_new = true;
            break;
          }
          break;
      }
      if (generate_new) {
        break;
      }
    }
    if (direction === 'drop') {
      for([x, y] of coords) {
        y -= counter;
        to_color[[x, y]] = 0;
        new_coords.push([x,y]);
      }
    }
    if (generate_new) {
      this.get_new_piece();
      this.check_finished_rows();
      //this.console_board();
    }
    else {
      //console.log({color: color, type: type, coords: new_coords});
      this.update_board({color: color, type: type, coords: new_coords,
        rotation: rotation, rotations: rotations}, to_white, to_color);
    }
    if (finished_game) {
      this.setState({ finished_game: true });
      alert('End match');
    }
  }

  remove_pause(){
    this.setState({ paused: false });
    this.forceUpdate();
  }
/* End piece movement */

/* Pice rotation */
  check_new_coords = (coords) => {
    let good, x, y
    let x_sum = 0
    let y_sum = 0
    do {
      good = true
      for ([x, y] of coords) {
        x = x + x_sum
        y = y + y_sum
        x_sum = 0
        y_sum = 0
        if (x < 0) {
          good = false
          y_sum = Math.max(y_sum, 0)
          x_sum = Math.abs(x_sum, x)
          break
        }
        if (x > 9) {
          good = false
          y_sum = 0
          x_sum = 0 - x + 9
        }
        if (y < 0) {
          good = false
          y_sum = Math.max(y_sum, Math.abs(y))
        }
      }
    } while (!good);
    let checked_coords = coords
    return checked_coords
  }
  get_next_rotation = (piece, rotation) => {
    let new_coords = []

    let old_coords = piece.coords
    let rotation_index = piece.rotation
    let rotation_math = piece.rotations[(rotation_index + rotation) % 4]

    for (let i = 0; i < 4; i++) {
      let x, x_sum, y, y_sum

      x = old_coords[i][0]
      x_sum = rotation_math[i][0]
      y = old_coords[i][1]
      y_sum = rotation_math[i][1]

      new_coords.push([x + x_sum, y + y_sum])
    }

    let checked_coords = this.check_new_coords(new_coords);
    console.log(checked_coords)
    console.log('\n')
    return checked_coords;
  }

  rotate_piece = (rotation) => {
    let piece = this.state.moving_piece

    if (piece.type === 'o') {
      return
    }
    else {
      let new_coords = this.get_next_rotation(piece, rotation)
      let new_piece = {
        color: piece.color,
        type: piece.type,
        rotation: piece.rotation + rotation,
        rotations: piece.rotations,
        coords: new_coords,
      }
      this.erase_piece(piece)
      this.paint_piece(new_piece)
      this.setState({
        moving_piece: new_piece
      })
    }
  }
/* End piece rotation */

/* Key press handling */
  handleKeyPress = (event) => {
    if (!this.state.finished_game) {
      //console.log("key pressed: ");
      //console.log({charCode: event.charCode, key: event.key, keyCode: event.keyCode});

    /* Rotations */
      if (event.keyCode === 82 || event.keyCode === 32) {
        //console.log('ROTATE RIGHT');
        this.rotate_piece(1);
        return;
      }
      if (event.keyCode === 88) {
        //console.log('ROTATE LEFT');
        this.rotate_piece(-1);
        return;
      }
    /* End Rotations */

    /* Movement */
      // MOVE LEFT
      if (event.keyCode === 65 || event.keyCode === 37) {
        //console.log('MOVE LEFT');
        this.remove_pause();
        this.move_piece('left');
        return;
      }
      // MOVE RIGHT
      if (event.keyCode === 68 || event.keyCode === 69 || event.keyCode === 39) {
        //console.log('MOVE RIGHT');
        this.remove_pause();
        this.move_piece('right');
        return;
      }
      // MOVE BOTTOM
      if (event.keyCode === 83 || event.keyCode === 79 || event.keyCode === 40) {
        //console.log('MOVE BOTTOM');
        this.remove_pause();
        this.move_piece('bottom');
        return;
      }
      // DROP
      if (event.keyCode === 13) {
        console.log('DROP');
        this.remove_pause();
        this.move_piece('drop');
        return;
      }
    /* End Movement */

    /* Hold piece */
      if (event.keyCode === 72 || event.keyCode === 74 || event.keyCode === 16) {
        //console.log('HOLD');
        this.remove_pause();
        this.hold_piece();
        return;
      }
    /* End Hold */

    /* Pause */
      if (event.keyCode === 80) {
        //console.log('pause');
        this.setState({ paused: !this.state.paused });
        this.forceUpdate();
        return;
      }
    /* End Pause */
    }
  }
/* End key press handling */

/* Button handlers */
  game_start = (event) => {
    let piece, next_piece;
    next_piece = this.generate_next_piece_type();
    piece = this.get_piece();
    console.log(piece)
    this.setState({
      next_piece: next_piece,
      moving_piece: {
        color: piece.color,
        type: piece.type,
        coords: piece.coords,
        rotation: piece.rotation,
        rotations: piece.rotations,
      },
      paused: false,
    });
    this.forceUpdate();
  }

  submit_score = (event) => {
    this.setState({ submitted: true });
    let link = 'http://0.0.0.0:5000/' + this.state.name + '/' + this.state.score + '/register';
    console.log(link);
    axios.get(link)
      .then(res => {
        // Get the data and format it as a list of objects with name and score.
        const data = res.data;
        console.log(data);
        let piece = this.get_piece()
        this.setState({
          score: 0,
          next_piece: ' ',
          hold_piece: ' ',
          hold_blocked: false,
          leaderboard: [],

          // In Board components
          board: Array(22).fill(
            Array(10).fill(0)
          ),
          moving_piece: {
            color: piece.color,
            type: piece.type,
            coords: piece.coords,
            rotation: piece.rotation,
            rotations: piece.rotations,
          },

          // Timer Interval
          counter: 29,   // will reset and fetch leaderboard every 30s
          timer: 1000,  // how ofter the piece will automatically go down

          // General Game State
          paused: true,
          submitted: false,
          finished_game: false,
        });
        this.forceUpdate();
        this.update_leaderboard();
      });
  }

  capture_input = (event) => {
    this.setState({ name: event.target.value });
  }

/* End button handlers */

  render() {
    return (
      <div className="game" onKeyDown={this.handleKeyPress}>
        <div className='pause'>
          {
            this.state.paused ?
              this.state.next_piece === ' ' ?
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
          <div className='game-detail'>{this.state.next_piece}</div>

          <div className='game-info'><b>Hold Piece</b></div>
          <div className='game-detail'>{
            this.state.hold_piece === ' ' ?
              'Not holding a piece' : this.state.hold_piece
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
            this.state.next_piece === ' ' ? <button className='game-info' type='button' onClick={this.game_start}>Start Game</button> : null
          }
          {
            this.state.finished_game ?
              <div className='game-info'>
                <input
                  className='game-detail'
                  type='text'
                  placeholder='Type your name here'
                  onChange={this.capture_input} />
                <button className='game-detail' type='button' disabled={this.state.submitted} onClick={this.submit_score}>
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
