'''This is the main file for the tetris API.

It makes calls to the Postgres DB.
'''

import datetime
from typing import Tuple, Any

from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, Blueprint, Response

from .config import DB_URI
from .constants import ERROR_MESSAGE, SUCCESS_MESSAGE

APP = Flask(__name__)
APP.config.update(
    SQLALCHEMY_DATABASE_URI=DB_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

DB = SQLAlchemy(APP)
API_BLUEPRINT = Blueprint('api', __name__, url_prefix='/flask')

class Leaderboard(DB.Model): #type:ignore
    '''SQLAlchemy Leaderboard table model for the API.'''
    id = DB.Column(DB.Integer, primary_key=True) #pylint: disable=no-member
    name = DB.Column(DB.String(50), nullable=False) #pylint: disable=no-member

    score = DB.Column(DB.Integer, nullable=False) #pylint: disable=no-member

    date_time = DB.Column( #pylint: disable=no-member
        DB.TIMESTAMP, #pylint: disable=no-member
        nullable=False,
        default=datetime.datetime.utcnow,
    )

    def __repr__(self) -> str:
        return '%s,%s' % (self.name, self.score)

@API_BLUEPRINT.route('/register', methods=('POST',))
def register() -> Tuple[str, int]:
    name = request.form.get('name')
    score: Any = request.form.get('score')

    if not name:
        error = 'A name should be sent.'
        return jsonify({'message': ERROR_MESSAGE, 'error': error}), 400

    try:
        score = int(float(score))
    except (TypeError, ValueError):
        error = 'A score should be sent.'
        return jsonify({'message': ERROR_MESSAGE, 'error': error}), 400

    new_registry = Leaderboard(name=name, score=score)
    DB.session.add(new_registry) #pylint: disable=no-member
    DB.session.commit() #pylint: disable=no-member

    post_response = {
        'registry': {
            'id': new_registry.id,
            'name': new_registry.name,
            'score': new_registry.score,
            'date_time': new_registry.date_time,
        },
        'message': SUCCESS_MESSAGE,
    }
    return jsonify(post_response), 200

@API_BLUEPRINT.route('/leaderboard', methods=('GET',))
def leaderboard() -> Tuple[str, int]:
    posts = Leaderboard.query.order_by(
        Leaderboard.score.desc(), Leaderboard.name.asc()).limit(10).all()

    # the parens make the post_response a generator
    posts_response = (
        {
            'name': ranker.name,
            'score': ranker.score,
        }
        for ranker in posts
    )
    # by calling list(generator) python iterates through the generator and
    # creates a list with its components
    return jsonify(list(posts_response)), 200

@API_BLUEPRINT.route('/rankings', methods=('GET',))
def rankings() -> Tuple[str, int]:
    ranking = Leaderboard.query.order_by(
        Leaderboard.score.desc(), Leaderboard.name.asc()).all()

    post_response = (
        {
            'id': ranker.id,
            'name': ranker.name,
            'score': ranker.score,
            'date_time': ranker.date_time,
        }
        for ranker in ranking
    )
    return jsonify(list(post_response)), 200

APP.register_blueprint(API_BLUEPRINT)

@APP.route('/')
def index() -> str:
    return 'Flask API Running'
