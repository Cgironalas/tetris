import {
  O_TETRIMINO, O_COLOR, I_TETRIMINO, I_COLOR, T_TETRIMINO, T_COLOR,
  L_TETRIMINO, L_COLOR, J_TETRIMINO, J_COLOR, S_TETRIMINO, S_COLOR,
  Z_TETRIMINO, Z_COLOR,
  TETRIMINO_TYPES, WALL_KICK_TESTS, I_WALL_KICK_TESTS,
} from './constants'

/* Static Tetrimino related functions */
  // Will return a set with the tetrimino coords where the elements will be
  // the string made by 'x,y' of each coordinate.
  export const getTetriminoCoordsSet = (tetrimino) => {
    const coordsSet = new Set(tetrimino.coords.map( ([x, y]) => (
      String(x) + ',' + String(y)
    )))
    return coordsSet
  }

  // Will return a random tetrimino type as a string.
  export const getRandomTetriminoType = () => {
    return TETRIMINO_TYPES[Math.floor(Math.random()*TETRIMINO_TYPES.length)]
  }

  // Default settings for any new tetrimino, based by type.
  // If a type is given that tetrimino will be created,
  // else it will create a random tetrimino.
  export const getTetrimino = (type = '') => {
    switch(type) {
      case O_TETRIMINO:
        return {
          color: O_COLOR,
          type: O_TETRIMINO,
          coords: [[4, 21], [5, 21], [4, 20], [5, 20]],
        }

      case I_TETRIMINO:
        return {
          color: I_COLOR,
          rotation: 0,
          type: I_TETRIMINO,
          wallKickTests: { ...I_WALL_KICK_TESTS },
          rotations: [
            [[-1,  2], [ 0,  1], [ 1,  0], [ 2, -1]],
            [[ 2,  1], [ 1,  0], [ 0, -1], [-1, -2]],
            [[ 1, -2], [ 0, -1], [-1,  0], [-2,  1]],
            [[-2, -1], [-1,  0], [ 0,  1], [ 1,  2]]
          ],
          coords: [[3, 20], [4, 20], [5, 20], [6, 20]],
        }

      case T_TETRIMINO:
        return {
          color: T_COLOR,
          rotation: 0,
          type: T_TETRIMINO,
          wallKickTests: { ...WALL_KICK_TESTS },
          rotations: [
            [[ 1,  1], [-1,  1], [0, 0], [ 1, -1]],
            [[ 1, -1], [ 1,  1], [0, 0], [-1, -1]],
            [[-1, -1], [ 1, -1], [0, 0], [-1,  1]],
            [[-1,  1], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[4, 21], [3, 20], [4, 20], [5, 20]],
        }

      case L_TETRIMINO:
        return {
          color: L_COLOR,
          rotation: 0,
          type: L_TETRIMINO,
          wallKickTests: { ...WALL_KICK_TESTS },
          rotations: [
            [[ 2,  0], [-1,  1], [0, 0], [ 1, -1]],
            [[ 0, -2], [ 1,  1], [0, 0], [-1, -1]],
            [[-2,  0], [ 1, -1], [0, 0], [-1,  1]],
            [[ 0,  2], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[5, 21], [3, 20], [4, 20], [5, 20]],
        }

      case J_TETRIMINO:
        return {
          color: J_COLOR,
          rotation: 0,
          type: J_TETRIMINO,
          wallKickTests: { ...WALL_KICK_TESTS },
          rotations: [
            [[ 0,  2], [-1,  1], [0, 0], [ 1, -1]],
            [[ 2,  0], [ 1,  1], [0, 0], [-1, -1]],
            [[ 0, -2], [ 1, -1], [0, 0], [-1,  1]],
            [[-2,  0], [-1, -1], [0, 0], [ 1,  1]]
          ],
          coords: [[3, 21], [3, 20], [4, 20], [5, 20]],
        }

      case S_TETRIMINO:
        return {
          color: S_COLOR,
          rotation: 0,
          type: S_TETRIMINO,
          wallKickTests: WALL_KICK_TESTS,
          rotations: [
            [[ 1,  1], [ 2,  0], [-1,  1], [0, 0]],
            [[ 1, -1], [ 0, -2], [ 1,  1], [0, 0]],
            [[-1, -1], [-2,  0], [ 1, -1], [0, 0]],
            [[-1,  1], [ 0,  2], [-1, -1], [0, 0]]
          ],
          coords: [[4, 21], [5, 21], [3, 20], [4, 20]],
        }

      case Z_TETRIMINO:
        return {
          color: Z_COLOR,
          rotation: 0,
          type: Z_TETRIMINO,
          wallKickTests: { ...WALL_KICK_TESTS },
          rotations: [
            [[ 0,  2], [ 1,  1], [0, 0], [ 1, -1]],
            [[ 2,  0], [ 1, -1], [0, 0], [-1, -1]],
            [[ 0, -2], [-1, -1], [0, 0], [-1,  1]],
            [[-2,  0], [-1,  1], [0, 0], [ 1,  1]]
          ],
          coords: [[3, 21], [4, 21], [4, 20], [5, 20]],
        }

      default://random tetrimino
        const randomType = getRandomTetriminoType()
        return getTetrimino(randomType)
    }
  }
/* End of Tetrimino related functions*/
