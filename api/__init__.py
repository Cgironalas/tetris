from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy

POSTGRES_USER = "tetris_user"
POSTGRES_PW = "tetris_pass"
POSTGRES_URL = "0.0.0.0:5555"
POSTGRES_DB = "tetris"

app = Flask(__name__, instance_relative_config=True)

DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(user=POSTGRES_USER,pw=POSTGRES_PW,url=POSTGRES_URL,db=POSTGRES_DB)
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=False, nullable=False)
    score = db.Column(db.Integer, unique=False, nullable=False)

    def __repr__(self):
        return '%s,%s' % (self.name, self.score)

@app.after_request
def apply_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/<string:name>/<int:score>/register', methods=('GET', 'POST'))
def register(name, score):
    error = None

    if not name:
        error = 'A name should be sent.'
    elif not score:
        error = 'A score should be sent.'

    if error is None:
        new_registry = Leaderboard(name=name, score=score)
        db.session.add(new_registry)
        db.session.commit()
        return 'Added to Leaderboard'

    flash(error)
    return 'There was an error with the request.'

@app.route('/leaderboard', methods=('GET', 'POST'))
def leaderboard():
    posts = Leaderboard.query.limit(10).all()
    print(posts)
    posts_string = ';'.join('{},{}'.format(ranker.name, ranker.score) for ranker in posts)
    return posts_string

@app.route('/')
def index():
    return 'Flask API Running'
