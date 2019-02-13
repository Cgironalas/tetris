## Tetris in REACT

### GAME

#### UI

**Left side:**
* Piece on hold.
* Scoreboard (auto refreshed upon DB update).
**Middle:**
* Possibly current score.
* Game board.
**Right side:**
* Current score.
* Next one or two pieces to come (randomly chosen each time).
* Level #.

#### Controls

Key binds
* Enter to drop.
* P to pause.
* Simple mode:
  * R/Spacebar to rotate right.
  * Shift + R to rotate left.
* Advanced mode:
  * Arrow keys or ,aoe to change to given position.
    * These are set in advance, they don't rotate.
  * ENTER to drop.
  * Shift to hold.

### Docker

Containers:
* Webserver with Flask
* MySQL DB.
* One for the React page.

### Score system

Score:
* By mode:
  * Time trial (speed constantly increases): time survived.
  * Adventure (level/speed increases every 10 lines filled):
    * Each line gives: level * column * 100 score.
    * x1.25 multiplier per extra line (applies to all line).

### Makefile

To pull and initiate the dockers?
