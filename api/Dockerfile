FROM python:3.7-slim-stretch

WORKDIR /usr/api

COPY . .

RUN pip install Flask psycopg2-binary flask-sqlalchemy

EXPOSE 5000

ENV FLASK_APP /usr/api
ENV FLASK_ENV development

CMD ["flask", "run", "--host=0.0.0.0"]
