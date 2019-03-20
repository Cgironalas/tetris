export const API_URL = ''

export const MODAL_ROOT = document.getElementById('modalRoot')

export const ROTATE_RIGHT = new Set([75, 38, 188, 87, 82, 32])
export const ROTATE_LEFT = new Set([88])
export const MOVE_RIGHT = new Set([76, 39, 69, 68])
export const MOVE_LEFT = new Set([72, 37, 65])
export const MOVE_DOWN = new Set([74, 40, 79, 83])
export const PAUSE = new Set([76, 80])
export const HOLD = new Set([16])
export const DROP = new Set([13, 71])

export const CLOSE_MODAL = new Set([27])

export const BOARD_HEIGHT = 23
export const BOARD_WIDTH = 10

export const NO_HOLD = 'Not holding a piece.'
export const NO_NEXT = 'No next piece set.'

export const MINIMUM_TIMER = 100
export const DEFAULT_TIMER = 1000
export const LB_UPDATE_RATE = 30000
export const TIMER_REDUCTION_PER_ROW = 20

export const SCORE_PER_ROW = 500
export const MULTIPLIERS = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 }

export const DOWN = 'down'
export const LEFT = 'left'
export const RIGHT = 'right'

export const O_TETRIMINO = 'O'
export const I_TETRIMINO = 'I'
export const T_TETRIMINO = 'T'
export const L_TETRIMINO = 'L'
export const J_TETRIMINO = 'J'
export const S_TETRIMINO = 'S'
export const Z_TETRIMINO = 'Z'
export const TETRIMINO_TYPES = [O_TETRIMINO, I_TETRIMINO, T_TETRIMINO, L_TETRIMINO, J_TETRIMINO, S_TETRIMINO, Z_TETRIMINO]

export const O_COLOR = 1
export const I_COLOR = 2
export const T_COLOR = 3
export const L_COLOR = 4
export const J_COLOR = 5
export const S_COLOR = 6
export const Z_COLOR = 7

export const EMPTY_COLOR = 0
export const SHADOW_COLOR = 9

export const WALL_KICK_TESTS = {
  '0,1': [[ 0,  0], [-1,  0], [-1,  1], [ 0, -2], [-1, -2]],
  '1,0': [[ 0,  0], [ 1,  0], [ 1, -1], [ 0,  2], [ 1,  2]],
  '1,2': [[ 0,  0], [ 1,  0], [ 1, -1], [ 0,  2], [ 1,  2]],
  '2,1': [[ 0,  0], [-1,  0], [-1,  1], [ 0, -2], [-1, -2]],
  '2,3': [[ 0,  0], [ 1,  0], [ 1,  1], [ 0, -2], [ 1, -2]],
  '3,2': [[ 0,  0], [-1,  0], [-1, -1], [ 0,  2], [-1,  2]],
  '3,0': [[ 0,  0], [-1,  0], [-1, -1], [ 0,  2], [-1,  2]],
  '0,3': [[ 0,  0], [ 1,  0], [ 1,  1], [ 0, -2], [ 1, -2]],
}
export const I_WALL_KICK_TESTS = {
  '0,1': [[ 0,  0], [-2,  0], [ 1,  0], [-2, -1], [ 1,  2]],
  '1,0': [[ 0,  0], [ 2,  0], [-1,  0], [ 2,  1], [-1, -2]],
  '1,2': [[ 0,  0], [-1,  0], [ 2,  0], [-1,  2], [ 2, -1]],
  '2,1': [[ 0,  0], [ 1,  0], [-2,  0], [ 1, -2], [-2,  1]],
  '2,3': [[ 0,  0], [ 2,  0], [-1,  0], [ 2,  1], [-1, -2]],
  '3,2': [[ 0,  0], [-2,  0], [ 1,  0], [-2, -1], [ 1,  2]],
  '3,0': [[ 0,  0], [ 1,  0], [-2,  0], [ 1, -2], [-2,  1]],
  '0,3': [[ 0,  0], [-1,  0], [ 2,  0], [-1,  2], [ 2, -1]],
}
