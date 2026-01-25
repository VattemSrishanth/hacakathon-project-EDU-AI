
import os
from dotenv import load_dotenv
import unified_llm

load_dotenv(override=True)

def test_model_identity():
    question = "What is your model name and who created you?"
    print(f"--- Testing Model Identity ---")
    print(f"Question: {question}\n")
    
    # We want to see the debug prints from unified_llm
    response, error = unified_llm.generate_text(question)
    
    print(f"\nFINAL ERROR CODE: {error}")
    print("-" * 50)
    print(response)
    print("-" * 50)

if __name__ == "__main__":
    test_model_identity()
