# ai_engine.py
from openai import OpenAI
from offline_logic import offline_response, is_syllabus_question
import os

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY) if API_KEY else None

# SYLLABUS GUARANTEE: This system ALWAYS provides explanations for school curriculum topics
# School Syllabus Scope: Math, Science, English (basics, grammar, comprehension)
SYLLABUS_TOPICS = {
    "math": ["addition", "subtraction", "multiplication", "division", "fraction", "decimal", "algebra", "geometry", "percentage"],
    "science": ["biology", "chemistry", "physics", "photosynthesis", "atoms", "elements", "ecosystem"],
    "english": ["grammar", "spelling", "vocabulary", "reading", "comprehension", "essay", "punctuation"]
}

SYSTEM_PROMPT = """You are a dedicated school tutor. Your role:
1. ALWAYS explain school curriculum topics (Math, Science, English basics) clearly
2. Use simple, step-by-step explanations
3. Include examples whenever possible
4. Use text-only format (no images or complex symbols)
5. Never say 'I don't know' for syllabus topics - provide an explanation
6. For accessible learning: use simple English and clear structure

For non-syllabus questions, politely decline and suggest official resources."""

def get_ai_response(question, online=True, mode="normal"):
    """Get AI response with syllabus-guaranteed explanation fallback."""
    if not online:
        return offline_response(question)

    # Check if question is within syllabus scope
    if not is_syllabus_question(question):
        return "I can only help with school subjects (Math, Science, English basics). For other topics, please consult official resources."

    # If no API key is configured, fall back to offline explanation
    if not API_KEY:
        return offline_response(question)

    # Build mode-specific system prompt
    current_system_prompt = SYSTEM_PROMPT
    if mode == "deaf":
        current_system_prompt += "\nUse simple words suitable for captions."
    elif mode == "speech":
        current_system_prompt += "\nRespond clearly for text-only accessibility."

    try:
        # First attempt at online explanation
        answer = _call_ai_model(current_system_prompt, question)

        # REGENERATION LOGIC: If response is weak/empty, try once more
        if not answer or len(answer.strip()) < 20:
            answer = _call_ai_model(current_system_prompt, question)

        # If still weak, fall back to offline explanation
        if not answer or len(answer.strip()) < 20:
            answer = offline_response(question)

        return answer
    except Exception:
        # Safety fallback for any exceptions
        return offline_response(question)

def _call_ai_model(system_prompt, question):
    """Helper to call OpenAI API safely."""
    if not client:
        return ""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=200,
            temperature=0.7
        )
        content = response.choices[0].message.content
        return content if content else ""
    except Exception:
        return ""
