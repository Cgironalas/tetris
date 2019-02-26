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


DB (postgres) docker:
* Run: `docker run --name tetris_db -e POSTGRES_PASSWORD=tetris_pass -d postgres`
  * This will download and run the postgres container.
* To access the Database use:
`docker run -it --rm --link tetris_db:postgres postgres psql -h postgres -U postgres`

