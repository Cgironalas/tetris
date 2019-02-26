FROM python:3.7-slim

WORKDIR /

COPY . /api
COPY ../db /db

RUN pip install Flask

EXPOSE 5000

ENV FLASK_APP api
ENV FLASK_ENV development

RUN flask init-db
CMD ["flask", "run", "--host=0.0.0.0"]
