import sqlite3

DATABASE = "database.db"


def get_db():

    conn = sqlite3.connect(DATABASE, check_same_thread=False)

    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA foreign_keys = ON")

    return conn


def init_db():

    conn = get_db()
    cur = conn.cursor()

    # ================= USERS TABLE =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        joined TEXT NOT NULL
    )
    """)

    # ================= QUIZ RESULTS TABLE =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS quiz_results(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # ================= INDEX FOR PERFORMANCE =================
    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_user_quiz
    ON quiz_results(user_id)
    """)

    conn.commit()
    conn.close()
