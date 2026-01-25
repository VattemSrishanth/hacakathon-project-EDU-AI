"""
RuralAccess AI - Backend API Server
A Flask-based backend for the educational platform serving rural and disabled learners.
"""

import os
import re
import io
import base64
import json
from urllib.parse import urlparse, parse_qs
from xml.etree.ElementTree import ParseError

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from ai_engine import get_ai_response, generate_video_explanation, get_ai_response_payload, analyze_image
import llm_service
from auth import auth_bp
from models import db, User

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
                               questions_per_chunk: int, language: str, pdf_name: str):
    """
    Generate quiz questions from a single text chunk using Gemini API.
    
    Args:
        chunk_text: Text content of this chunk
        chunk_index: Index of this chunk (0-based)
        total_chunks: Total number of chunks being processed
        questions_per_chunk: Number of questions to generate from this chunk
        language: Language for questions
        pdf_name: Name of the PDF for context
    
    Returns:
        Tuple of (questions_list, error_message)
    """
    prompt = (
        f"You are an education assessment generator. This is chunk {chunk_index + 1} of {total_chunks} "
        f"from document '{pdf_name}'. Based ONLY on the provided text, "
        f"create exactly {questions_per_chunk} multiple-choice questions in {language}. "
        "Each question must have 4 concise options with exactly one correct answer. "
        "Vary question types (recall, understanding, application). Avoid generic filler. "
        "Return ONLY valid JSON array matching this schema (no markdown, no explanation): "
        "[{\"id\":1,\"question\":\"text\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":0}] "
        "IDs should start at 1. 'answer' is the correct option index (0-3). "
        f"Text content:\n{chunk_text}"
    )
    
    try:
        # Call Gemini API
        llm_response, error_code = llm_service.generate_text(
            prompt, 
            temperature=0.35, 
            max_output_tokens=800
        )
        
        if error_code != "ok" or not llm_response:
            print(f"[quiz] Chunk {chunk_index + 1} LLM error: {error_code}")
            return [], f"LLM error on chunk {chunk_index + 1}: {error_code}"
        
        # Parse JSON response
        # Remove potential markdown code blocks
        clean_response = llm_response.strip()
        if clean_response.startswith('```'):
            clean_response = clean_response.split('\n', 1)[-1]
        if clean_response.endswith('```'):
            clean_response = clean_response.rsplit('```', 1)[0]
        clean_response = clean_response.strip()
        
        parsed = json.loads(clean_response)
        if not isinstance(parsed, list):
            return [], f"Invalid response format from chunk {chunk_index + 1}"
        
        return parsed, None
        
    except json.JSONDecodeError as exc:
        print(f"[quiz] Chunk {chunk_index + 1} JSON parse error: {exc}")
        print(f"[quiz] Raw response: {llm_response[:300] if llm_response else 'None'}")
        return [], f"Failed to parse response from chunk {chunk_index + 1}"
    except Exception as exc:
        print(f"[quiz] Chunk {chunk_index + 1} error: {exc}")
        return [], f"Error processing chunk {chunk_index + 1}: {str(exc)}"

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
    Generate AI-based quiz questions from PDF text or PDF base64.
    
    Supports PDFs of any size by:
    1. Extracting text from the uploaded PDF
    2. Splitting text into chunks (4000 chars each) if it exceeds limit
    3. Sending each chunk to Gemini API sequentially
    4. Merging all responses into one final quiz
    5. Handling errors gracefully per chunk
    """
    try:
        # === Step 1: Parse request data ===
        data = request.get_json() or {}
        pdf_text = (data.get("pdf_text") or "").strip()
        pdf_base64 = data.get("pdf_base64")
        pdf_name = (data.get("pdf_name") or "Uploaded PDF").strip()[:120]
        language = (data.get("language") or "English").strip() or "English"
        desired_count = data.get("count") or 15
        
        try:
            desired_count = int(desired_count)
        except Exception:
            desired_count = 15
        question_count = max(5, min(desired_count, 30))  # Allow up to 30 questions for large PDFs

        # === Step 2: Extract text from PDF if base64 provided ===
        if not pdf_text and pdf_base64:
            print(f"[quiz] Decoding PDF base64 for '{pdf_name}'...")
            pdf_bytes = _decode_pdf_base64(pdf_base64)
            pdf_text = _extract_pdf_text_from_bytes(pdf_bytes)

        if not pdf_text:
            return jsonify({"success": False, "error": "No PDF content provided or could not extract text."}), 400

        # Clean the text
        pdf_text = pdf_text.strip().replace("\r", " ")
        print(f"[quiz] Extracted {len(pdf_text)} characters from PDF")

        # === Step 3: Split text into chunks if needed ===
        # Use 4000 chars per chunk to stay well within 12000 char API limit
        CHUNK_SIZE = 4000
        chunks = _split_text_into_chunks(pdf_text, chunk_size=CHUNK_SIZE, overlap=100)
        total_chunks = len(chunks)
        print(f"[quiz] Split into {total_chunks} chunk(s)")

        # Calculate questions per chunk (distribute evenly)
        # Minimum 3 questions per chunk, distribute remaining
        base_questions_per_chunk = max(3, question_count // total_chunks)
        remaining_questions = question_count - (base_questions_per_chunk * total_chunks)

        # === Step 4: Process each chunk and collect questions ===
        all_questions = []
        errors = []
        
        for i, chunk in enumerate(chunks):
            # Add extra questions to first chunks if there's remainder
            questions_for_this_chunk = base_questions_per_chunk
            if remaining_questions > 0:
                questions_for_this_chunk += 1
                remaining_questions -= 1
            
            print(f"[quiz] Processing chunk {i + 1}/{total_chunks} ({len(chunk)} chars, {questions_for_this_chunk} questions)...")
            
            # Generate questions from this chunk
            chunk_questions, error = _generate_quiz_from_chunk(
                chunk_text=chunk,
                chunk_index=i,
                total_chunks=total_chunks,
                questions_per_chunk=questions_for_this_chunk,
                language=language,
                pdf_name=pdf_name
            )
            
            if error:
                errors.append(error)
                print(f"[quiz] Chunk {i + 1} error: {error}")
            else:
                all_questions.extend(chunk_questions)
                print(f"[quiz] Chunk {i + 1} generated {len(chunk_questions)} questions")

        # === Step 5: Normalize and deduplicate questions ===
        normalized = []
        seen_questions = set()  # Track question text to avoid duplicates
        
        for idx, item in enumerate(all_questions, start=1):
            try:
                question_text = str(item.get("question", "")).strip()
                
                # Skip empty or duplicate questions
                if not question_text or question_text.lower() in seen_questions:
                    continue
                    
                options = item.get("options") or []
                answer_index = item.get("answer", 0)
                
                # Validate options
                if len(options) < 4:
                    continue
                options = [str(opt).strip() for opt in options][:4]
                if len(options) < 4 or any(not opt for opt in options):
                    continue
                
                # Validate answer index
                answer_index = int(answer_index)
                if answer_index < 0 or answer_index > 3:
                    answer_index = 0
                
                # Add to normalized list with sequential ID
                normalized.append({
                    "id": len(normalized) + 1,  # Sequential IDs
                    "text": question_text,
                    "options": options,
                    "correct": answer_index
                })
                seen_questions.add(question_text.lower())
                
            except Exception as e:
                print(f"[quiz] Error normalizing question: {e}")
                continue

        # === Step 6: Return results ===
        if not normalized:
            error_msg = "; ".join(errors) if errors else "No usable questions generated"
            return jsonify({"success": False, "error": error_msg}), 500

        # Limit to requested count
        final_questions = normalized[:question_count]
        
        print(f"[quiz] Successfully generated {len(final_questions)} questions from {total_chunks} chunk(s)")
        
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


@app.route("/api/lessons/<lesson_id>/content", methods=["GET"])
def get_lesson_content(lesson_id):
    """Extract and return text content from a lesson's PDF."""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson or "pdf_path" not in lesson:
        return jsonify({"error": "Lesson or PDF not found", "success": False}), 404
        
    pdf_filename = lesson["pdf_path"]
    pdf_path = os.path.join(BASE_DIR, "..", "frontend", "public", "lessons", pdf_filename)
    
    if not os.path.exists(pdf_path):
        # Return dummy content for demo if file doesn't exist
        return jsonify({
            "success": True,
            "content": f"This is placeholder content for {lesson['title']}. In a real scenario, this text would be extracted from {pdf_filename} and summarized for students.",
            "is_dummy": True
        })
        
    try:
        text = ""
        if PyPDF2:
            with open(pdf_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        else:
            # Fallback for generic text files or if PyPDF2 is missing
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
