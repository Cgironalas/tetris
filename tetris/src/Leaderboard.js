import React from 'react'
import ReactDOM from 'react-dom'

import './leaderboard.css'
import { MODAL_ROOT } from './constants'

class Leaderboard extends React.Component {
  constructor(props) {
    super(props)
    this.element = document.createElement('div')
  }

  componentDidMount() {
    MODAL_ROOT.appendChild(this.element)
  }

  componentWillUnmount() {
    MODAL_ROOT.removeChild(this.element)
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.element,
    )
  }
}

export default Leaderboard
