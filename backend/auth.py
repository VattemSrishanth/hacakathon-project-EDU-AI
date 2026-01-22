import re

from flask import Blueprint, jsonify, request, session

from models import db, User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,30}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json() or {}
        username = str(data.get("username", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        accessibility_mode = str(data.get("accessibility_mode", "regular")).strip().lower()
        preferred_language = str(data.get("preferred_language", "en")).strip().lower()

        if not USERNAME_RE.match(username):
            return jsonify({"error": "Invalid username.", "status": "error"}), 400
        if not EMAIL_RE.match(email):
            return jsonify({"error": "Invalid email.", "status": "error"}), 400
        if not password or len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters.", "status": "error"}), 400

        if accessibility_mode not in {"regular", "deaf", "speech", "normal"}:
            accessibility_mode = "regular"
        if accessibility_mode == "normal":
            accessibility_mode = "regular"

        if preferred_language not in {"en", "es", "fr", "sw", "ar", "hi"}:
            preferred_language = "en"

        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({"error": "Username or email already exists.", "status": "error"}), 409

        user = User(
            username=username,
            email=email,
            accessibility_mode=accessibility_mode,
            preferred_language=preferred_language
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id
        session["username"] = user.username

        return jsonify({"status": "ok", "user": user.to_public_dict()})
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Signup failed. Please try again.", "status": "error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        identifier = str(data.get("identifier", "")).strip().lower()
        password = str(data.get("password", ""))

        if not identifier or not password:
            return jsonify({"error": "Email or username and password required.", "status": "error"}), 400

        user = User.query.filter(
            (User.email == identifier) | (User.username == identifier)
        ).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid credentials.", "status": "error"}), 401

        session["user_id"] = user.id
        session["username"] = user.username

        return jsonify({"status": "ok", "user": user.to_public_dict()})
    except Exception:
        return jsonify({"error": "Login failed. Please try again.", "status": "error"}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "ok"})


@auth_bp.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "unauthenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"status": "unauthenticated"}), 401

    return jsonify({"status": "ok", "user": user.to_public_dict()})
