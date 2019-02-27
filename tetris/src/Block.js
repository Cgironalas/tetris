import React from 'react'

// A block of the board, considered as a 1x1 within the board.
function Block(props) {
  return (
    <button className={`block color${props.color}`}>
    </button>
  )
}

export default Block
