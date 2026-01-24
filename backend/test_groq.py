
import os
import sys
from groq_service import generate_text

def test_groq_integration():
    print("Testing Groq Integration...")
    
    test_prompt = "Explain photosynthesis in simple terms for a student."
    print(f"Prompt: {test_prompt}")
    
    text, error_code = generate_text(test_prompt)
    
    if error_code == "ok":
        print("\nSUCCESS!")
        print("-" * 20)
        print(text)
        print("-" * 20)
    else:
        print(f"\nFAILED with error code: {error_code}")
        print("Please check your GROQ_API_KEY in backend/.env")

if __name__ == "__main__":
    test_groq_integration()
