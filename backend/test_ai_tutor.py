import requests
import json

url = "http://127.0.0.1:5000/api/ask"
payload = {
    "question": "What is photosynthesis?",
    "online": True,
    "mode": "regular"
}

print("Testing AI Tutor with Groq integration...")
print("="*50)

try:
    response = requests.post(url, json=payload, timeout=30)
    result = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Success: {result.get('success')}")
    print(f"Status: {result.get('status')}")
    print(f"Mode: {result.get('mode')}")
    print("="*50)
    print("Answer:")
    print(result.get('answer', 'No answer'))
    print("="*50)
    
    if result.get('success') and result.get('mode') == 'online':
        print("✅ Groq integration working!")
    else:
        print("⚠️ Using offline mode or error occurred")
        
except Exception as e:
    print(f"❌ Error: {e}")
