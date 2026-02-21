import re

from flask import Blueprint, jsonify, request, session
from models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,30}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@auth_bp.route("/signup", methods=["POST"])
@auth_bp.route("/register", methods=["POST"])
def signup():
    try:
        data = request.get_json() or {}
        # Support both 'username' and 'name' for frontend compatibility
        username = str(data.get("username") or data.get("name") or "").strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        role = str(data.get("role", "student")).strip().lower()
        accessibility_mode = str(data.get("accessibility_mode", "regular")).strip().lower()
        preferred_language = str(data.get("preferred_language", "English")).strip()

        if not username or len(username) < 2:
            return jsonify({"error": "Name/Username is too short.", "status": "error"}), 400
        if not EMAIL_RE.match(email):
            return jsonify({"error": "Invalid email format.", "status": "error"}), 400
        if not password or len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters.", "status": "error"}), 400

        if role not in {"student", "teacher", "parent", "admin", "user"}:
            role = "student"

        if accessibility_mode not in {"regular", "deaf", "speech", "blind", "normal"}:
            accessibility_mode = "regular"
        if accessibility_mode == "normal":
            accessibility_mode = "regular"

        # Map display names to codes or just keep display names if that's what frontend uses
        valid_langs = {"English", "Telugu", "Hindi", "Spanish", "French", "en", "hi", "te"}
        if preferred_language not in valid_langs:
            preferred_language = "English"

        role = str(data.get("role", "student")).strip().lower()
        if role not in {"student", "teacher", "parent", "admin", "user"}:
            role = "student"

        if User.find_one({"$or": [{"username": username}, {"email": email}]}):
            return jsonify({"error": "Username or email already exists.", "status": "error"}), 409

        password_hash = User.set_password(password)
        user_data = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "accessibility_mode": accessibility_mode,
            "preferred_language": preferred_language,
            "role": role # Respect role from request
        }
        user_id = User.create(user_data)
        user_doc = User.find_by_id(user_id)

        session["user_id"] = str(user_id)
        session["username"] = username

        return jsonify({"status": "ok", "user": User.to_public_dict(user_doc)})
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"error": f"Signup failed: {str(e)}", "status": "error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        # Support both 'identifier' and 'email' for better frontend compatibility
        identifier = str(data.get("identifier") or data.get("email") or "").strip().lower()
        password = str(data.get("password", ""))

        if not identifier or not password:
            return jsonify({"error": "Email or username and password required.", "status": "error"}), 400

        user = User.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })

        if not user or not User.check_password(user.get("password_hash"), password):
            return jsonify({"error": "Invalid credentials.", "status": "error"}), 401

        if user.get("is_active") is False:
            return jsonify({"error": "Account is disabled. Please contact admin.", "status": "error"}), 403

        session["user_id"] = str(user["_id"])
        session["username"] = user["username"]

        return jsonify({
            "success": True, 
            "status": "ok", 
            "token": f"mock_token_{str(user['_id'])}",
            "user": User.to_public_dict(user)
        })
    except Exception as e:
        print(f"Login error: {e}")
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

    user = User.find_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({"status": "unauthenticated"}), 401

    return jsonify({"status": "ok", "user": User.to_public_dict(user)})
