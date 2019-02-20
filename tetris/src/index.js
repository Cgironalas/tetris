import React from 'react';
import ReactDOM from 'react-dom';
import  axios from 'axios';
import './index.css';

// A block of the board, considered as a 1x1 within the board.
function Block(props) {
  return (
    <button className={`block color${props.color}`}>
    </button>
  );
}

// A row from the board, 20 will be shown, each one 10 blocks wide.
class Row extends React.Component {
  render_block(i) {
    return (
      <Block
        color={this.props.blocks[i]}
      />
    );
  }

  // Renders a board row 10 blocks wide.
  render() {
    return (
      <div className="board-row">
        {this.render_block(0)}
        {this.render_block(1)}
        {this.render_block(2)}
        {this.render_block(3)}
        {this.render_block(4)}
        {this.render_block(5)}
        {this.render_block(6)}
        {this.render_block(7)}
        {this.render_block(8)}
        {this.render_block(9)}
      </div>
    );
  }
}

class Board extends React.Component {
  render_row(i) {
    return (
      <Row
        blocks={this.props.rows[i]}
      />
    );
  }

  render() {
    return (
      <div className="board">
        {this.render_row(19)}
        {this.render_row(18)}
        {this.render_row(17)}
        {this.render_row(16)}
        {this.render_row(15)}
        {this.render_row(14)}
        {this.render_row(13)}
        {this.render_row(12)}
        {this.render_row(11)}
        {this.render_row(10)}
        {this.render_row(9)}
        {this.render_row(8)}
        {this.render_row(7)}
        {this.render_row(6)}
        {this.render_row(5)}
        {this.render_row(4)}
        {this.render_row(3)}
        {this.render_row(2)}
        {this.render_row(1)}
        {this.render_row(0)}
      </div>
    );
  }
}

class Game extends React.Component {
  // Create the game board as a React Component.
  constructor(props) {
    super(props);
    this.state = {
      finished_game: false,
      submitted: false,
      score: 0,
      next_piece: 'i',
      hold_piece: ' ',
      hold_blocked: false,
      board: Array(21).fill(
        Array(10).fill(0)
      ),
      moving_piece: {
        color: 2,
        type: 'i',
        coordinates: [[5, 10],[6,10],[7,10],[8,10]],
      },
      leaderboard: [],
    }
  }

  update_game(
    score = this.state.score,
    next_piece = this.state.next_piece,
    hold_piece = this.state.hold_piece,
    hold_blocked = this.state.hold_blocked,
    board = this.state.board,
    moving_piece = this.state.moving_piece,
    leaderboard = this.state.leaderboard,
  ) {
    this.setState({
      finished_game: false,
      submitted: false,
      score: score,
      next_piece: next_piece,
      hold_piece: hold_piece,
      hold_blocked: hold_blocked,
      board: board.slice(),
      moving_piece: {
        color: moving_piece.color,
        type: moving_piece.type,
        coordinates: moving_piece.coordinates,
      },
      leaderboard: leaderboard,
    });
    this.forceUpdate();
    //this.console_board();
  }

  componentDidMount() {
    axios.get('http://localhost:5000/leaderboard')
      .then(res => {
        const rankings = res.data.split(';').map((value, index) => {
          let user = value.split(',');
          return { name: user[0], score: user[1] };
        });
        this.update_game(undefined, undefined, undefined, undefined, undefined, undefined, rankings);
      });
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

  check_finished_rows() {
    console.log('checking finished rows');
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
    console.log({ lines_completed: completed_rows });

    // If there are completed rows delete them
    if  (completed_rows > 0) {
      // Finish filling the board with 0s
      for (let y = 0; y < completed_rows; y++) {
        let temp_row = Array(10).fill(0);
        new_board.push(temp_row);
      }

      let new_score = this.get_score(completed_rows);

      //this.console_board(new_board);

      this.update_game(new_score, undefined, undefined, undefined, new_board, undefined);
    }
  }

  update_board(moving_piece, to_white, to_color) {
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

    this.update_game(undefined, undefined, undefined, undefined, new_board, moving_piece);
  }

  // default settings to create any new piece
  // if a type is given that piece will be created
  // else it will create a random piece
  create_piece(type = '') {
    switch(type) {
      case 'o':
        return {
          color: 1,
          type: 'o',
          coordinates: [[4,21],[5,21],[4,20],[5,20]],
        }

      case 'i':
        return {
          color: 2,
          type: 'i',
          coordinates: [[3,20],[4,20],[5,20],[6,20]],
        }
      case 't':
        return {
          color: 3,
          type: 't',
          coordinates: [[4,21],[3,20],[4,20],[5,20]],
        }

      case 'l':
        return {
          color: 4,
          type: 'l',
          coordinates: [[5,21],[3,20],[4,20],[5,20]],
        }

      case 'j':
        return {
          color: 5,
          type: 'j',
          coordinates: [[3,21],[3,20],[4,20],[5,20]],
        }

      case 's':
        return {
          color: 6,
          type: 's',
          coordinates: [[4,21],[5,21],[3,20],[4,20]],
        }

      case 'z':
        return {
          color: 7,
          type: 'z',
          coordinates: [[3,21],[4,21],[4,20],[5,20]],
        }

      default:
        let piece_types = ['o', 'i', 't', 'l', 'j', 's', 'z'];
        let current_type_index = piece_types.indexOf(this.state.moving_piece.type);
        if (current_type_index > -1) {
          piece_types.splice(current_type_index, 1);
        }
        let next_piece = piece_types[Math.floor(Math.random()*piece_types.length)];
        return this.create_piece(next_piece);
    }
  }

  get_object_from_piece(piece) {
    let obj = {};
    for (let coordinates of piece.coordinates) {
      obj[coordinates] = 0;
    }
    return obj;
  }

  generate_new_piece(type = '') {
    let new_piece = this.create_piece(this.state.next_piece);
    let piece_types = ['o','i','t','l','j','s','z'];
    let current_type_index = piece_types.indexOf(this.state.moving_piece.type);
    if (current_type_index > -1) {
      piece_types.splice(current_type_index, 1);
    }

    let next_piece = piece_types[Math.floor(Math.random()*piece_types.length)];

    this.update_game(undefined, next_piece, undefined, false, undefined, new_piece);
    console.log(new_piece);
  }

  delete_piece(piece, board = this.state.board) {
    let x, y;
    let new_board = board.slice();
    for ([x, y] of piece.coordinates) {
      new_board[y][x] = 0;
    }
    return new_board;
  }

  paint_piece(piece, board = this.state.board) {
    let x, y;
    let color = piece.color;
    let new_board = board.slice();
    for ([x, y] of piece.coordinates) {
      new_board[y][x] = color;
    }
    return new_board;
  }

  hold_piece() {
    if (this.state.hold_blocked === false) {
      let current_hold = this.state.hold_piece;
      let old_piece = this.state.moving_piece;
      let type = this.state.moving_piece.type;
      let piece, next_piece, next_piece_type;

      let board = this.delete_piece(old_piece);

      if (current_hold === ' ') {
        console.log('hold and create new');
        piece = this.create_piece(this.state.next_piece);
        console.log(piece);
        next_piece = this.create_piece();
        next_piece_type = next_piece.type;
        console.log(next_piece);
      }
      else {
        console.log('hold and switch');
        piece = this.create_piece(current_hold);
      }
      this.update_game(undefined, next_piece_type, type, true, board, piece);
      console.log(this.state);
    }
    else {
      console.log('you are already holding a piece');
    }
  }

  move_piece(direction) {
    let x, y;
    let to_white = {};
    let to_color = {};
    let new_coords = [];
    let generate_new = false;
    let finished_game = false;

    let type = this.state.moving_piece.type;
    let color = this.state.moving_piece.color;
    let coords = this.state.moving_piece.coordinates;
    let coords_obj = this.get_object_from_piece(this.state.moving_piece);

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
              generate_new = true;
              break;
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
              generate_new = true;
              break;
            }
          }
          else {
            return;
          }
          break;

        case 'drop':
          to_white[[x, y]] = 0;
          to_color[[x, y]] = 0;
          new_coords.push([x,y]);
          break;

        default:
          if (y > 0) {
            to_white[[x, y]] = 0;
            y--;
            to_color[[x, y]] = 0;
            new_coords.push([x,y]);
            if (this.state.board[y][x] !== 0 && !coords_obj.hasOwnProperty([x, y])) {
              console.log('y is: ' + y);
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
    if (generate_new) {
      this.generate_new_piece();
      this.check_finished_rows();
      this.console_board();
    }
    else {
      this.update_board({color: color, type: type, coordinates: new_coords}, to_white, to_color);
    }
    console.log(this.state.finished_game);
    if (finished_game) {
      this.setState({ finished_game: true });
      alert('End match');
    }
  }

  handleKeyPress = (event) => {
    if (!this.state.finished_game) {
      //console.log("key pressed: ");
      //console.log({charCode: event.charCode, key: event.key, keyCode: event.keyCode});

    /* Rotations */
      if (event.keyCode === 82 || event.keyCode === 32) {
        //console.log('ROTATE RIGHT');
        return;
      }
      if (event.keyCode === 88) {
        //console.log('ROTATE LEFT');
        return;
      }
    /* End Rotations */

    /* Movement */
      // MOVE RIGHT
      if (event.keyCode === 65 || event.keyCode === 37) {
        //console.log('MOVE LEFT');
        this.move_piece('left');
        return;
      }
      // MOVE RIGHT
      if (event.keyCode === 68 || event.keyCode === 69 || event.keyCode === 39) {
        //console.log('MOVE RIGHT');
        this.move_piece('right');
        return;
      }
      // MOVE BOTTOM
      if (event.keyCode === 83 || event.keyCode === 79 || event.keyCode === 40) {
        //console.log('MOVE BOTTOM');
        this.move_piece('bottom');
        return;
      }
      // DROP
      if (event.keyCode === 13) {
        //console.log('DROP');
        this.move_piece('drop');
        return;
      }
    /* End Movement */


    /* Hold piece */
      if (event.keyCode === 72 || event.keyCode === 74 || event.keyCode === 16) {
        //console.log('HOLD');
        this.hold_piece();
        return;
      }
    /* End Hold */

    /* Pause */
      if (event.keyCode === 80) {
        //console.log('PAUSE');
        return;
      }
    /* End Pause */
    }
  }

  submit_score () {
    console.log('submit score');
    //this.setState({ finished_game: true, submitted: true });
    console.log('there');
    return;
  }

  render() {
    return (
      <div className="game" onKeyDown={this.handleKeyPress}>
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
            this.state.finished_game ? <button type='button' disabled={this.state.submitted} onClick={this.submit_score}>Submit Score</button> : null
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

