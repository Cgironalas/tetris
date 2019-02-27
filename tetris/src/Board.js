import React from 'react'
import Row from './Row'

class Board extends React.Component {
  render_row(i) {
    return (
      <Row
        blocks={this.props.rows[i]}
      />
    )
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
    )
  }
}

export default Board
