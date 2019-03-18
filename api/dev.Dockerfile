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

ENV FLASK_APP /usr/api
ENV FLASK_ENV development

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
