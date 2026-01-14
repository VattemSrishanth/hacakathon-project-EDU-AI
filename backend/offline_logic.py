# offline_logic.py

offline_answers = {
    "fraction": "A fraction represents a part of a whole. Example: 1/2 means one out of two equal parts.",
    "addition": "Addition means combining two or more numbers."
}

def offline_response(question):
    question = question.lower()
    for key in offline_answers:
        if key in question:
            return offline_answers[key]
    return "Offline mode: Please check lesson content."
