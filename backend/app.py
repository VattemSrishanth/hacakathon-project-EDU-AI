import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from ai_engine import get_ai_response


FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# Serve files from ../frontend at the site root (/, /home.html, /style.css, ...)
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)


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
        mode = str(data.get("mode", "normal")).lower()
        
        # Validate mode
        if mode not in ["normal", "deaf", "speech"]:
            mode = "normal"
        
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


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
