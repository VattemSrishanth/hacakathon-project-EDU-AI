"""
Groq LLM Service
-----------------
This module replaces the Gemini-based llm_service.py with Groq API integration.
It maintains the EXACT same function signatures and return format to ensure
backward compatibility with ai_engine.py and the existing AI Tutor flow.

CRITICAL: This module preserves the original API contract:
- generate_text() function signature unchanged
- Returns (text, error_code) tuple
- Error codes remain identical
- No UI or frontend changes required
"""

import os
import re
from groq import Groq

# Load environment variables from the same directory as this file
try:
    from dotenv import load_dotenv
    # Find the backend directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(current_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        # Fallback to general load_dotenv
        load_dotenv()
except ImportError:
    pass

# Configuration
MAX_PROMPT_CHARS = 300000 # Increased for vision support (base64 images)

# Groq model selection - using llama-3.3-70b-versatile for strong reasoning
# Alternative models:
# - "llama-3.1-70b-versatile" (good balance)
# - "mixtral-8x7b-32768" (faster responses)
# - "gemma2-9b-it" (lightweight, fast)
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
VISION_MODEL = "llama-3.2-11b-vision-preview"


def _get_api_key():
    """Retrieve Groq API key from environment variable."""
    return os.getenv("GROQ_API_KEY", "").strip()


def _sanitize_prompt(prompt):
    """
    Validate and sanitize prompt text.
    Returns None if prompt exceeds max length.
    """
    if not prompt:
        return ""
    prompt = str(prompt)
    if len(prompt) > MAX_PROMPT_CHARS:
        return None
    return prompt


def _classify_error_message(message):
    """
    Classify error messages into standardized error codes.
    This maintains compatibility with the original llm_service error handling.
    """
    lower = message.lower()
    
    # Authentication errors
    if "api key" in lower or "permission" in lower or "unauthorized" in lower or "permission_denied" in lower or "api_key_invalid" in lower or "authentication" in lower or "invalid_api_key" in lower:
        return "invalid_api_key"
    
    # Rate limiting and quota errors
    if "quota" in lower or "resource exhausted" in lower or "rate limit" in lower or "too many requests" in lower or "429" in lower:
        return "quota_exceeded"
    
    # Content filtering errors
    if "safety" in lower or "blocked" in lower or "content" in lower and "policy" in lower:
        return "blocked"
    
    # Invalid request errors
    if "invalid argument" in lower or "invalid request" in lower or "bad request" in lower:
        return "invalid_request"
    
    # Service availability errors
    if "service unavailable" in lower or "temporarily unavailable" in lower or "timeout" in lower or "timed out" in lower:
        return "service_unavailable"
    
    return "unknown"


def _extract_status_code(exc):
    """
    Extract HTTP status code from exception for better error classification.
    """
    # Check common exception attributes
    for attr in ("status_code", "code", "status", "http_status"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
    
    # Try to extract from error message
    match = re.search(r"\b(4\d\d|5\d\d)\b", str(exc))
    return int(match.group(1)) if match else None


def generate_text(prompt, model_name=DEFAULT_MODEL, temperature=0.5, max_output_tokens=512):
    """
    Generate text using Groq API.
    """
    
    # Validate API key
    api_key = _get_api_key()
    print(f"[groq_service] Key present: {bool(api_key)}, Model: {model_name}")
    if not api_key:
        print("[groq_service] Error: missing_api_key")
        return "", "missing_api_key"
    
    # Sanitize and validate prompt
    prompt = _sanitize_prompt(prompt)
    if prompt is None:
        return "", "prompt_too_long"
    if not prompt:
        return "", "empty_prompt"
    
    try:
        # Initialize Groq client
        client = Groq(api_key=api_key)
        
        # Make API call with timeout for reliability
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_output_tokens,
            timeout=30.0  # 30 second timeout for reliability
        )
        
        # Extract text from response
        if response.choices and len(response.choices) > 0:
            text = response.choices[0].message.content
            if text and text.strip():
                print(f"[groq_service] Success, length: {len(text)}")
                return text.strip(), "ok"
            else:
                print("[groq_service] Error: empty_response")
                return "", "empty_response"
        else:
            print("[groq_service] Error: empty_response (no choices)")
            return "", "empty_response"
    
    except Exception as exc:
        # Comprehensive error handling with classification
        message = str(exc)
        error_code = _classify_error_message(message)
        status_code = _extract_status_code(exc)
        
        print(f"[groq_service] Groq API error: {type(exc).__name__}: {message}")
        
        # Refine error code based on HTTP status if available
        if error_code == "unknown" and status_code:
            if status_code in (401, 403):
                error_code = "invalid_api_key"
            elif status_code == 429:
                error_code = "quota_exceeded"
            elif status_code == 400:
                error_code = "invalid_request"
            elif status_code >= 500:
                error_code = "service_unavailable"
        
        print(f"[groq_service] Classified error: {error_code}")
        
        return "", error_code


def generate_vision_text(prompt, base64_image, model_name=VISION_MODEL, temperature=0.5, max_output_tokens=512):
    """
    Generate text analysis from an image using Groq Vision API.
    """
    api_key = _get_api_key()
    if not api_key:
        return "", "missing_api_key"
    
    try:
        # Check if the base64 string has the header and remove it if so
        if "," in base64_image:
            image_data = base64_image.split(",")[1]
        else:
            image_data = base64_image
            
        # Strip all whitespace and fix padding
        image_data = "".join(image_data.split())
        padding_needed = len(image_data) % 4
        if padding_needed == 1:
            image_data = image_data[:-1]
        elif padding_needed > 1:
            image_data += "=" * (4 - padding_needed)

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                            },
                        },
                    ],
                }
            ],
            temperature=temperature,
            max_tokens=max_output_tokens,
            timeout=30.0
        )
        
        if response.choices:
            return response.choices[0].message.content.strip(), "ok"
        return "", "empty_response"
    except Exception as exc:
        print(f"[groq_service] Vision error: {exc}")
        return "", _classify_error_message(str(exc))
