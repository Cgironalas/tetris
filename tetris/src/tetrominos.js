import React from 'react'

/*  A 'piece will be an object that has the following keys:
 *  color: int,
 *  type: string (char in array ['i', 'o', 's', 'z', 'l', 'j', 't']),
 *  coords: array of 4 arrays where the inner arrays are [x, y] where both
 *    x and y are int.
 *  rotation: int,
 *  rotations:
*/
class Tetromino extends React.component {
/* Piece generation and data functions*/
  // get_coords_object, generate_next_piece_type
  // get_piece and get_new_piece

  // Will return an object with the piece coords where the keys will be
  // [x, y] as a string and the values all 0s.
  static get_coords_object = (piece) => {
    let obj = {}
    for (let coords of piece.coords) {
      obj[coords] = 0
    }
    return obj
  }

  // Will return the string character to be used for the next piece.
  // old name: generate_next_piece_type
  // new name: get_random_piece_type
  static get_random_piece_type = () => {
    // piece_types is hard coded since those are the standard piece types for
    // the tetris game.
    let piece_types = ['o','i','t','l','j','s','z']

    let next_piece_type =
      piece_types[Math.floor(Math.random()*piece_types.length)]
    return next_piece_type
  }

  // Default settings to create any new piece.
  // if a type is given that piece will be created
  // else it will create a random piece
  static get_piece = (type = '') => {
    switch(type) {
      case 'o':
        return {
          color: 1,
          type: 'o',
          rotation: 0,
          rotations: [[0,0]],
          coords: [[4, 21], [5, 21], [4, 20],[5, 20]],
        }

      case 'i':
        return {
          color: 2,
          type: 'i',
          rotation: 0,
          rotations: [
            [[-1,  2], [ 0,  1], [ 1,  0], [ 2, -1]],
            [[ 2,  1], [ 1,  0], [ 0, -1], [-1, -2]],
            [[ 1, -2], [ 0, -1], [-1,  0], [-2,  1]],
            [[-2, -1], [-1,  0], [ 0,  1], [ 1,  2]]
          ],
          coords: [[3,20],[4,20],[5,20],[6,20]],
        }

      case 't':
        return {
          color: 3,
          type: 't',
          rotation: 0,
          rotations: [
            [
              [1, 1], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [1, -1], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [-1, -1], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [-1, 1], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[4,21],[3,20],[4,20],[5,20]],
        }

      case 'l':
        return {
          color: 4,
          type: 'l',
          rotation: 0,
          rotations: [
            [
              [2, 0], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [0, -2], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [-2, 0], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [0, 2], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[5,21],[3,20],[4,20],[5,20]],
        }

      case 'j':
        return {
          color: 5,
          type: 'j',
          rotation: 0,
          rotations: [
            [
              [0, 2], [-1, 1], [0, 0], [1, -1]
            ],
            [
              [2, 0], [1, 1], [0, 0], [-1, -1]
            ],
            [
              [0, -2], [1, -1], [0, 0], [-1, 1]
            ],
            [
              [-2, 0], [-1, -1], [0, 0], [1, 1]
            ]
          ],
          coords: [[3,21],[3,20],[4,20],[5,20]],
        }

      case 's':
        return {
          color: 6,
          type: 's',
          rotation: 0,
          rotations: [
            [
              [1, 1], [2, 0], [-1, 1], [0, 0]
            ],
            [
              [1, -1], [0, -2], [1, 1], [0, 0]
            ],
            [
              [-1, -1], [-2, 0], [1, -1], [0, 0]
            ],
            [
              [-1, 1], [0, 2], [-1, -1], [0, 0]
            ]
          ],
          coords: [[4,21],[5,21],[3,20],[4,20]],
        }

      case 'z':
        return {
          color: 7,
          type: 'z',
          rotation: 0,
          rotations: [
            [
              [0, 2], [1, 1], [0, 0], [1, -1]
            ],
            [
              [2, 0], [1, -1], [0, 0], [-1, -1]
            ],
            [
              [0, -2], [-1, -1], [0, 0], [-1, 1]
            ],
            [
              [-2, 0], [-1, 1], [0, 0], [1, 1]
            ]
          ],
          coords: [[3,21],[4,21],[4,20],[5,20]],
        }

      default://random piece
        let next_piece = 'i'//this.generate_next_piece_type();
        return this.get_piece(next_piece);
    }
  }

  // Will create a new piece based on the type in next_piece and randomly
  // generate a new next_piece type that won't be a repeat of the last one.
  static get_new_piece = (type = '') => {
    let new_piece = this.get_piece(this.state.next_piece);
    let next_piece_type = this.generate_next_piece_type();

    this.setState({
      next_piece: next_piece_type,
      moving_piece: {
        type: new_piece.type,
        color: new_piece.color,
        coords: new_piece.coords,
        rotation: new_piece.rotation,
        rotations: new_piece.rotations,
      },
      hold_blocked: false,
    });
  }
/* End piece generation */
}

export default Tetromino
