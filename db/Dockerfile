FROM postgres:11.2-alpine

COPY postgres.sql /docker-entrypoint-initdb.d

ENV POSTGRES_USER tetris_user
ENV POSTGRES_PASSWORD tetris_pass
ENV POSTGRES_DB tetris

