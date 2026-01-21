# offline_logic.py
# SYLLABUS GUARANTEE: Offline fallback ensures NO blank responses for school topics

offline_answers = {
    # MATH
    "addition": "Addition means combining numbers together. Example: 2 + 3 = 5 (two apples plus three apples equals five apples).",
    "subtraction": "Subtraction means taking away. Example: 5 - 2 = 3 (five apples minus two apples equals three apples).",
    "multiplication": "Multiplication is repeated addition. Example: 3 × 4 = 12 (three groups of four equals twelve).",
    "division": "Division means splitting into equal groups. Example: 12 ÷ 3 = 4 (twelve items divided into 3 groups gives 4 per group).",
    "fraction": "A fraction shows a part of a whole. Example: 1/2 means one out of two equal parts (like half a pizza).",
    "decimal": "A decimal is another way to show fractions using a dot. Example: 0.5 = 1/2 (half).",
    "percentage": "A percentage is a number out of 100. Example: 50% means 50 out of 100 (half).",
    "algebra": "Algebra uses letters (like x) to represent unknown numbers. Example: x + 5 = 10 means x = 5.",
    "geometry": "Geometry studies shapes and space. Examples: squares, triangles, circles, and how they measure and fit together.",
    
    # SCIENCE
    "photosynthesis": "Photosynthesis is how plants make food using sunlight. Steps: 1) Leaves catch sunlight 2) Plant absorbs water and air 3) Plant produces sugar (food) and oxygen.",
    "atoms": "Atoms are tiny building blocks of all matter. Everything is made of atoms - you, water, rocks, air.",
    "elements": "Elements are pure substances made of one type of atom. Example: oxygen, hydrogen, carbon are elements.",
    "biology": "Biology is the study of living things: plants, animals, insects, and how they live and grow.",
    "chemistry": "Chemistry is about substances and reactions. Example: water (H2O) is made of hydrogen and oxygen atoms.",
    "physics": "Physics studies how things move and energy works. Example: gravity makes things fall down.",
    "ecosystem": "An ecosystem is where living things interact with nature. Example: forest with trees, animals, and soil.",
    
    # ENGLISH
    "grammar": "Grammar is the rules of how to write correctly. It covers subjects, verbs, and how words fit together in sentences.",
    "spelling": "Spelling means writing words correctly with the right letters in the right order. Practice: slowly say each sound in the word.",
    "vocabulary": "Vocabulary is the collection of words you know. Build it by reading and learning new words daily.",
    "comprehension": "Comprehension means understanding what you read. Steps: 1) Read carefully 2) Ask yourself questions 3) Summarize what you learned.",
    "punctuation": "Punctuation marks help organize writing. Period (.) ends sentences. Comma (,) separates ideas. Question mark (?) for questions.",
    "essay": "An essay is organized writing with: 1) Introduction (main idea) 2) Body (supporting details) 3) Conclusion (summary).",
}

def is_syllabus_question(question):
    """Check if question is within school syllabus scope."""
    if not question:
        return False
    question_lower = question.lower()
    return any(topic in question_lower for topic in offline_answers.keys())

def offline_response(question):
    """Return offline explanation for syllabus topics. NEVER returns empty."""
    if not question:
        return "Please ask a specific question about Math, Science, or English."
    
    question_lower = question.lower()
    
    # Exact match first
    for key, answer in offline_answers.items():
        if key in question_lower:
            return answer
    
    # Default fallback for valid syllabus questions
    return "This is a school topic. Please review your lesson notes or ask your teacher for more details. For specific topics like Math, Science, or English fundamentals, I can help explain them."
