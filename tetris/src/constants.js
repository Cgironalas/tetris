export const ROTATE_RIGHT = new Set([75, 38, 188, 87, 32])
export const ROTATE_LEFT = new Set([88])
export const MOVE_RIGHT = new Set([76, 39, 69, 68])
export const MOVE_LEFT = new Set([72, 37, 65])
export const MOVE_DOWN = new Set([74, 40, 79, 83])
export const PAUSE = new Set([76, 80])
export const HOLD = new Set([16])
export const DROP = new Set([13])

export const BOARD_HEIGHT = 23
export const BOARD_WIDTH = 10

export const DEFAULT_TIMER = 1000
export const LB_UPDATE_RATE = 30000

export const SCORE_PER_ROW = 500
export const MULTIPLIERS = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 }

export const DOWN = 'down'
export const LEFT = 'left'
export const RIGHT = 'right'

export const PIECE_O = 'O'
export const PIECE_I = 'I'
export const PIECE_T = 'T'
export const PIECE_L = 'L'
export const PIECE_J = 'J'
export const PIECE_S = 'S'
export const PIECE_Z = 'Z'
export const PIECE_TYPES = [PIECE_O, PIECE_I, PIECE_T, PIECE_L, PIECE_J, PIECE_S, PIECE_Z]

export const SHADOW_COLOR = 9

export const WALL_KICK_TESTS = {
  '0,1': [[0, 0], [-1, 0], [-1,  1], [0, -2], [-1, -2]],
  '1,0': [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
  '1,2': [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
  '2,1': [[0, 0], [-1, 0], [-1,  1], [0, -2], [-1, -2]],
  '2,3': [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
  '3,2': [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
  '3,0': [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
  '0,3': [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
}
export const I_WALL_KICK_TESTS = {
  '0,1': [[0, 0], [-2, 0], [ 1, 0], [-2, -1], [ 1,  2]],
  '1,0': [[0, 0], [ 2, 0], [-1, 0], [ 2,  1], [-1, -2]],
  '1,2': [[0, 0], [-1, 0], [ 2, 0], [-1,  2], [ 2, -1]],
  '2,1': [[0, 0], [ 1, 0], [-2, 0], [ 1, -2], [-2,  1]],
  '2,3': [[0, 0], [ 2, 0], [-1, 0], [ 2,  1], [-1, -2]],
  '3,2': [[0, 0], [-2, 0], [ 1, 0], [-2, -1], [ 1,  2]],
  '3,0': [[0, 0], [ 1, 0], [-2, 0], [ 1, -2], [-2,  1]],
  '0,3': [[0, 0], [-1, 0], [ 2, 0], [-1,  2], [ 2, -1]],
}
