import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Block(props) {
  return (
    <label className={
      "block color" + (props.color)
    }>
      {props.color}
    </label>
  );
}

class Row extends React.Component {
  renderBlock(i) {
    return (
      <div>
        <label>{this.props.blocks[i]}</label>
        <Block
          color={this.props.blocks[i]}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="board-row">
        {this.renderBlock(0)}
        {this.renderBlock(1)}
        {this.renderBlock(2)}
        {this.renderBlock(3)}
        {this.renderBlock(4)}
        {this.renderBlock(5)}
        {this.renderBlock(6)}
        {this.renderBlock(7)}
        {this.renderBlock(0)}
        {this.renderBlock(0)}
      </div>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: Array(20).fill(
        {
          blocks: Array(10).fill(0),
        }
      ),
    };
  }

  renderRow(i) {
    return (
      <Row
        height={i}
        blocks={this.state.rows[i]}
      />
    );
  }

  render() {
    const theRows = this.state.rows;

    return (
      <div className="board">
        {this.renderRow(19)}
        {this.renderRow(18)}
        {this.renderRow(17)}
        {this.renderRow(16)}
        {this.renderRow(15)}
        {this.renderRow(14)}
        {this.renderRow(13)}
        {this.renderRow(12)}
        {this.renderRow(11)}
        {this.renderRow(10)}
        {this.renderRow(9)}
        {this.renderRow(8)}
        {this.renderRow(7)}
        {this.renderRow(6)}
        {this.renderRow(5)}
        {this.renderRow(4)}
        {this.renderRow(3)}
        {this.renderRow(2)}
        {this.renderRow(1)}
        {this.renderRow(0)}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{ 1 }</div>
          <ol>{ 2 }</ol>
          <ol>{ 3 }</ol>
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

