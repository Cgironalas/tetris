import React from 'react'
import Block from './Block'

const Row = props => (
  <div className="board-row">
    {
      props.blocks.map((item, index) => (
        <Block color={item} key={index} />
      ))
    }
  </div>
)
export default Row
