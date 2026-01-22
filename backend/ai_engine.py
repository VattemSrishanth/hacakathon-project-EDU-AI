# ai_engine.py
import json
import os

try:
    from openai import OpenAI
except Exception:
    OpenAI = None
from offline_logic import offline_generate_explanation, offline_response

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY) if API_KEY and OpenAI else None

SYSTEM_PROMPT = """You are a dedicated school tutor for rural and disabled learners.
Your role:
1. Explain syllabus questions clearly and step-by-step
2. Use simple language suitable for rural students
3. Include at least one example
4. Provide a short, simple summary
5. If unsure, give a basic explanation first, then expand
6. Avoid hallucinating facts or pretending to access external sources
7. NEVER say "I don't know". Offer a safe, basic explanation instead.

Return a JSON object with keys:
explanation, example, summary.
"""

MODE_GUIDANCE = {
    "regular": "Use normal explanation style with clear steps.",
    "deaf": "Use text-heavy, structured bullet points and short headings.",
    "speech": "Use short sentences and step-by-step format."
}

def generate_explanation(question, learner_mode="regular", level="basic"):
    """Generate a structured explanation (explanation, example, summary)."""
    if not question or not question.strip():
        return {
            "explanation": "Please ask a clear question about a school topic.",
            "example": "Example: What is photosynthesis?",
            "summary": "Ask a clear question to get a full explanation."
        }

    mode_key = learner_mode if learner_mode in MODE_GUIDANCE else "regular"
    mode_hint = MODE_GUIDANCE[mode_key]

    # Offline-first safety when API is not available
    if not API_KEY or not client:
        return offline_generate_explanation(question, learner_mode=mode_key, level=level)

    prompt = (
        SYSTEM_PROMPT
        + "\nLearner mode: " + mode_key
        + "\nLevel: " + level
        + "\nStyle guidance: " + mode_hint
        + "\nQuestion: " + question.strip()
    )

    raw = _call_ai_model(prompt)
    parsed = _safe_parse_json(raw)
    if parsed:
        return _ensure_fields(parsed)

    # Fallback to offline structured response if JSON parsing fails
    return offline_generate_explanation(question, learner_mode=mode_key, level=level)

def get_ai_response(question, online=True, mode="regular"):
    """Get AI response with structured, inclusive explanation and offline fallback."""
    if not online:
        return offline_response(question, learner_mode=mode)

    try:
        result = generate_explanation(question, learner_mode=mode, level="basic")
        return _format_response(result)
    except Exception:
        return offline_response(question, learner_mode=mode)

def _call_ai_model(prompt):
    """Helper to call OpenAI API safely."""
    if not client:
        return ""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        content = response.choices[0].message.content
        return content if content else ""
    except Exception:
        return ""

def _safe_parse_json(text):
    if not text:
        return None
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except Exception:
        return None

def _ensure_fields(data):
    return {
        "explanation": str(data.get("explanation", "")).strip() or "Basic explanation is provided.",
        "example": str(data.get("example", "")).strip() or "Example is provided.",
        "summary": str(data.get("summary", "")).strip() or "Summary is provided."
    }

def _format_response(result):
    return (
        "Explanation:\n" + result.get("explanation", "") + "\n\n"
        "Example:\n" + result.get("example", "") + "\n\n"
        "Summary:\n" + result.get("summary", "")
    )
