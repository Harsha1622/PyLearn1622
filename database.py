import sqlite3

DATABASE = "database.db"


# ================= DATABASE CONNECTION =================

def get_db():

    conn = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA foreign_keys = ON")

    return conn


# ================= INITIALIZE DATABASE =================

def init_db():

    with get_db() as conn:

        cur = conn.cursor()

        # USERS TABLE
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            joined TEXT NOT NULL
        )
        """)

        # QUIZ RESULTS TABLE
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

        # INDEX FOR PERFORMANCE
        cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_quiz
        ON quiz_results(user_id)
        """)
