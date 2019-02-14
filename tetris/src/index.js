import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Block(props) {
  return (
    <button className={`block color${props.color}`}>
    </button>
  );
}

class Row extends React.Component {
  render_block(i) {
    return (
      <Block
        color={this.props.blocks[i]}
      />
    );
  }

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
  constructor(props) {
    super(props);
    this.state = {
      board: Array(20).fill(
        Array(10).fill(0)
      ),
      moving_piece: {
        // Coordinates are given in x, y
        coordinates: [[5, 10]],
        color: 4,
      }
    }
  }

  render_row() {
    return (
      <Board
        rows={this.state.board}
      />
    );
  }



  move_piece(direction) {
    let i;
    let blocks = this.state.board;
    let piece = this.state.moving_piece;

    for (i = 0; i < piece.coordinates.length; i++) {
      let x = piece.coordinates[i][0];
      let y = piece.coordinates[i][1];
      console.log({ x: x, y: y})

      switch(direction) {
        case 'left':
          if (x > 0) {
            blocks[y][x] = 0;
            blocks[y][x - 1] = piece.color;
            piece.coordinates[i] = [x - 1, y];
          }
          else {
            return;
          }
          break;

        case 'right':
          if (x < 9) {
            blocks[y][x] = 0;
            blocks[y][x + 1] = piece.color;
            piece.coordinates[i] = [x + 1, y];
          }
          else {
            return;
          }
          break;

        case 'drop':
          blocks[y][x] = 0;
          blocks[0][x] = piece.color;
          piece.coordinates[i] = [x, 0];
          break;

        default:
          if (y > 0) {
            blocks[y][x] = 0;
            blocks[y - 1][x] = piece.color;
            piece.coordinates[i] = [x, y - 1];
          }
          else {
            return;
          }
          break;

      }
    }
    this.setState({
      board: blocks,
      moving_piece: piece,
    });
    console.log(this.state.moving_piece);
  }

  handleKeyPress = (event) => {
    //console.log(event.key);

    // DROP
    if (event.key === 'Enter') {
      //console.log('DROP');
      this.move_piece('drop');
      return;
    }

    // Rotations
    if (event.key === 'r' || event.key === ' ') {
      console.log('ROTATE RIGHT');
      return;
    }
    if (event.key === 'R') {
      console.log('ROTATE LEFT');
      return;
    }

    var lowerKey = event.key.toLowerCase()

    // Pause
    if (lowerKey === 'p') {
      console.log('PAUSE');
      return;
    }

    // Movement
    if (lowerKey === 'a') {
      //console.log('MOVE LEFT');
      this.move_piece('left');
      return;
    }
    if (lowerKey === 'd' || lowerKey === 'e') {
      //console.log('MOVE RIGHT');
      this.move_piece('right');
      return;
    }
    if (lowerKey === 's' || lowerKey === 'o') {
      //console.log('MOVE BOTTOM');
      this.move_piece('bottom');
      return;
    }

    // Hold piece
    if (lowerKey === 'h' || lowerKey === 'j') {
      console.log('HOLD');
      return;
    }
  }

  render() {
    const score = 0;
    const nextPiece = 0;
    const leaderboard = "";
    return (
      <div className="game" onKeyPress={this.handleKeyPress}>
        <div className="game-board">
          <Board rows={this.state.board} />
        </div>
        <div className="game-info">
          <div>Score</div>
          <div>{score}</div>
          <div>Next Piece</div>
          <div>{nextPiece}</div>
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

