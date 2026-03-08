from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db
import datetime

app = Flask(__name__)
app.secret_key = "pylearn-secret-key"

CORS(app, supports_credentials=True)

# Initialize database
init_db()


# =========================
# HOME ROUTE (IMPORTANT)
# =========================
@app.route("/")
def home():
    return jsonify({
        "message": "PyLearn backend is running"
    })


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
        return jsonify({
            "success": False,
            "message": "Missing fields"
        }), 400

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

    except:
        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 400


# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Missing email or password"
        }), 400

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
        "message": "Invalid email or password"
    }), 401


# =========================
# DASHBOARD DATA
# =========================
@app.route("/dashboard", methods=["GET"])
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

    if score is None or total is None:
        return jsonify({
            "success": False,
            "message": "Missing quiz data"
        }), 400

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
        host="0.0.0.0",
        port=5000
    )
