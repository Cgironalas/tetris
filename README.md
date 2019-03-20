## General info

This is a git for a tetris game made on react that stores high scores on a
PostgreSQL database. They connect through a Flask based API.

The recommended method to run this project is with docker and docker-compose.

To run the latest stable version of all of the components, available on docker
hub, run: `make run_hub` or `docker-compose up`.


#### Docker environments

To run the game components from the source code there are two environments, a
**dev** and **deployment** environmnet. The main difference being that the dev
environment allows for hot reloading from code changes for both the front-end
(React) component and for the back-end (Python/Flask) component.

##### DEVELOPMENT

To **run** the game and all its componenst **from the source code with hot reload**
run: `make run_dev` or `docker-compose -f dev.yml up`.
This will build and run the necessary containers. You can add a `-d` at the end
of the docker-compose command to detach the run from the terminal if necessary.

If you preffer to run containers, with hot reload, individually or in a
different way you can build them all at once from source with `make build_dev`.
Or to build individual components use one of the following:
* _Nginx_: `make nginx`.
* _Database_: `make db`.
* _Backe-end_: `make api_dev`.
* _Front-end_: `make game_dev`.


##### DEPLOYMENT

To **run** the game and all its components **from the source code without hot reload**
run: `make run` or `docker-compose -f deploy.yml up`.
This commands will build and run the deployment version of the source code,
which **should have better performance** than the dev version, but may not be as
useful for debugging errors. You can add a `-d` at the end of the
docker-compose command to detach the run from the terminal if necessary.

If you preffer to run components individually or in a different way you can
build the deployment version for all off them with `make build`.
To build individual components use one of the following:
* _Nginx_: `make nginx`.
* _Database_: `make db`.
* _Backe-end_: `make api`.
* _Front-end_: `make game`.


##### Individual containers

It is recommended to run the containers with docker-compose through any of the
.yml files available or with the different `make run` variations because the
source code calls the docker-compose and/or nginx proxy internal IPs.
Thus by running any container individually the functionality will be limited
unless the code is changed to use localhost as IP with the respective exposed
ports for each component.

To run the **API** (back-end) docker image as a standalone run:
`docker run -p 5555:5000 tetris_api:latest` if you built the deployment version or
`docker run -p 5555:5000 tetris_api_dev:latest` if you built the dev version.

To run the **Game** (front-end) docker image as a standalone run:
`docker run -p 3333:3000 tetris_game:latest` if you built the deployment version or
`docker run -p 3333:3000 tetris_game_dev:latest` if you built the dev version.

To run the **Database** docker image as a standalone run:
`docker run -p 5678:5432 tetris_db:latest` if you built the deployment version or
`docker run -p 5678:5432 tetris_db:latest` if you built the dev version.


#### Running components locally

The same issues as the previous section apply for connectivity between
components if run locally.
The instructions will emulate running de docker dev environment of the
necessary components.

To run the **API** (back-end) locally:
* Go to the /api directory within the repository.
* It is recommended to create and use a python virtual environment within the
/api directory.
* Run `pip install poetry`.
* Run `poetry install`, optionally add `--no-dev`.
* Create a environment variable named `FLASK_APP` whith the path to the
/api directory.
  * From the repository directory `export FLASK_APP=./api` in linux.
* Run `flask run`.

To run the **Game** (front-end) locally:
* Go to the /tetris directory within the repository.
* Run `npm install`.
* Run `npm start`.

To run the **Database** in a local postgres:
The values for the following steps are recommended to avoid doing as many
changes as possible in the source code.
* Create a postgres user named `tetris_user` with the password `tetris_pass`.
* Create a database called `tetris`.
  * Optionally use whatever values you prefer but make sure to change the file
  `/api/config.py` accordingly.
* Within the created database run the sql script found in `db/postgres.sql`.

#### Connecting the components outside of docker-compose

The API is the only component that connects to the Database. To change the IP
and port used by the database go to `/api/config.py` and change the `POSTGRES_URL`
variable.

The Game is the only component that connects to the API to change the IP and 
port used by the API go to `/tetris/constants.js` and change the `API_URL`
variable. In this case you also need to change the `/api/__init__.py` to add a
workaround to the CORS issue. For that add the following lines before the
first 'route' declaration in the code.
`@API_BLUEPRINT.after_request`
`def apply_cors(response: Response) -> Response:`
`    response.headers['Access-Control-Allow-Origin'] = '*'`
`    return response`
