import ast
import operator
import os
import re

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

from offline_logic import (
    offline_generate_explanation,
    offline_response,
    get_general_knowledge_answer,
    get_math_concept_answer,
    get_out_of_scope_message
)

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

VIDEO_SYSTEM_PROMPT = """You are an AI lesson explainer for students with limited internet.
Your role:
1. Read the video transcript text and explain the lesson simply
2. Provide key points as short bullet-like phrases
3. Provide a short summary
4. Adapt the explanation to the learner mode
5. Keep language clear, calm, and classroom-safe
6. Do not mention downloading videos or external sources

Return a JSON object with keys:
simple_explanation, key_points, summary.
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
    """Get AI response with deterministic, offline-friendly logic."""
    normalized = str(question or "").strip()
    if not normalized:
        return get_out_of_scope_message()

    # Math expressions are answered concisely (numeric-only) by design.
    # 1) Math expressions → numeric answer only.
    if is_pure_math_expression(normalized):
        return solve_math_expression(normalized)

    # 2) Math concepts → short academic explanation.
    concept_answer = get_math_concept_answer(normalized)
    if concept_answer:
        return concept_answer

    # 3) General knowledge → direct factual answer.
    general_answer = get_general_knowledge_answer(normalized)
    if general_answer:
        return general_answer

    # 4) Unknown → polite out-of-scope message.
    return get_out_of_scope_message()

def is_pure_math_expression(question):
    if not question or not str(question).strip():
        return False
    q = str(question).strip()
    if not re.fullmatch(r"[\d\s\+\-\*/\^\(\)\.]+", q):
        return False
    return any(ch.isdigit() for ch in q)

def solve_math_expression(expression):
    """Solve pure math expressions with safe evaluation and return only the numeric result."""
    raw = str(expression).strip()
    normalized = raw.replace("^", "**")
    try:
        tree = ast.parse(normalized, mode="eval")
        result = _eval_node(tree.body)
        return str(result)
    except Exception:
        return get_out_of_scope_message()

def _eval_node(node):
    operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow
    }
    if isinstance(node, ast.BinOp) and type(node.op) in operators:
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op_func = operators[type(node.op)]
        return op_func(left, right)
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        value = _eval_node(node.operand)
        return value if isinstance(node.op, ast.UAdd) else -value
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    raise ValueError("Unsupported expression")

def _format_response(result):
    return (
        "Explanation:\n" + result.get("explanation", "") + "\n\n"
        "Example:\n" + result.get("example", "") + "\n\n"
        "Summary:\n" + result.get("summary", "")
    )

def generate_video_explanation(transcript_text, question="", learner_mode="regular", level="basic", online=True):
    """Generate a structured video explanation with offline-safe fallback."""
    if not transcript_text or not transcript_text.strip():
        return {
            "simple_explanation": "Transcript is not available for this video.",
            "key_points": ["Try another video or ask a manual question."],
            "summary": "No transcript was found to summarize."
        }

    mode_key = learner_mode if learner_mode in MODE_GUIDANCE else "regular"
    mode_hint = MODE_GUIDANCE[mode_key]

    if not online or not API_KEY or not client:
        return _offline_video_explanation(transcript_text, question, mode_key)

    prompt = (
        VIDEO_SYSTEM_PROMPT
        + "\nLearner mode: " + mode_key
        + "\nLevel: " + level
        + "\nStyle guidance: " + mode_hint
        + "\nOptional learner question: " + (question.strip() if question else "(none)")
        + "\nTranscript:\n" + transcript_text.strip()
    )

    raw = _call_ai_model(prompt)
    parsed = _safe_parse_json(raw)
    if parsed:
        return _ensure_video_fields(parsed)

    return _offline_video_explanation(transcript_text, question, mode_key)

def _ensure_video_fields(data):
    key_points = data.get("key_points", [])
    if isinstance(key_points, str):
        key_points = [p.strip() for p in key_points.split("\n") if p.strip()]
    if not isinstance(key_points, list):
        key_points = []

    return {
        "simple_explanation": str(data.get("simple_explanation", "")).strip() or "Here is a simple explanation.",
        "key_points": key_points[:6] if key_points else ["Key points will appear here."],
        "summary": str(data.get("summary", "")).strip() or "Short summary is provided."
    }

def _offline_video_explanation(transcript_text, question, learner_mode):
    """Lightweight fallback for low-connectivity environments."""
    cleaned = _clean_transcript(transcript_text)
    snippet = " ".join(cleaned.split()[:120]).strip()
    if question:
        explanation = "This is a basic explanation based on the transcript. " + _shorten_text(snippet, 420)
    else:
        explanation = "Here is a simple explanation of the video: " + _shorten_text(snippet, 420)

    key_points = _extract_key_points(cleaned)
    summary = _shorten_text(snippet, 220) if snippet else "Summary not available."

    if learner_mode == "deaf":
        explanation = "Key ideas from the transcript:\n- " + "\n- ".join(key_points)
        summary = "Summary: " + summary

    return {
        "simple_explanation": explanation,
        "key_points": key_points,
        "summary": summary
    }

def _clean_transcript(text):
    return " ".join(text.replace("\n", " ").split())

def _shorten_text(text, limit):
    if len(text) <= limit:
        return text
    return text[: limit].rsplit(" ", 1)[0].rstrip() + "..."

def _extract_key_points(text):
    if not text:
        return ["Transcript not available."]
    sentences = [s.strip() for s in text.split(".") if s.strip()]
    picks = sentences[:4] if len(sentences) >= 4 else sentences
    return [s if s.endswith(".") else s + "." for s in picks] or ["Key points not available."]
