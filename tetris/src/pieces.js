import React from 'react'

import {
  PIECE_TYPES, PIECE_O, PIECE_I, PIECE_T, PIECE_L, PIECE_J, PIECE_S, PIECE_Z,
} from './constants'


class Piece extends React.Component{
  // Will return an object with the piece coords where the keys will be
  // [x, y] as a string and the values all 0s.
  static getCoordsObject = (piece) => {
    const coordsSet = new Set(piece.coords.map(([x,y]) => (
      String(x)+','+String(y)
    )))
    return coordsSet
  }

  // Will return the string character to be used for the next piece.
  static generateNextPieceType = () => {
    return PIECE_TYPES[Math.floor(Math.random()*PIECE_TYPES.length)]
  }

  // Default settings to create any new piece.
  // if a type is given that piece will be created
  // else it will create a random piece
  static getPiece = (type = '') => {
    switch(type) {
      case PIECE_O:
        return {
          color: 1,
          type: PIECE_O,
          rotation: 0,
          rotations: [[0, 0]],
          coords: [[4, 21], [5, 21], [4, 20], [5, 20]],
        }

      case PIECE_I:
        return {
          color: 2,
          type: PIECE_I,
          rotation: 0,
          rotations: [
            [[-1,  2], [ 0,  1], [ 1,  0], [ 2, -1]],
            [[ 2,  1], [ 1,  0], [ 0, -1], [-1, -2]],
            [[ 1, -2], [ 0, -1], [-1,  0], [-2,  1]],
            [[-2, -1], [-1,  0], [ 0,  1], [ 1,  2]]
          ],
          coords: [[3, 20], [4, 20], [5, 20], [6, 20]],
        }

      case PIECE_T:
        return {
          color: 3,
          type: PIECE_T,
          rotation: 0,
          rotations: [
            [[ 1,  1], [-1,  1], [0, 0], [ 1, -1]],
            [[ 1, -1], [ 1,  1], [0, 0], [-1, -1]],
            [[-1, -1], [ 1, -1], [0, 0], [-1,  1]],
            [[-1,  1], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[4, 21], [3, 20], [4, 20], [5, 20]],
        }

      case PIECE_L:
        return {
          color: 4,
          type: PIECE_L,
          rotation: 0,
          rotations: [
            [[ 2,  0], [-1,  1], [0, 0], [ 1, -1]],
            [[ 0, -2], [ 1,  1], [0, 0], [-1, -1]],
            [[-2,  0], [ 1, -1], [0, 0], [-1,  1]],
            [[ 0,  2], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[5, 21], [3, 20], [4, 20], [5, 20]],
        }

      case PIECE_J:
        return {
          color: 5,
          type: PIECE_J,
          rotation: 0,
          rotations: [
            [[ 0,  2], [-1,  1], [0, 0], [ 1, -1]],
            [[ 2,  0], [ 1,  1], [0, 0], [-1, -1]],
            [[ 0, -2], [ 1, -1], [0, 0], [-1,  1]],
            [[-2,  0], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[3, 21], [3, 20], [4, 20], [5, 20]],
        }

      case PIECE_S:
        return {
          color: 6,
          type: PIECE_S,
          rotation: 0,
          rotations: [
            [[ 1,  1], [ 2,  0], [-1,  1], [0, 0]],
            [[ 1, -1], [ 0, -2], [ 1,  1], [0, 0]],
            [[-1, -1], [-2,  0], [ 1, -1], [0, 0]],
            [[-1,  1], [ 0,  2], [-1, -1], [0, 0]]
          ],
          coords: [[4, 21], [5, 21], [3, 20], [4, 20]],
        }

      case PIECE_Z:
        return {
          color: 7,
          type: PIECE_Z,
          rotation: 0,
          rotations: [
            [[ 0,  2], [ 1,  1], [0, 0], [ 1, -1]],
            [[ 2,  0], [ 1, -1], [0, 0], [-1, -1]],
            [[ 0, -2], [-1, -1], [0, 0], [-1,  1]],
            [[-2,  0], [-1,  1], [0, 0], [ 1,  1]]
          ],
          coords: [[3, 21], [4, 21], [4, 20], [5, 20]],
        }

      default://random piece
        const nextPiece = Piece.generateNextPieceType()
        return Piece.getPiece(nextPiece)
    }
  }
}

export default Piece
