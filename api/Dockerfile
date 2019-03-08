FROM python:3.7-slim-stretch

WORKDIR /usr/api

COPY *.py ./
COPY pyproject.toml .
COPY poetry.lock .

RUN pip install -U pip
RUN pip install -U poetry
RUN poetry config settings.virtualenvs.create false
RUN poetry install --no-dev

EXPOSE 5000

ENV FLASK_APP /usr/api
ENV FLASK_ENV development

CMD ["flask", "run", "--host=0.0.0.0"]
