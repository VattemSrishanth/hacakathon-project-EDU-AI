"""
RuralAccess AI - Backend API Server
A Flask-based backend for the educational platform serving rural and disabled learners.
"""

import os
import re
from urllib.parse import urlparse, parse_qs
from xml.etree.ElementTree import ParseError

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from ai_engine import get_ai_response, generate_video_explanation, get_ai_response_payload
from auth import auth_bp
from models import db, User

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

# Load environment variables
try:
    from dotenv import load_dotenv
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()
except ImportError:
    pass

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me-in-production")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'edu_ai.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

# CORS configuration for React frontend
CORS(
    app,
    resources={r"/*": {
        "origins": ["http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173"],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }},
    supports_credentials=True
)

# Initialize database
db.init_app(app)


def init_db():
    """Initialize the database and create tables."""
    with app.app_context():
        db.create_all()
        print("[OK] Database initialized successfully!")


init_db()


# ==================== API Routes ====================

@app.route("/", methods=["GET"])
def root():
    """Root endpoint - API info."""
    return jsonify({
        "name": "RuralAccess AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/*",
            "ask": "/api/ask",
            "explain_video": "/api/explain-video",
            "lessons": "/api/lessons"
        }
    })


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Server is running"})


# ==================== Authentication Routes ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        accessibility_mode = str(data.get("accessibility_mode", "regular")).strip().lower()
        preferred_language = str(data.get("preferred_language", "en")).strip().lower()

        # Validation
        if not name or len(name) < 2:
            return jsonify({"error": "Name must be at least 2 characters.", "success": False}), 400
        
        email_regex = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        if not email_regex.match(email):
            return jsonify({"error": "Invalid email address.", "success": False}), 400
        
        if not password or len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters.", "success": False}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered.", "success": False}), 409

        # Create username from name
        username = name.lower().replace(" ", "_")
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}_{counter}"
            counter += 1

        # Validate accessibility mode
        if accessibility_mode not in {"regular", "deaf", "speech", "normal"}:
            accessibility_mode = "regular"
        if accessibility_mode == "normal":
            accessibility_mode = "regular"

        # Create user
        user = User(
            username=username,
            email=email,
            accessibility_mode=accessibility_mode,
            preferred_language=preferred_language
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user": {
                "id": user.id,
                "name": name,
                "email": user.email,
                "username": user.username
            }
        })
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({"error": "Registration failed. Please try again.", "success": False}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login user."""
    try:
        data = request.get_json() or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({"error": "Email and password required.", "success": False}), 400

        user = User.query.filter(
            (User.email == email) | (User.username == email)
        ).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password.", "success": False}), 401

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": user.to_public_dict(),
            "token": f"mock_token_{user.id}"  # In production, use JWT
        })
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Login failed. Please try again.", "success": False}), 500


@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    """Get current user info from mock token."""
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "", 1).strip()

    if token.startswith("mock_token_"):
        try:
            user_id = int(token.split("mock_token_")[-1])
            user = User.query.get(user_id)
            if user:
                return jsonify({"authenticated": True, "user": user.to_public_dict()})
        except Exception:
            pass

    return jsonify({"authenticated": False, "user": None})


# ==================== AI Tutor Routes ====================

@app.route("/api/ask", methods=["POST"])
def ask():
    """AI tutor question answering endpoint."""
    try:
        data = request.get_json()
        print(f"[DEBUG] Received ask request: {data}")
        if not data:
            print("[DEBUG] No request data received")
            return jsonify({"answer": "No request data", "success": False}), 400
        
        question = str(data.get("question", "")).strip()
        print(f"[DEBUG] Question: {question}")
        if not question or len(question) < 2:
            print("[DEBUG] Question too short or empty")
            return jsonify({"answer": "Please ask a clear question.", "success": False}), 400
        
        # Limit question length
        question = question[:500]
        
        online = bool(data.get("online", True))
        mode = str(data.get("mode", "regular")).lower()
        print(f"[DEBUG] Online: {online}, Mode: {mode}")
        
        if mode not in ["regular", "deaf", "speech", "normal", "concise", "detailed"]:
            mode = "regular"
        if mode == "normal":
            mode = "regular"
        
        result = get_ai_response_payload(question, online, mode)
        print(f"[DEBUG] result status: {result.get('status')}, mode: {result.get('mode')}")

        status = result.get("status", "error")
        answer = (result.get("answer") or "").strip()
        response_mode = result.get("mode", "offline")

        if status == "quota_exceeded":
            print("[DEBUG] Quota exceeded fallback")
            return jsonify({
                "success": True,
                "status": status,
                "answer": answer,
                "mode": response_mode
            }), 200  # Return 200 with quota info

        if not answer:
            print("[DEBUG] No answer generated")
            answer = "Unable to generate answer. Please try again or consult your teacher."
            response_mode = "offline"

        print(f"[DEBUG] Returning success with answer length: {len(answer)}")
        return jsonify({
            "success": True,
            "status": status,
            "answer": answer,
            "mode": response_mode
        })
    
    except Exception as e:
        print(f"[ERROR] Ask error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "answer": "An error occurred. Please try again.",
            "mode": "offline"
        }), 500


@app.route("/api/explain-video", methods=["POST"])
def explain_video():
    """Generate explanation from YouTube video transcript."""
    try:
        data = request.get_json() or {}
        video_url = str(data.get("videoUrl", data.get("video_url", ""))).strip()
        question = str(data.get("question", "")).strip()
        manual_transcript = str(data.get("manualTranscript", "")).strip()
        online = bool(data.get("online", True))
        mode = str(data.get("mode", "regular")).lower()

        if mode not in ["regular", "deaf", "speech", "normal"]:
            mode = "regular"
        if mode == "normal":
            mode = "regular"

        if not video_url and not manual_transcript:
            return jsonify({
                "error": "Please provide a YouTube video link or paste a transcript.",
                "success": False
            }), 400

        if manual_transcript:
            result = generate_video_explanation(
                manual_transcript,
                question=question[:500],
                learner_mode=mode,
                level="basic",
                online=online
            )
            return jsonify({
                "success": True,
                "status": "ok",
                "videoId": "",
                "simpleExplanation": result.get("simple_explanation", ""),
                "keyPoints": result.get("key_points", []),
                "summary": result.get("summary", "")
            })

        video_id = _extract_youtube_id(video_url)
        if not video_id:
            return jsonify({
                "error": "Invalid YouTube URL. Please paste a full video link.",
                "success": False
            }), 400

        transcript_text, transcript_status = _get_transcript_text(video_id)

        if transcript_status != "ok":
            message = _transcript_status_message(transcript_status)
            if question:
                answer = get_ai_response(question[:500], online=online, mode=mode)
                return jsonify({
                    "success": True,
                    "status": "no_transcript",
                    "message": message + " Answered your question instead.",
                    "answer": answer
                })
            return jsonify({
                "success": False,
                "status": "no_transcript",
                "message": message + " Try another video or ask a manual question."
            })

        result = generate_video_explanation(
            transcript_text,
            question=question[:500],
            learner_mode=mode,
            level="basic",
            online=online
        )

        return jsonify({
            "success": True,
            "status": "ok",
            "videoId": video_id,
            "simpleExplanation": result.get("simple_explanation", ""),
            "keyPoints": result.get("key_points", []),
            "summary": result.get("summary", "")
        })
    except Exception as e:
        print(f"Explain video error: {e}")
        return jsonify({
            "success": False,
            "status": "error",
            "error": "Unable to process this video. Please try again."
        }), 500


# ==================== Lessons Routes ====================

# Sample lessons data (in production, this would come from database)
LESSONS = [
    {
        "id": "1",
        "title": "Introduction to Mathematics",
        "description": "Learn the basics of mathematics including numbers, operations, and problem-solving techniques.",
        "duration": "30 mins",
        "level": "Beginner",
        "category": "Mathematics",
        "topics": ["Numbers", "Addition", "Subtraction", "Multiplication"]
    },
    {
        "id": "2",
        "title": "Basic Science Concepts",
        "description": "Understanding fundamental science concepts like matter, energy, and living things.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "Science",
        "topics": ["Matter", "Energy", "Plants", "Animals"]
    },
    {
        "id": "3",
        "title": "English Grammar Fundamentals",
        "description": "Master the basics of English grammar including parts of speech and sentence structure.",
        "duration": "40 mins",
        "level": "Intermediate",
        "category": "English",
        "topics": ["Nouns", "Verbs", "Sentences", "Punctuation"]
    },
    {
        "id": "4",
        "title": "Computer Basics",
        "description": "Introduction to computers, hardware, software, and basic operations.",
        "duration": "35 mins",
        "level": "Beginner",
        "category": "Computer Science",
        "topics": ["Hardware", "Software", "Internet", "Typing"]
    },
    {
        "id": "5",
        "title": "Fractions and Decimals",
        "description": "Learn about fractions, decimals, and how to convert between them.",
        "duration": "50 mins",
        "level": "Intermediate",
        "category": "Mathematics",
        "topics": ["Fractions", "Decimals", "Percentages"]
    },
    {
        "id": "6",
        "title": "The Solar System",
        "description": "Explore our solar system, planets, moons, and celestial bodies.",
        "duration": "55 mins",
        "level": "Intermediate",
        "category": "Science",
        "topics": ["Planets", "Sun", "Moon", "Space"]
    },
    {
        "id": "7",
        "title": "Reading Comprehension",
        "description": "Improve your reading skills and learn to understand written texts better.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "English",
        "topics": ["Reading", "Vocabulary", "Comprehension"]
    },
    {
        "id": "8",
        "title": "Introduction to Programming",
        "description": "Learn the basics of programming with simple examples and concepts.",
        "duration": "60 mins",
        "level": "Intermediate",
        "category": "Computer Science",
        "topics": ["Logic", "Variables", "Loops", "Conditions"]
    }
]


@app.route("/api/lessons", methods=["GET"])
def get_lessons():
    """Get all available lessons."""
    category = request.args.get("category", "").strip()
    level = request.args.get("level", "").strip()
    
    filtered = LESSONS
    
    if category:
        filtered = [l for l in filtered if l["category"].lower() == category.lower()]
    if level:
        filtered = [l for l in filtered if l["level"].lower() == level.lower()]
    
    return jsonify({
        "success": True,
        "lessons": filtered,
        "total": len(filtered)
    })


@app.route("/api/lessons/<lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    """Get a specific lesson by ID."""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    
    if not lesson:
        return jsonify({"error": "Lesson not found", "success": False}), 404
    
    return jsonify({
        "success": True,
        "lesson": lesson
    })


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Get all lesson categories."""
    categories = list(set(l["category"] for l in LESSONS))
    return jsonify({
        "success": True,
        "categories": sorted(categories)
    })


# ==================== User Progress Routes ====================

@app.route("/api/progress", methods=["GET"])
def get_progress():
    """Get user learning progress (placeholder)."""
    # In production, this would fetch from database based on user session
    return jsonify({
        "success": True,
        "progress": {
            "lessonsCompleted": 3,
            "totalLessons": len(LESSONS),
            "questionsAsked": 15,
            "streakDays": 5,
            "lastActivity": "2026-01-23"
        }
    })


# ==================== Helper Functions ====================

def _extract_youtube_id(url):
    """Extract YouTube video ID from a URL."""
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        if parsed.hostname in {"youtu.be"}:
            return parsed.path.lstrip("/")
        if parsed.hostname and "youtube.com" in parsed.hostname:
            if parsed.path == "/watch":
                return parse_qs(parsed.query).get("v", [""])[0]
            if parsed.path.startswith("/embed/"):
                return parsed.path.split("/embed/")[-1]
            if parsed.path.startswith("/shorts/"):
                return parsed.path.split("/shorts/")[-1]
    except Exception:
        return ""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def _get_transcript_text(video_id):
    """Fetch transcript text from YouTube."""
    if not YouTubeTranscriptApi:
        return "", "unavailable"

    try:
        transcript = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=["en", "en-US", "en-GB"]
        )
        text = " ".join([item.get("text", "") for item in transcript if item.get("text")])
        return text.strip(), "ok" if text.strip() else "empty"
    except (TranscriptsDisabled, NoTranscriptFound):
        return "", "no_transcript"
    except VideoUnavailable:
        return "", "video_unavailable"
    except ParseError:
        return "", "consent_required"
    except Exception:
        return "", "error"


def _transcript_status_message(status):
    """Get human-readable message for transcript status."""
    messages = {
        "unavailable": "Transcript service is unavailable right now.",
        "no_transcript": "Transcript not available for this video.",
        "empty": "Transcript was empty for this video.",
        "video_unavailable": "This video is unavailable in your region or is private.",
        "consent_required": "YouTube consent blocked the transcript request.",
        "error": "Unable to fetch transcript at the moment."
    }
    return messages.get(status, "Transcript not available for this video.")


# ==================== Main Entry Point ====================

if __name__ == "__main__":
    print("\n" + "="*50)
    print("RuralAccess AI Backend Server")
    print("="*50)
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"Server: http://127.0.0.1:5000")
    print(f"API Docs: http://127.0.0.1:5000/")
    print("="*50 + "\n")
    
    # Run on all interfaces to avoid localhost resolution issues
    app.run(host="0.0.0.0", port=5000, debug=False)
