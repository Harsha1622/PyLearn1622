from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db
import datetime
import os
import subprocess


app = Flask(__name__)


# ================= SECURITY =================

app.secret_key = os.getenv("SECRET_KEY", "change-this-secret")

# Server-side session storage
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True

# Cookie settings for HTTPS (Render)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True

Session(app)


# ================= CORS =================

CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://pylearn-8niw.onrender.com",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ]
)


# ================= DATABASE INIT =================

init_db()


# ================= HOME =================

@app.route("/")
def home():
    return render_template("home.html")


# ================= SIGNUP =================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    hashed_password = generate_password_hash(password)

    try:

        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO users(name,email,password,joined) VALUES(?,?,?,?)",
            (name, email, hashed_password, str(datetime.date.today()))
        )

        conn.commit()

        return jsonify({"success": True})

    except Exception:

        return jsonify({
            "success": False,
            "message": "User already exists"
        }), 400


# ================= LOGIN =================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False}), 400

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

    return jsonify({"success": False, "message": "Invalid credentials"}), 401


# ================= DASHBOARD =================

@app.route("/dashboard")
def dashboard():

    uid = session.get("user_id")

    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    cur = conn.cursor()

    user = cur.execute(
        "SELECT name,email,joined FROM users WHERE id=?",
        (uid,)
    ).fetchone()

    quiz_count = cur.execute(
        "SELECT COUNT(*) FROM quiz_results WHERE user_id=?",
        (uid,)
    ).fetchone()[0]

    avg_score = cur.execute(
        "SELECT AVG(score) FROM quiz_results WHERE user_id=?",
        (uid,)
    ).fetchone()[0] or 0


    # ===== TOPIC PROGRESS =====

    try:
        completed_topics = cur.execute(
            "SELECT COUNT(*) FROM completed_topics WHERE user_id=?",
            (uid,)
        ).fetchone()[0]
    except:
        completed_topics = 0

    total_topics = 20


    return jsonify({
        "name": user["name"],
        "email": user["email"],
        "joined": user["joined"],
        "quizCount": quiz_count,
        "avgScore": round(avg_score, 2),
        "completedTopics": completed_topics,
        "totalTopics": total_topics
    })


# ================= SAVE QUIZ =================

@app.route("/save-quiz", methods=["POST"])
def save_quiz():

    uid = session.get("user_id")

    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    score = data.get("score")
    total = data.get("total")

    if score is None or total is None:
        return jsonify({"success": False}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO quiz_results(user_id,score,total,date) VALUES(?,?,?,?)",
        (uid, score, total, str(datetime.date.today()))
    )

    conn.commit()

    return jsonify({"success": True})


# ================= PYTHON COMPILER =================

@app.route("/run", methods=["POST"])
def run_code():

    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"error": "No code provided"}), 400

    try:

        result = subprocess.check_output(
            ["python3", "-c", code],
            stderr=subprocess.STDOUT,
            timeout=5
        ).decode()

        return jsonify({"output": result})

    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.output.decode()})

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Execution timed out"})


# ================= LOGOUT =================

@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({"success": True})


# ================= RUN SERVER =================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
