import React from 'react'
import Row from './Row'

const Board = props => (
  <div className="board">
    {
      props.rows.map((item, index) => (
        <Row blocks={props.rows[props.rows.length - index - 1]} key={index} />
      ))
    }
  </div>
)

export default Board
