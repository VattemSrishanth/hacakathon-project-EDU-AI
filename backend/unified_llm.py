"""
Unified LLM Service with Resilient Fallback
-------------------------------------------
Primary LLM: Google Gemini (via llm_service.py)
Backup LLM: Groq (via groq_service.py)

This module implements a resilient fallback mechanism. If Gemini fails 
(due to quota limits, API issues, or service unavailability), the system 
automatically switches to Groq to ensure uninterrupted service for learners.
"""

import llm_service
import groq_service

def generate_text(prompt, temperature=0.5, max_output_tokens=512, **kwargs):
    """
    Generates text using the primary LLM (Gemini) with automatic fallback to Groq.
    
    Returns:
        tuple: (generated_text, error_code)
    """
    # 1. Attempt Primary Provider: Google Gemini
    print(f"[unified_llm] --- NEW REQUEST ---")
    print("[unified_llm] Attempting Primary Provider: Gemini...")
    text, error_code = llm_service.generate_text(
        prompt, 
        temperature=temperature, 
        max_output_tokens=max_output_tokens
    )
    
    # Define error codes that should trigger a fallback
    # We fallback on transient errors or configuration issues
    SHOULD_FALLBACK = [
        "quota_exceeded", 
        "service_unavailable", 
        "invalid_api_key", 
        "missing_api_key",
        "empty_response", 
        "unknown"
    ]
    
    # 2. Determine if Fallback is Necessary
    if error_code in SHOULD_FALLBACK:
        print(f"[unified_llm] Gemini failed with code: {error_code}. Falling back to Groq...")
        
        # 3. Attempt Backup Provider: Groq
        fallback_text, fallback_error = groq_service.generate_text(
            prompt,
            temperature=temperature,
            max_output_tokens=max_output_tokens
        )
        
        if fallback_error == "ok":
            print("[unified_llm] Groq fallback successful. Result from Groq (Llama).")
            return fallback_text, "ok"
        else:
            print(f"[unified_llm] Groq fallback also failed: {fallback_error}")
            return fallback_text, fallback_error
            
    # 3. If Gemini succeeded
    if error_code == "ok":
        print("[unified_llm] Gemini success. Result from Gemini-Flash.")
    else:
        print(f"[unified_llm] Gemini returned non-fallback error code: {error_code}")
        
    return text, error_code

def generate_vision_text(prompt, image_data, **kwargs):
    """
    Generates text based on an image using Groq Vision.
    (Currently primary due to robust vision support in groq_service.py)
    """
    # Currently, we prioritize Groq for vision as it's already integrated in the engine
    return groq_service.generate_vision_text(prompt, image_data, **kwargs)
