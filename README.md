This is a git for a tetris game made on react that stores high scores on a
PostgreSQL database. They connect through a Flask based API.

To run the `tetris_api` docker image as a standalone remap port 5000 to any
port of choice like `docker run -p 5000:5000 tetris_api:version`.
* Now also possible to run with:
  `docker run -p 5000:5000 cgironalas/tetris_api:latest`.
