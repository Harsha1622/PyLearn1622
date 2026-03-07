from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import datetime

app = Flask(__name__)
app.secret_key = "pylearn-secret-key"

CORS(app, supports_credentials=True)

DATABASE = "pylearn.db"


# =========================
# DATABASE CONNECTION
# =========================
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# =========================
# CREATE TABLES
# =========================
def init_db():

    conn = get_db()
    cur = conn.cursor()

    # USERS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        joined TEXT
    )
    """)

    # QUIZ RESULTS TABLE
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


init_db()


# =========================
# SIGNUP
# =========================
@app.route("/signup", methods=["POST"])
def signup():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Missing fields"})

    hashed_password = generate_password_hash(password)

    conn = get_db()
    cur = conn.cursor()

    try:

        cur.execute(
            "INSERT INTO users(name,email,password,joined) VALUES(?,?,?,?)",
            (name, email, hashed_password, str(datetime.date.today()))
        )

        conn.commit()

        return jsonify({"success": True})

    except sqlite3.IntegrityError:

        return jsonify({
            "success": False,
            "message": "Email already exists"
        })


# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()

    user = cur.execute(
        "SELECT * FROM users WHERE email=?",
        (email,)
    ).fetchone()

    if user and check_password_hash(user["password"], password):

        session["user_id"] = user["id"]

        return jsonify({
            "success": True,
            "name": user["name"]
        })

    return jsonify({
        "success": False,
        "message": "Invalid credentials"
    })


# =========================
# DASHBOARD DATA
# =========================
@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    uid = session["user_id"]

    conn = get_db()
    cur = conn.cursor()

    user = cur.execute(
        "SELECT * FROM users WHERE id=?",
        (uid,)
    ).fetchone()

    quizzes = cur.execute(
        "SELECT * FROM quiz_results WHERE user_id=?",
        (uid,)
    ).fetchall()

    quiz_count = len(quizzes)

    avg_score = 0

    if quiz_count > 0:
        avg_score = sum([q["score"] for q in quizzes]) / quiz_count

    return jsonify({
        "name": user["name"],
        "email": user["email"],
        "joined": user["joined"],
        "quizCount": quiz_count,
        "avgScore": round(avg_score, 2)
    })


# =========================
# SAVE QUIZ RESULT
# =========================
@app.route("/save-quiz", methods=["POST"])
def save_quiz():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json

    score = data.get("score")
    total = data.get("total")

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO quiz_results(user_id,score,total,date) VALUES(?,?,?,?)",
        (
            session["user_id"],
            score,
            total,
            str(datetime.date.today())
        )
    )

    conn.commit()

    return jsonify({"success": True})


# =========================
# LOGOUT
# =========================
@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({"success": True})


# =========================
# START SERVER
# =========================
if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
  )
