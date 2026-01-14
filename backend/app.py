# app.py
from flask import Flask, request, jsonify
from ai_engine import get_ai_response
from flask_cors import CORS 
app = Flask(__name__)
CORS(app)
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    online = data.get("online", True)
    mode = data.get("mode", "normal")

    answer = get_ai_response(question, online, mode)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)
