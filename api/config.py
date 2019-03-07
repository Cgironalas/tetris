'''Configuration for the database used by the API.'''

POSTGRES_USER = "tetris_user"
POSTGRES_PW = "tetris_pass"
POSTGRES_URL = "0.0.0.0:5432"
POSTGRES_DB = "tetris"

DB_URI = (
    f'postgresql+psycopg2://'
    f'{POSTGRES_USER}:{POSTGRES_PW}@{POSTGRES_URL}/{POSTGRES_DB}'
)
