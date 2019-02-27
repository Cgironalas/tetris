This is a git for a tetris game made on react that stores high scores on a
PostgreSQL database. They connect through a Flask based API.

To run the api and game with one command run:
`docker-compose -f tetris.yml up`

To run the `tetris_api` docker image as a standalone run:
`docker run -p 5000:5000 cgironalas/tetris_api:latest`.
  * To run it from the source code run:
  `docker build --tag=tetris_api .`
  `docker run -p 5000:5000 tetris_api`

To run the `tetris_game` docker image as a standalone run:
`docker run -p 3000:3000 cgironalas/tetris_game:latest`.
  * To run it from the source code run:
  `cd tetris`
  `docker build --tag=tetris_game .`
  `docker run -p 3000:3000 tetris_game`

To run the `tetris_db` docker image as a standalone run:
`docker run -p 5555:5432 cgironalas/tetris_db:latest`.
  * To run it from the source code run and test with psql:
  `cd db`
  `docker build --tag=tetris_db .`
  `docker run -p 5555:5432 tetris_db`
