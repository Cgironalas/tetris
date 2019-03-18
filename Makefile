.PHONY: db
db:
	@docker build --tag=tetris_db:latest db

.PHONY: nginx
nginx:
	@docker build --tag=tetris_proxy:latest nginx



.PHONY: api
api:
	@docker build --tag=tetris_api:latest api

.PHONY: api_dev
api_dev:
	@docker build --tag=tetris_api_dev:latest --file=api/dev.Dockerfile api



.PHONY: deploy_game
deploy_game:
	@npm install --prefix ./tetris && npm run build --prefix ./tetris

.PHONY: game
game: deploy_game
	@docker build --tag=tetris_game:latest tetris

.PHONY: game_dev
game_dev:
	@docker build --tag=tetris_game_dev:latest --file=tetris/dev.Dockerfile tetris



.PHONY: build
build: api db nginx game
	@echo "Building all containers."

.PHONY: run
run:
	@docker-compose -f deploy.yml up



.PHONY: build_dev
build_dev: api_dev db nginx game_dev
	@echo "Building all containers, api and game in dev version."

.PHONY: run_dev
run_dev:
	@docker-compose -f dev.yml up



.PHONY: api_hub
api_hub:
	@docker build --tag=cgironalas/tetris_api:latest api

.PHONY: db_hub
db_hub:
	@docker build --tag=cgironalas/tetris_db:latest db

.PHONY: nginx_hub
nginx_hub:
	@docker build --tag=cgironalas/tetris_proxy:latest nginx

.PHONY: game_hub
game_hub: deploy_game
	@docker build --tag=cgironalas/tetris_game:latest tetris

.PHONY: build_hub
build_hub: api_hub db_hub nginx_hub game_hub
	@echo "Building all containers under cgironalas docker hub user."

.PHONY: run_hub
run_hub:
	@docker-compose up
