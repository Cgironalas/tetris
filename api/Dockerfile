FROM python:3.7-slim-stretch

RUN apt-get update && apt-get -y install gcc mono-mcs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/api

COPY pyproject.toml .
COPY poetry.lock .

RUN pip install -U pip
RUN pip install -U poetry
RUN poetry config settings.virtualenvs.create false
RUN poetry install --no-dev

COPY deploy.py .
COPY config.py .
COPY constants.py .

EXPOSE 5000

CMD ["uwsgi", "--socket=0.0.0.0:5000", "--protocol=http", "--module=deploy:APP"]
