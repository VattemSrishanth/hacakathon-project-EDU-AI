"""
RuralAccess AI - Backend API Server
A Flask-based backend for the educational platform serving rural and disabled learners.
"""

import os
import re
import io
import base64
import json
import time
from functools import wraps
from urllib.parse import urlparse, parse_qs
from xml.etree.ElementTree import ParseError

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo

from ai_engine import get_ai_response, generate_video_explanation, get_ai_response_payload, analyze_image
import unified_llm as llm_service
from auth import auth_bp
import quiz_pipeline
from models import init_mongo_models, User, Profile, Course, Progress, ChatHistory, Assignment, Notification, Feedback

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    try:
        from youtube_transcript_api import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
    except (ImportError, ModuleNotFoundError):
        # Fallback: define exception classes if import fails
        class TranscriptsDisabled(Exception):
            pass
        class NoTranscriptFound(Exception):
            pass
        class VideoUnavailable(Exception):
            pass
except ImportError:
    YouTubeTranscriptApi = None
    class TranscriptsDisabled(Exception):
        pass
    class NoTranscriptFound(Exception):
        pass
    class VideoUnavailable(Exception):
        pass

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "", 1).strip()

        if not token or not token.startswith("mock_token_"):
            return jsonify({"error": "Token is missing or invalid", "success": False}), 401

        try:
            user_id = token.split("mock_token_")[-1]
            current_user = User.find_by_id(user_id)
            if not current_user:
                return jsonify({"error": "User not found", "success": False}), 401
        except Exception as e:
            return jsonify({"error": str(e), "success": False}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def _decode_pdf_base64(pdf_base64: str):
    """Decode base64 data URL or raw base64 string to bytes."""
    if not pdf_base64:
        return None
    try:
        if pdf_base64.startswith('data:') and ',' in pdf_base64:
            pdf_base64 = pdf_base64.split(',', 1)[1]
        return base64.b64decode(pdf_base64)
    except Exception as exc:
        print(f"[quiz] Failed to decode base64 PDF: {exc}")
        return None


def _extract_pdf_text_from_bytes(pdf_bytes: bytes):
    """Extract text from PDF bytes using PyPDF2 if available."""
    if not pdf_bytes:
        return ""
    if PyPDF2 is None:
        print("[quiz] PyPDF2 not installed; cannot extract PDF text")
        return ""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return "\n".join(pages)
    except Exception as exc:
        print(f"[quiz] Failed to read PDF bytes: {exc}")
        return ""


def _split_text_into_chunks(text: str, chunk_size: int = 4000, overlap: int = 200):
    """
    Split text into overlapping chunks to stay within API limits.
    
    Args:
        text: The full text to split
        chunk_size: Maximum characters per chunk (default 4000)
        overlap: Characters to overlap between chunks for context continuity
    
    Returns:
        List of text chunks
    """
    if not text:
        return []
    
    # Clean text - remove excessive whitespace
    text = ' '.join(text.split())
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        # Calculate end position
        end = start + chunk_size
        
        # If not the last chunk, try to break at a sentence boundary
        if end < len(text):
            # Look for sentence endings (.!?) within the last 200 chars of chunk
            search_start = max(start, end - 200)
            last_period = text.rfind('.', search_start, end)
            last_question = text.rfind('?', search_start, end)
            last_exclaim = text.rfind('!', search_start, end)
            
            # Find the latest sentence boundary
            break_point = max(last_period, last_question, last_exclaim)
            
            if break_point > start:
                end = break_point + 1  # Include the punctuation
        
        # Extract chunk and add to list
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position (with overlap for context)
        start = end - overlap if end < len(text) else end
    
    return chunks


def _generate_quiz_from_chunk(chunk_text: str, chunk_index: int, total_chunks: int, 
                               questions_to_generate: list, language: str, pdf_name: str, seen_concepts: list):
    """
    Generate specific types of questions from a text chunk.
    questions_to_generate: list of types like ['mcq', 'short']
    """
    types_str = ", ".join(questions_to_generate)
    prompt = (
        f"You are an exam-grade quiz generation engine. System Role: Generate quizzes from PDF text.\n"
        f"Document: {pdf_name}\n"
        f"Processing Chunk {chunk_index + 1} of {total_chunks}.\n\n"
        f"TASK:\n"
        f"1. Extract 2-3 high-quality exam-relevant concepts from the text below.\n"
        f"2. Check if these concepts overlap with existing concepts: {seen_concepts}\n"
        f"3. Generate exactly {len(questions_to_generate)} questions of the following types: {types_str}\n"
        f"4. Difficulty target for these questions should be a mix of Easy, Medium, or Hard (derived from content).\n"
        "5. Ensure questions are strictly derived from the provided text.\n\n"
        "STRICT JSON OUTPUT FORMAT (NO MARKDOWN, NO EMOJIS):\n"
        "{\"concepts\": [\"concept1\", \"concept2\"], \"questions\": ["
        "{\"type\": \"mcq\", \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_answer\": \"...\", \"explanation\": \"...\"},"
        "{\"type\": \"short\", \"question\": \"...\", \"correct_answer\": \"...\", \"explanation\": \"...\"}"
        "]}\n\n"
        f"TEXT CONTENT:\n{chunk_text}"
    )
    
    try:
        llm_response, error_code = llm_service.generate_text(
            prompt, 
            temperature=0.4, 
            max_output_tokens=1000
        )
        
        if error_code != "ok" or not llm_response:
            return None, error_code
        
        clean_response = llm_response.strip()
        if clean_response.startswith('```'):
            clean_response = clean_response.split('\n', 1)[-1]
        if clean_response.endswith('```'):
            clean_response = clean_response.rsplit('```', 1)[0]
        clean_response = clean_response.strip()
        
        parsed = json.loads(clean_response)
        return parsed, "ok"
        
    except Exception as exc:
        print(f"[quiz] Chunk {chunk_index + 1} processing error: {exc}")
        return None, "error"

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
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/edu_ai")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

# CORS configuration for React frontend
CORS(
    app,
    resources={r"/*": {
        "origins": [
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://localhost:5175", 
            "http://localhost:5176",
            "http://127.0.0.1:5173", 
            "http://127.0.0.1:5174", 
            "http://127.0.0.1:5175", 
            "http://127.0.0.1:5176"
        ],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }},
    supports_credentials=True
)

# Initialize MongoDB
mongo = PyMongo(app)
init_mongo_models(mongo)


def init_db():
    """Initialize the database and collections."""
    print("[OK] MongoDB connected and models initialized.")


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
        password_hash = User.set_password(password)
        user_data = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "accessibility_mode": accessibility_mode,
            "preferred_language": preferred_language,
            "role": "user"
        }
        user_id = User.create(user_data)
        user_doc = User.find_by_id(user_id)
        public_user = User.to_public_dict(user_doc)

        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user": public_user,
            "token": f"mock_token_{public_user['id']}"
        })
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": f"Registration failed: {str(e)}", "success": False}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login user."""
    try:
        data = request.get_json() or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({"error": "Email and password required.", "success": False}), 400

        user = User.find_one({
            "$or": [{"email": email}, {"username": email}]
        })

        if not user or not User.check_password(user.get("password_hash"), password):
            return jsonify({"error": "Invalid email or password.", "success": False}), 401

        public_user = User.to_public_dict(user)
        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": public_user,
            "token": f"mock_token_{public_user['id']}"  # In production, use JWT
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
            user_id = token.split("mock_token_")[-1]
            user = User.find_by_id(user_id)
            if user:
                return jsonify({"authenticated": True, "user": User.to_public_dict(user)})
        except Exception as e:
            print(f"Error in me endpoint: {e}")
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
        question = question[:1000]
        
        online = bool(data.get("online", True))
        mode = str(data.get("mode", "regular")).lower()
        language = str(data.get("language", "English")).strip()
        # Answer Style is read from settings to control response verbosity (Short vs Detailed)
        answer_style = str(data.get("answerStyle", "Detailed")).strip()
        context = data.get("context") # Support for optional persistent context (Image/PDF)
        
        print(f"[DEBUG] Online: {online}, Mode: {mode}, Language: {language}, Style: {answer_style}, Context: {context.get('type') if context else 'None'}")
        
        if mode not in ["regular", "deaf", "speech", "normal", "concise", "detailed"]:
            mode = "regular"
        if mode == "normal":
            mode = "regular"
        
        result = get_ai_response_payload(question, online, mode, context=context, language=language, answer_style=answer_style)
        print(f"[DEBUG] result status: {result.get('status')}, mode: {result.get('mode')}")

        status = result.get("status", "error")
        answer = result.get("answer")
        if isinstance(answer, str):
            answer = answer.strip()
        elif not answer:
            answer = ""
            
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
        language = str(data.get("language", "English")).strip()
        answer_style = str(data.get("answerStyle", "Detailed")).strip()

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
                online=online,
                language=language,
                answer_style=answer_style
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
                answer = get_ai_response(question[:500], online=online, mode=mode, language=language, answer_style=answer_style)
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
            online=online,
            language=language,
            answer_style=answer_style
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


@app.route("/api/analyze-image", methods=["POST"])
def analyze_image_route():
    """Analyze uploaded image."""
    try:
        data = request.get_json() or {}
        image_data = data.get("image", "")
        mode = data.get("mode", "regular")
        language = data.get("language", "English")
        answer_style = data.get("answerStyle", "Detailed")
        question = data.get("question")
        
        if not image_data:
            return jsonify({"error": "No image data provided", "success": False}), 400
            
        result = analyze_image(image_data, learner_mode=mode, user_question=question, language=language, answer_style=answer_style)
        return jsonify({
            "success": True, 
            "explanation": result["explanation"]
        })
    except Exception as e:
        print(f"Analyze image error: {e}")
        return jsonify({"error": "Failed to analyze image", "success": False}), 500


@app.route("/api/analyze-pdf", methods=["POST"])
def analyze_pdf_route():
    """Analyze extracted PDF text."""
    try:
        data = request.get_json() or {}
        text = data.get("text", "")
        mode = data.get("mode", "regular")
        language = data.get("language", "English")
        answer_style = data.get("answerStyle", "Detailed")
        user_question = data.get("question")
        
        if not text:
            return jsonify({"error": "No PDF text provided", "success": False}), 400
            
        # Re-using get_ai_response for summarizing text with an academic prompt
        if user_question:
            prompt = f"Academic Task: Answer the following question based ONLY on the provided document text. Maintain a formal, educational tone. Respond ONLY in {language}. Style: {answer_style}\n\nDOCUMENT CONTEXT: {text[:8000]}\n\nQUESTION: {user_question}"
        else:
            prompt = f"Academic Task: Please provide a structured, formal summary of the following document text in the {language} language. Style: {answer_style}. Avoid informalities and focus on key educational points: {text[:8000]}"
            
        summary = get_ai_response(prompt, online=True, mode=mode, language=language, answer_style=answer_style)
        
        # get_ai_response returns a dict or string? It usually returns a dict if successful
        # Let's check get_ai_response in ai_engine.py
        
        return jsonify({
            "success": True,
            "summary": summary if isinstance(summary, str) else summary.get("answer", summary.get("response", ""))
        })
    except Exception as e:
        print(f"Analyze PDF error: {e}")
        return jsonify({"error": "Failed to analyze PDF", "success": False}), 500


@app.route("/api/quiz/generate", methods=["POST"])
def generate_quiz_route():
    """
    Robust exam-grade quiz generation engine using the multi-step pipeline.
    """
    try:
        data = request.get_json() or {}
        pdf_text = (data.get("pdf_text") or "").strip()
        pdf_base64 = data.get("pdf_base64")
        pdf_name = (data.get("pdf_name") or "Uploaded PDF").strip()[:120]
        language = (data.get("language") or "English").strip() or "English"
        
        # If extraction is already done by frontend or previous step, use pdf_text
        # Otherwise, pass base64 to pipeline
        
        result = quiz_pipeline.process_pdf_pipeline(
            pdf_base64=pdf_base64,
            raw_text=pdf_text,
            pdf_name=pdf_name
        )
        
        if not result.get("success"):
            return jsonify(result), 400 if "content" in str(result.get("error")) else 500
            
        return jsonify(result)

    except Exception as e:
        print(f"[quiz] Critical error in generation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Internal processor error: {str(e)}"}), 500
        
        return jsonify({
            "success": True,
            "questions": final_questions,
            "metadata": {
                "total_chunks": total_chunks,
                "total_chars": len(pdf_text),
                "questions_generated": len(final_questions),
                "errors": errors if errors else None
            }
        })
        
    except Exception as e:
        print(f"[quiz] Generate quiz error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Failed to generate quiz: {str(e)}"}), 500


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
        "topics": ["Numbers", "Addition", "Subtraction", "Multiplication"],
        "pdf_path": "intro_math.pdf"
    },
    {
        "id": "2",
        "title": "Basic Science Concepts",
        "description": "Understanding fundamental science concepts like matter, energy, and living things.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "Science",
        "topics": ["Matter", "Energy", "Plants", "Animals"],
        "pdf_path": "basic_science.pdf"
    },
    {
        "id": "3",
        "title": "English Grammar Fundamentals",
        "description": "Master the basics of English grammar including parts of speech and sentence structure.",
        "duration": "40 mins",
        "level": "Intermediate",
        "category": "English",
        "topics": ["Nouns", "Verbs", "Sentences", "Punctuation"],
        "pdf_path": "english_grammar.pdf"
    },
    {
        "id": "4",
        "title": "Programming Fundamentals",
        "description": "Learn the basics of logic, loops, and variables in programming.",
        "duration": "35 mins",
        "level": "Beginner",
        "category": "Computer Science",
        "topics": ["Logic", "Loops", "Variables", "Functions"],
        "pdf_path": "programming_fundamentals.pdf"
    },
    {
        "id": "5",
        "title": "Fractions and Decimals",
        "description": "Learn about fractions, decimals, and how to convert between them.",
        "duration": "50 mins",
        "level": "Intermediate",
        "category": "Mathematics",
        "topics": ["Fractions", "Decimals", "Percentages"],
        "pdf_path": "fractions_decimals.pdf"
    },
    {
        "id": "6",
        "title": "The Solar System",
        "description": "Explore our solar system, planets, moons, and celestial bodies.",
        "duration": "55 mins",
        "level": "Intermediate",
        "category": "Science",
        "topics": ["Planets", "Sun", "Moon", "Space"],
        "pdf_path": "solar_system.pdf"
    },
    {
        "id": "7",
        "title": "Reading Comprehension",
        "description": "Improve your reading skills and learn to understand written texts better.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "English",
        "topics": ["Reading", "Vocabulary", "Comprehension"],
        "pdf_path": "reading_comp.pdf"
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
    """Get all available lessons from MongoDB."""
    category = request.args.get("category", "").strip()
    level = request.args.get("level", "").strip()
    
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if level:
        query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    
    docs = Course.find_all(query)
    lessons = Course.format_list(docs)
    
    return jsonify({
        "success": True,
        "lessons": lessons,
        "total": len(lessons)
    })


@app.route("/api/lessons/<lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    """Get a specific lesson by ID from MongoDB."""
    doc = Course.find_by_id(lesson_id)
    if not doc:
        return jsonify({"error": "Lesson not found", "success": False}), 404
    
    return jsonify({
        "success": True,
        "lesson": Course.format_doc(doc)
    })


@app.route("/api/lessons/<lesson_id>/content", methods=["GET"])
def get_lesson_content(lesson_id):
    """Extract and return text content from a lesson's PDF."""
    doc = Course.find_by_id(lesson_id)
    if not doc or "pdf_path" not in doc:
        return jsonify({"error": "Lesson or PDF not found", "success": False}), 404
        
    pdf_filename = doc["pdf_path"]
    pdf_path = os.path.join(BASE_DIR, "..", "frontend", "public", "lessons", pdf_filename)
    
    if not os.path.exists(pdf_path):
        # Return dummy content for demo if file doesn't exist
        return jsonify({
            "success": True,
            "content": f"This is placeholder content for {doc['title']}. In a real scenario, this text would be extracted from {pdf_filename} and summarized for students.",
            "is_dummy": True
        })
        
    try:
        text = ""
        if PyPDF2:
            with open(pdf_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += (page.extract_text() or "") + "\n"
        else:
            with open(pdf_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
                
        return jsonify({
            "success": True,
            "content": text.strip()
        })
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return jsonify({"error": "Failed to extract lesson content", "success": False}), 500


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Get all lesson categories from MongoDB."""
    categories = mongo.db.courses.distinct("category")
    return jsonify({
        "success": True,
        "categories": sorted(categories)
    })


# ==================== User Management & Profiles ====================

@app.route("/api/profile", methods=["GET", "POST"])
def manage_profile():
    """Get or update user profile."""
    # Simulation: In production use session or JWT
    user_id = request.args.get("user_id") 
    if not user_id:
        return jsonify({"error": "Auth required", "success": False}), 401

    if request.method == "GET":
        profile = Profile.find_one({"user_id": user_id})
        if not profile:
            # Create default profile
            user = User.find_by_id(user_id)
            profile_data = {
                "user_id": user_id,
                "full_name": user.get("username", "Student"),
                "bio": "Keep learning and growing with AI.",
                "interests": [],
                "stats": {"completed": 0, "quizzes": 0}
            }
            Profile.create(profile_data)
            profile = profile_data
        
        return jsonify({"success": True, "profile": Profile.format_doc(profile)})

    else:
        data = request.get_json()
        Profile.update(data.get("id"), data)
        return jsonify({"success": True, "message": "Profile updated"})


# ==================== AI Chat History ====================

@app.route("/api/history", methods=["GET", "POST"])
def chat_history():
    """Get or save AI chat history."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Auth required", "success": False}), 401

    if request.method == "GET":
        history = ChatHistory.find_all({"user_id": user_id}, sort=[("created_at", -1)])
        return jsonify({"success": True, "history": ChatHistory.format_list(history)})
    
    else:
        data = request.get_json()
        data["user_id"] = user_id
        ChatHistory.create(data)
        return jsonify({"success": True})


# ==================== Progress Tracking ====================

@app.route("/api/progress", methods=["GET", "POST"])
def track_progress():
    """Get or update user learning progress."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Auth required", "success": False}), 401

    if request.method == "GET":
        progress = Progress.find_one({"user_id": user_id})
        if not progress:
            progress = {
                "user_id": user_id,
                "lessonsCompleted": 0,
                "totalLessons": 8,
                "questionsAsked": 0,
                "streakDays": 1,
                "lastActivity": datetime.utcnow().strftime("%Y-%m-%d"),
                "quiz_scores": [],
                "activities": []
            }
        return jsonify({"success": True, "progress": Progress.format_doc(progress) if "_id" in progress else progress})
    
    else:
        data = request.get_json()
        progress_id = data.pop("id", None)
        
        if progress_id:
            Progress.update(progress_id, data)
        else:
            # Try to find by user_id if id not provided or null
            existing = Progress.find_one({"user_id": user_id})
            if existing:
                Progress.update(existing["_id"], data)
            else:
                Progress.create({**data, "user_id": user_id})
        
        return jsonify({"success": True})


# ==================== Assignments & Feedback ====================

@app.route("/api/assignments", methods=["GET", "POST"])
def manage_assignments():
    """Get all assignments or submit a new one."""
    if request.method == "GET":
        assignments = Assignment.find_all()
        return jsonify({"success": True, "assignments": Assignment.format_list(assignments)})
    else:
        data = request.get_json()
        Assignment.create(data)
        return jsonify({"success": True})

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    """Submit feedback about AI or course."""
    data = request.get_json()
    Feedback.create(data)
    return jsonify({"success": True, "message": "Feedback submitted"})

@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    """Get notifications for a user."""
    user_id = request.args.get("user_id")
    notifs = Notification.find_all({"user_id": user_id}, sort=[("created_at", -1)])
    return jsonify({"success": True, "notifications": Notification.format_list(notifs)})

@app.route("/api/sync", methods=["POST"])
def sync_offline_data():
    """Sync offline progress and actions when user is back online."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Auth required", "success": False}), 401
    
    data = request.get_json()
    actions = data.get("actions", [])
    
    for action in actions:
        action_type = action.get("type")
        payload = action.get("payload")
        
        try:
            if action_type == "PROGRESS_UPDATE":
                # Find progress for user or create new
                prog = Progress.find_one({"user_id": user_id})
                if prog:
                    Progress.update(prog["_id"], payload)
                else:
                    Progress.create({**payload, "user_id": user_id})
                    
            elif action_type == "CHAT_HISTORY":
                ChatHistory.create({"user_id": user_id, "messages": payload, "created_at": datetime.utcnow()})
                
            elif action_type == "FEEDBACK":
                Feedback.create({**payload, "user_id": user_id})
        except Exception as e:
            print(f"Error syncing action {action_type}: {e}")
            
    # Record sync event
    OfflineSync.create({
        "user_id": user_id,
        "actions_synced": len(actions),
        "timestamp": datetime.utcnow()
    })
    
    return jsonify({"success": True, "message": f"Synced {len(actions)} actions"})
    
    return jsonify({"success": True, "message": f"Synced {len(actions)} actions"})


# ==================== ADMIN DASHBOARD ====================

@app.route("/api/admin/<user_id>/stats", methods=["GET"])
@token_required
def get_admin_stats(current_user, user_id):
    """Get overview of all system data (Admin only)."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access denied", "success": False}), 403

    stats = {
        "total_users": mongo.db.users.count_documents({}),
        "total_lessons": mongo.db.courses.count_documents({}),
        "total_chats": mongo.db.chat_history.count_documents({}),
        "total_assignments": mongo.db.assignments.count_documents({}),
        "total_feedback": mongo.db.feedback.count_documents({}),
        "recent_feedback": Feedback.format_list(Feedback.find_all(limit=10, sort=[("created_at", -1)])),
        "user_list": User.format_list(User.find_all(limit=50)),
        "all_progress": Progress.format_list(Progress.find_all(limit=50)),
        "all_notifications": Notification.format_list(Notification.find_all(limit=20))
    }
    return jsonify({"success": True, "stats": stats})


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
    print(f"MongoDB URI: {app.config['MONGO_URI']}")
    print(f"Server: http://127.0.0.1:5000")
    print(f"API Docs: http://127.0.0.1:5000/")
    print("="*50 + "\n")
    
    # Run on all interfaces to avoid localhost resolution issues
    app.run(host="0.0.0.0", port=5000, debug=False)
