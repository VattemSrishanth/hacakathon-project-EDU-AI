# ai_engine.py
# PLACEHOLDER AI LOGIC FOR DEMO/HACKATHON PURPOSES
# This is a simple mock implementation that simulates AI responses without requiring external API keys.
# To integrate a real AI service (like OpenAI, Google AI, etc.), replace this logic with actual API calls.

def get_ai_response(question, online=True, mode="normal"):
    """
    Simulates AI teacher responses for educational purposes.
    
    Args:
        question: The student's question
        online: Whether the user is online (True) or offline (False)
        mode: Accessibility mode - "normal", "deaf", or "speech"
    
    Returns:
        A helpful educational response (mock AI behavior)
    """
    
    # Handle offline mode
    if not online:
        return "You're currently offline. Please continue with the lesson content available in your materials. Your questions will be answered when you're back online!"
    
    # Mock AI response generation based on question keywords
    question_lower = question.lower()
    
    # Simple keyword-based responses for common educational topics
    if any(word in question_lower for word in ["math", "add", "subtract", "multiply", "divide", "equation"]):
        base_response = "Great question about mathematics! Let me help you understand this concept. Start by breaking down the problem into smaller steps. Practice is key to mastering math skills."
    elif any(word in question_lower for word in ["science", "experiment", "biology", "chemistry", "physics"]):
        base_response = "Excellent science question! Understanding scientific concepts requires observation and experimentation. Let's explore this topic step by step to build your knowledge."
    elif any(word in question_lower for word in ["history", "war", "ancient", "civilization"]):
        base_response = "That's an interesting historical question! History helps us understand how societies developed. Let me guide you through the key events and their significance."
    elif any(word in question_lower for word in ["english", "grammar", "writing", "essay", "paragraph"]):
        base_response = "Good question about language! Clear communication is important. Focus on organizing your thoughts and expressing them clearly. Practice will improve your skills."
    elif any(word in question_lower for word in ["help", "how", "what", "why", "explain"]):
        base_response = "I'm here to help you learn! Let me break this down for you in a way that's easy to understand. Feel free to ask follow-up questions as we explore this together."
    else:
        base_response = "That's a thoughtful question! Learning is all about curiosity. Let me provide some guidance to help you understand this better and encourage further exploration."
    
    # Adapt response based on accessibility mode
    if mode == "deaf":
        # Simpler language suitable for captions
        base_response = base_response.replace("Let me help you understand", "I will explain simply")
        base_response = base_response.replace("Let's explore", "We will learn")
        base_response += " (Text optimized for reading)"
    elif mode == "speech":
        # Clear and direct for speech-impaired users using text input
        base_response = "Got your question! " + base_response + " Feel free to type more questions anytime."
    
    return base_response
