# ai_engine.py
from openai import OpenAI
from offline_logic import offline_response
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_response(question, online=True, mode="normal"):
    if not online:
        return offline_response(question)

    system_prompt = "You are a teacher."

    if mode == "deaf":
        system_prompt += " Explain using simple words suitable for captions."
    elif mode == "speech":
        system_prompt += " Respond clearly to text-only input."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=100
        )
        return response.choices[0].message.content
    except:
        return offline_response(question)
