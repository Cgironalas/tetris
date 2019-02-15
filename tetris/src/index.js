import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// A block of the board, considered as a 1x1 within the board.
function Block(props) {
  return (
    <button className={`block color${props.color}`}>
      {props.x}-{props.y}
    </button>
  );
}

// A row from the board, 20 will be shown, each one 10 blocks wide.
class Row extends React.Component {
  render_block(i) {
    return (
      <Block
        y={this.props.height}
        x={i}
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
        height={i}
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
      score: 0,
      next_piece: 'i',
      board: Array(21).fill(
        Array(10).fill(0)
      ),
      moving_piece: {
        color: 2,
        type: 'i',
        coordinates: [[5, 10],[6,10],[7,10],[8,10]],
      },
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

  update_game(
    score = this.state.score,
    next_piece = this.state.next_piece,
    board = this.state.board,
    moving_piece = this.state.moving_piece
  ) {
    this.setState({
      score: score,
      next_piece: next_piece,
      board: board.slice(),
      moving_piece: {
        color: moving_piece.color,
        type: moving_piece.type,
        coordinates: moving_piece.coordinates,
      },
    });
    this.forceUpdate();
    this.console_board();
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

      this.console_board(new_board);

      this.update_game(new_score, undefined, new_board);
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

    this.update_game(undefined, undefined, new_board, moving_piece);
  }

  // default settings to create any new piece
  create_piece(type) {
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
        break;
    }
  }

  get_object_from_piece(piece) {
    let obj = {};
    for (let coordinates of piece.coordinates) {
      obj[coordinates] = 0;
    }
    return obj;
  }

  generate_random_piece() {
    this.check_finished_rows();
    this.console_board();
    let piece_types = ['o','i','t','l','j','s','z'];
    let current_type_index = piece_types.indexOf(this.state.moving_piece.type);
    if (current_type_index > -1) {
      piece_types.splice(current_type_index, 1);
    }

    let type = piece_types[Math.floor(Math.random()*piece_types.length)];
    let new_piece = this.create_piece(type);
    console.log(new_piece);

    this.update_game(undefined, undefined, undefined, new_piece);
  }

  move_piece(direction) {
    let x, y;
    let to_white = {};
    let to_color = {};
    let new_coords = [];
    let generate_new = false;

    let color = this.state.moving_piece.color;
    let type = this.state.moving_piece.color;
    let coords = this.state.moving_piece.coordinates;
    let coords_obj = this.get_object_from_piece(this.state.moving_piece);

    for (let pair of coords) {
      x = pair[0];
      y = pair[1];

      switch(direction) {
        case 'left':
          if (x > 0) {
            to_white[[x, y]] = 0;
            x--;
            to_color[[x, y]] = 0;
            new_coords.push([x,y]);
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
              generate_new = true;
              break;
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
      this.generate_random_piece();
    }
    else {
      this.update_board({color: color, type: type, coordinates: new_coords}, to_white, to_color);
    }
  }

  handleKeyPress = (event) => {
    //console.log("key pressed: ");
    //console.log({charCode: event.charCode, key: event.key, keyCode: event.keyCode});

    // DROP
    if (event.keyCode === 13) {
      //console.log('DROP');
      this.move_piece('drop');
      return;
    }

    // Rotations
    if (event.keyCode === 82 || event.keyCode === 32) {
      //console.log('ROTATE RIGHT');
      this.generate_random_piece();
      return;
    }
    if (event.keyCode === 88) {
      //console.log('ROTATE LEFT');
      return;
    }

    // Pause
    if (event.keyCode === 80) {
      //console.log('PAUSE');
      return;
    }

    // Movement
    if (event.keyCode === 65 || event.keyCode === 37) {
      //console.log('MOVE LEFT');
      this.move_piece('left');
      return;
    }
    if (event.keyCode === 68 || event.keyCode === 69 || event.keyCode === 39) {
      //console.log('MOVE RIGHT');
      this.move_piece('right');
      return;
    }
    if (event.keyCode === 83 || event.keyCode === 79 || event.keyCode === 40) {
      //console.log('MOVE BOTTOM');
      this.move_piece('bottom');
      return;
    }

    // Hold piece
    if (event.keyCode === 72 || event.keycode === 74) {
      //console.log('HOLD');
      return;
    }
  }

  render() {
    const leaderboard = "";
    return (
      <div className="game" onKeyDown={this.handleKeyPress}>
        <div className="game-board">
          <Board rows={this.state.board} />
        </div>
        <div className="game-info">
          <div>Score</div>
          <div>{this.state.score}</div>
          <div>Next Piece</div>
          <div>{this.state.nextPiece}</div>
          <div>Leaderboard</div>
          <div>{leaderboard}</div>
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

