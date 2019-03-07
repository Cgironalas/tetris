import datetime

from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, Blueprint

from .config import DB_URI
from .constants import ERROR_MESSAGE, SUCCESS_MESSAGE

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=DB_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

db = SQLAlchemy(app)

api_blueprint = Blueprint('api', __name__, url_prefix='/api')

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date_time = db.Column(
        db.TIMESTAMP,
        nullable=False,
        default=datetime.datetime.utcnow,
    )

    def __repr__(self):
        return '%s,%s' % (self.name, self.score)

@api_blueprint.after_request
def apply_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@api_blueprint.route('/register', methods=('POST',))
def register():
    name = request.form.get('name')
    score = request.form.get('score')

    if not name:
        error = 'A name should be sent.'
        return jsonify({'message': ERROR_MESSAGE, 'error': error}), 400

    try:
        score = int(float(score))
    except (TypeError, ValueError):
        error = 'A score should be sent.'
        return jsonify({'message': ERROR_MESSAGE, 'error': error}), 400

    new_registry = Leaderboard(name=name, score=score)
    db.session.add(new_registry)
    db.session.commit()

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


@api_blueprint.route('/leaderboard', methods=('GET',))
def leaderboard():
    posts = Leaderboard.query.order_by(
        Leaderboard.score.desc()).limit(10).all()

    # the parens make the post_response a generator
    posts_response = (
        {
            'id': ranker.id,
            'name': ranker.name,
            'score': ranker.score,
            'date_time': ranker.date_time
        }
        for ranker in posts
    )
    # by calling list(generator) python iterates through the generator and
    # creates a list with its components
    return jsonify(list(posts_response)), 200

app.register_blueprint(api_blueprint)

@app.route('/')
def index():
    return 'Flask API Running'
