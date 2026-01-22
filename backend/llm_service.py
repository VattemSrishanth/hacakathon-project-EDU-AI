import os
import re

try:
    import google.generativeai as genai
except Exception:
    genai = None


MAX_PROMPT_CHARS = 12000
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-flash-latest")


def _get_api_key():
    return os.getenv("GEMINI_API_KEY", "").strip()


def _sanitize_prompt(prompt):
    if not prompt:
        return ""
    prompt = str(prompt)
    if len(prompt) > MAX_PROMPT_CHARS:
        return None
    return prompt


def _classify_error_message(message):
    lower = message.lower()
    if "api key" in lower or "permission" in lower or "unauthorized" in lower or "permission_denied" in lower or "api_key_invalid" in lower:
        return "invalid_api_key"
    if "quota" in lower or "resource exhausted" in lower or "rate limit" in lower or "too many requests" in lower:
        return "quota_exceeded"
    if "safety" in lower or "blocked" in lower:
        return "blocked"
    if "invalid argument" in lower:
        return "invalid_request"
    if "service unavailable" in lower or "temporarily unavailable" in lower:
        return "service_unavailable"
    return "unknown"


def _extract_status_code(exc):
    for attr in ("status_code", "code", "status", "http_status"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
    match = re.search(r"\b(4\d\d|5\d\d)\b", str(exc))
    return int(match.group(1)) if match else None


def generate_text(prompt, model_name=DEFAULT_MODEL, temperature=0.5, max_output_tokens=512):
    """Generate text using Gemini. Returns (text, error_code)."""
    api_key = _get_api_key()
    if not api_key or not genai:
        return "", "missing_api_key"

    prompt = _sanitize_prompt(prompt)
    if prompt is None:
        return "", "prompt_too_long"
    if not prompt:
        return "", "empty_prompt"

    if model_name and not model_name.startswith("models/"):
        model_name = "models/" + model_name

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_output_tokens
            }
        )
        text = getattr(response, "text", "")
        return text or "", "ok" if text else "empty_response"
    except Exception as exc:
        message = str(exc)
        error_code = _classify_error_message(message)
        status_code = _extract_status_code(exc)
        if error_code == "unknown" and status_code:
            if status_code in (401, 403):
                error_code = "invalid_api_key"
            elif status_code == 429:
                error_code = "quota_exceeded"
            elif status_code == 400:
                error_code = "invalid_request"
            elif status_code >= 500:
                error_code = "service_unavailable"

        print(f"[llm_service] Gemini error: {type(exc).__name__}: {message}")
        return "", error_code
