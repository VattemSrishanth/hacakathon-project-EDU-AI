import os
import re
from urllib.parse import urlparse, parse_qs
from xml.etree.ElementTree import ParseError

from flask import Flask, jsonify, request
from flask_cors import CORS

from ai_engine import get_ai_response, generate_video_explanation
from auth import auth_bp
from models import db

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
except Exception:
    YouTubeTranscriptApi = None
    TranscriptsDisabled = NoTranscriptFound = VideoUnavailable = Exception


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

# Serve files from ../frontend at the site root (/, /home.html, /style.css, ...)
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me-in-production")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'edu_ai.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

CORS(app, supports_credentials=True)
db.init_app(app)
app.register_blueprint(auth_bp)


def init_db():
    with app.app_context():
        db.create_all()


init_db()


@app.route("/", methods=["GET"])
def root():
    """Serve the frontend home page."""
    return app.send_static_file("home.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/ask", methods=["POST"])
def ask():
    """SYLLABUS GUARANTEE: Always returns explanation for school topics."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"answer": "No request data", "mode": "error"}), 400
        
        # Input validation
        question = str(data.get("question", "")).strip()
        if not question or len(question) < 2:
            return jsonify({"answer": "Please ask a clear question.", "mode": "offline"}), 400
        
        # Limit question length for safety
        question = question[:500]
        
        online = bool(data.get("online", True))
        mode = str(data.get("mode", "regular")).lower()
        
        # Validate mode
        if mode not in ["regular", "deaf", "speech", "normal"]:
            mode = "regular"
        if mode == "normal":
            mode = "regular"
        
        # Get AI response (guarantees non-empty answer for syllabus topics)
        answer = get_ai_response(question, online, mode)
        
        # Determine response mode
        response_mode = "offline" if not online else "online"
        
        # Safety: Never return None or empty
        if not answer or not answer.strip():
            answer = "Unable to generate answer. Please try again or consult your teacher."
            response_mode = "offline"
        
        return jsonify({"answer": answer.strip(), "mode": response_mode})
    
    except Exception as e:
        # Catch all exceptions - no 500 errors
        return jsonify({
            "answer": "An error occurred. Please try again.",
            "mode": "offline"
        }), 500


@app.route("/explain-video", methods=["POST"])
def explain_video():
    """Generate a lesson explanation from a YouTube transcript."""
    try:
        data = request.get_json() or {}
        video_url = str(data.get("videoUrl", "")).strip()
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
                "status": "error"
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
                "status": "error"
            }), 400

        transcript_text, transcript_status = _get_transcript_text(video_id)

        if transcript_status != "ok":
            message = _transcript_status_message(transcript_status)
            if question:
                answer = get_ai_response(question[:500], online=online, mode=mode)
                return jsonify({
                    "status": "no_transcript",
                    "message": message + " Answered your question instead.",
                    "answer": answer
                })
            return jsonify({
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
            "status": "ok",
            "videoId": video_id,
            "simpleExplanation": result.get("simple_explanation", ""),
            "keyPoints": result.get("key_points", []),
            "summary": result.get("summary", "")
        })
    except Exception:
        return jsonify({
            "status": "error",
            "error": "Unable to process this video. Please try again."
        }), 500


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
    """Fetch transcript text without downloading video content."""
    if not YouTubeTranscriptApi:
        return "", "unavailable"

    cookies = _get_youtube_cookies()

    try:
        transcript = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=["en", "en-US", "en-GB"],
            cookies=None
        )
        text = " ".join([item.get("text", "") for item in transcript if item.get("text")])
        return text.strip(), "ok" if text.strip() else "empty"
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        pass
    except ParseError:
        return "", "consent_required"
    except Exception:
        pass

    if cookies:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(
                video_id,
                languages=["en", "en-US", "en-GB"],
                cookies=cookies
            )
            text = " ".join([item.get("text", "") for item in transcript if item.get("text")])
            return text.strip(), "ok" if text.strip() else "empty"
        except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
            pass
        except ParseError:
            return "", "consent_required"
        except Exception:
            pass

    try:
        transcripts = YouTubeTranscriptApi.list_transcripts(video_id, cookies=None)

        selected = None
        for transcript in transcripts:
            if transcript.language_code in {"en", "en-US", "en-GB"}:
                selected = transcript
                break

        if not selected:
            for transcript in transcripts:
                if transcript.is_translatable:
                    selected = transcript.translate("en")
                    break

        if not selected:
            for transcript in transcripts:
                selected = transcript
                break

        if not selected:
            return "", "no_transcript"

        transcript_data = selected.fetch()
        text = " ".join([item.get("text", "") for item in transcript_data if item.get("text")])
        return text.strip(), "ok" if text.strip() else "empty"
    except (TranscriptsDisabled, NoTranscriptFound):
        return "", "no_transcript"
    except VideoUnavailable:
        return "", "video_unavailable"
    except ParseError:
        return "", "consent_required"
    except Exception:
        return "", "error"

    if cookies:
        try:
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id, cookies=cookies)

            selected = None
            for transcript in transcripts:
                if transcript.language_code in {"en", "en-US", "en-GB"}:
                    selected = transcript
                    break

            if not selected:
                for transcript in transcripts:
                    if transcript.is_translatable:
                        selected = transcript.translate("en")
                        break

            if not selected:
                for transcript in transcripts:
                    selected = transcript
                    break

            if not selected:
                return "", "no_transcript"

            transcript_data = selected.fetch()
            text = " ".join([item.get("text", "") for item in transcript_data if item.get("text")])
            return text.strip(), "ok" if text.strip() else "empty"
        except (TranscriptsDisabled, NoTranscriptFound):
            return "", "no_transcript"
        except VideoUnavailable:
            return "", "video_unavailable"
        except ParseError:
            return "", "consent_required"
        except Exception:
            return "", "error"

    return "", "error"


def _get_youtube_cookies():
    """Return a cookies.txt path if provided by the environment."""
    cookies_path = os.getenv("YOUTUBE_COOKIES_PATH", "").strip()
    if not cookies_path:
        return None
    if not os.path.isfile(cookies_path):
        return None
    return cookies_path


def _transcript_status_message(status):
    messages = {
        "unavailable": "Transcript service is unavailable right now.",
        "no_transcript": "Transcript not available for this video.",
        "empty": "Transcript was empty for this video.",
        "video_unavailable": "This video is unavailable in your region or is private.",
        "consent_required": "YouTube consent blocked the transcript request.",
        "error": "Unable to fetch transcript at the moment."
    }
    return messages.get(status, "Transcript not available for this video.")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
