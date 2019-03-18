import React from 'react'

// A block of the board, considered as a 1x1 within the board.
const Block = props => (
  <label className={`block color${props.color}`} />
)

export default Block
