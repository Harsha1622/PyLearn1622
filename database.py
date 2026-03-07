import sqlite3

DATABASE = "pylearn.db"


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        joined TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS quiz_results(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        total INTEGER,
        date TEXT
    )
    """)

    conn.commit()
    conn.close()
