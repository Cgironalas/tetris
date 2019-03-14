import {
  MULTIPLIERS, SCORE_PER_ROW,
} from './constants'

/* Score related functions **/
  // getMultiplier and getScore

  // Get the score multiplier to use based on completed rows in a turn.
  const getMultiplier = (rowsCompleted) => (
    MULTIPLIERS.hasOwnProperty(rowsCompleted) ? MULTIPLIERS[rowsCompleted] : 0
  )

  // Get the new score based on completed rows in a turn.
  const getTurnPoints = (rowsCompleted) => {
    if (rowsCompleted <= 0) {
      return 0
    }
    else {
      const multiplier = getMultiplier(rowsCompleted)
      return ((rowsCompleted * SCORE_PER_ROW) * multiplier)
    }
  }
/* End score related functions */

export default getTurnPoints
