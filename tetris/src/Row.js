import React from 'react'
import Block from './Block'

// A row from the board, 20 will be shown, each one 10 blocks wide.
class Row extends React.Component {
  render_block(i) {
    return (
      <Block
        color={this.props.blocks[i]}
      />
    )
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
    )
  }
}

export default Row
