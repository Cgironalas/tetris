import os

from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    @app.route('/<string:name>/<int:score>/register', methods=('GET', 'POST'))
    def register(name, score):
        dbi = db.get_db()
        error = None

        if not name:
            error = 'A name should be sent.'
        elif not score:
            error = 'A score should be sent.'

        if error is None:
            dbi.execute(
                'INSERT INTO Leaderboard (name, score) VALUES (?, ?)',
                (name, score)
            )
            dbi.commit()
            return 'Added to Leaderboard'

        flash(error)
        return 'There was an error with the request.'

    @app.route('/leaderboard')
    def index():
        dbi = db.get_db()
        posts = dbi.execute(
            'SELECT name, score FROM Leaderboard ORDER BY score DESC'
        ).fetchall()
        posts_string = ';'.join('{},{}'.format(key, val) for key, val in posts)
        return posts_string

    return app
