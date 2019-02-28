.PHONY: api
api:
	@docker build --tag=tetris_api:latest api

.PHONY: db
db:
	@docker build --tag=tetris_db:latest db

.PHONY: game
game:
	@docker build --tag=tetris_game:latest tetris

.PHONY: build
build: api db game
	@echo "Building all containers."

.PHONY: run
run: build
	@docker-compose -f tetris.yml up


.PHONY: api_hub
api_hub:
	@docker build --tag=cgironalas/tetris_api:latest api

.PHONY: db_hub
db_hub:
	@docker build --tag=cgironalas/tetris_db:latest db

.PHONY: game_hub
game_hub:
	@docker build --tag=cgironalas/tetris_game:latest tetris

.PHONY: build_hub
build_hub: api_hub db_hub game_hub
	@echo "Building all containers under cgironalas docker hub user."

.PHONY: run_hub
run_hub:
	@docker-compose up
