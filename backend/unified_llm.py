"""
Unified LLM Service with Resilient Fallback
-------------------------------------------
Primary LLM: Groq (via groq_service.py)
Backup LLM: Google Gemini (via llm_service.py)

This module implements a resilient fallback mechanism. If Groq fails 
(due to API issues or service unavailability), the system 
automatically switches to Gemini to ensure uninterrupted service for learners.
"""

import llm_service
import groq_service
import time

def generate_text(prompt, temperature=0.5, max_output_tokens=512, **kwargs):
    """
    Generates text using the primary LLM (Groq) with automatic retry and switch to Gemini.
    
    Returns:
        tuple: (generated_text, error_code)
    """
    # 1. Attempt Primary Provider: Groq
    print(f"[unified_llm] --- NEW REQUEST ---")
    
    max_retries = 1
    text, error_code = "", "unknown"
    
    for attempt in range(max_retries + 1):
        print(f"[unified_llm] Attempting Groq (Attempt {attempt + 1})...")
        text, error_code = groq_service.generate_text(
            prompt, 
            temperature=temperature, 
            max_output_tokens=max_output_tokens
        )
        
        if error_code == "ok":
            print("[unified_llm] Groq success.")
            return text, "ok"
            
        if error_code == "quota_exceeded" and attempt < max_retries:
            print("[unified_llm] Groq rate limit reached. Retrying in 2 seconds...")
            time.sleep(2)
            continue
        break

    # Define error codes that should trigger a fallback to Gemini
    SHOULD_FALLBACK = [
        "quota_exceeded", 
        "service_unavailable", 
        "invalid_api_key", 
        "missing_api_key",
        "empty_response", 
        "unknown",
        "blocked"
    ]
    
    # 2. Determine if Fallback is Necessary
    if error_code in SHOULD_FALLBACK:
        print(f"[unified_llm] Groq failed with code: {error_code}. Silently switching to Gemini...")
        
        # 3. Attempt Backup Provider: Gemini
        fallback_text, fallback_error = llm_service.generate_text(
            prompt,
            temperature=temperature,
            max_output_tokens=max_output_tokens
        )
        
        if fallback_error == "ok":
            print("[unified_llm] Gemini fallback successful. Result from Gemini.")
            return fallback_text, "ok"
        else:
            print(f"[unified_llm] Gemini fallback also failed: {fallback_error}")
            return fallback_text, fallback_error
            
    # 3. If Groq succeeded
    if error_code == "ok":
        print("[unified_llm] Groq success. Result from Llama-3.")
    else:
        print(f"[unified_llm] Groq returned non-fallback error code: {error_code}")
        
    return text, error_code

def generate_vision_text(prompt, image_data, **kwargs):
    """
    Generates text based on an image using Groq Vision.
    (Currently primary due to robust vision support in groq_service.py)
    """
    # Currently, we prioritize Groq for vision as it's already integrated in the engine
    return groq_service.generate_vision_text(prompt, image_data, **kwargs)
