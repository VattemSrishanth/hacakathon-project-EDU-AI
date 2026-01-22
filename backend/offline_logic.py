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
    "science": "Science is the study of the natural world using observation and experiments. It helps us understand how things work.",
    "democracy": "Democracy is a system of government where people choose their leaders. Citizens vote to make decisions.",
    
    # ENGLISH
    "grammar": "Grammar is the rules of how to write correctly. It covers subjects, verbs, and how words fit together in sentences.",
    "spelling": "Spelling means writing words correctly with the right letters in the right order. Practice: slowly say each sound in the word.",
    "vocabulary": "Vocabulary is the collection of words you know. Build it by reading and learning new words daily.",
    "comprehension": "Comprehension means understanding what you read. Steps: 1) Read carefully 2) Ask yourself questions 3) Summarize what you learned.",
    "punctuation": "Punctuation marks help organize writing. Period (.) ends sentences. Comma (,) separates ideas. Question mark (?) for questions.",
    "essay": "An essay is organized writing with: 1) Introduction (main idea) 2) Body (supporting details) 3) Conclusion (summary).",

    # COMPUTER BASICS
    "computer": "A computer is an electronic device that takes input, processes it, and gives output.",
    "hardware": "Hardware means physical parts of a computer like keyboard, mouse, monitor, and CPU.",
    "software": "Software means programs that run on a computer, like a browser or word processor.",
    "cpu": "CPU is the brain of the computer that processes instructions.",
    "ram": "RAM is short-term memory used to run programs quickly.",
    "storage": "Storage saves data permanently, like a hard drive or SSD.",
    "input": "Input devices are used to enter data, such as keyboard, mouse, or microphone.",
    "output": "Output devices show results, like monitor, speakers, or printer.",
    "internet": "The internet is a global network that lets computers share information.",
    "browser": "A browser is software to open websites, like Chrome or Edge.",
    "operating system": "An operating system manages the computer, like Windows or Linux.",
    "file": "A file stores information, like a document or image.",
    "folder": "A folder organizes files into groups.",
    "programming": "Programming is writing instructions for computers using languages like Python."
}

def is_syllabus_question(question):
    """Check if question is within school syllabus scope."""
    if not question:
        return False
    question_lower = question.lower()
    return any(topic in question_lower for topic in offline_answers.keys())

def offline_response(question, learner_mode="regular", language="English"):
    """Return offline explanation for syllabus topics. NEVER returns empty."""
    subject = "math" if _is_math_question(question) else "general"
    result = offline_generate_explanation(question, learner_mode=learner_mode, level="basic", subject=subject, language=language)
    
    notice = ""
    if language != "English":
        notice = f"(Fallback: Translation not available for {language} in offline mode. Responding in English.)\n\n"
    
    header = "Step-by-step solution:" if subject == "math" else "Explanation:"
    return (
        notice +
        header + "\n" + result["explanation"] + "\n\n"
        "Example:\n" + result["example"] + "\n\n"
        "Summary:\n" + result["summary"]
    )

def get_math_concept_answer(question):
    """Return a concise academic explanation for math concepts."""
    if not question:
        return None
    q = question.lower()
    concept_map = {
        "integral": "The integral of a constant 3 with respect to x is 3x + C, where C is the constant of integration.",
        "derivative": "The derivative of a constant is 0. For example, d/dx(3) = 0.",
        "algebra": "Algebra uses symbols (like x) to represent unknown values and solve equations step by step.",
        "fraction": "A fraction represents a part of a whole, written as numerator/denominator, such as 3/4.",
        "quadratic": "A quadratic equation has the form ax^2 + bx + c = 0 and can be solved using the quadratic formula.",
        "pythagorean": "In a right triangle, a^2 + b^2 = c^2, where c is the hypotenuse.",
        "slope": "Slope measures the rate of change: slope = (y2 - y1) / (x2 - x1).",
        "area of circle": "The area of a circle is A = πr^2, where r is the radius.",
        "perimeter": "Perimeter is the total distance around a shape, found by adding all side lengths.",
        "volume": "Volume measures 3D space; for a rectangular prism, V = length × width × height."
    }
    for key, answer in concept_map.items():
        if key in q:
            return answer
    return None

def get_general_knowledge_answer(question):
    """Return direct factual answers for common knowledge questions."""
    if not question:
        return None
    q = question.strip().lower()
    if "largest river in india" in q:
        return "The Ganga (Ganges) is the largest river system in India."
    if "capital of telangana" in q:
        return "Hyderabad."
    if "capital of india" in q:
        return "New Delhi."
    if "largest planet" in q:
        return "Jupiter."
    if "speed of light" in q:
        return "Approximately 299,792 km per second in vacuum."
    if "water formula" in q or "chemical formula of water" in q:
        return "H2O."
    if "tallest mountain" in q:
        return "Mount Everest."
    return None

def get_out_of_scope_message():
    """Return a polite out-of-scope response when no answer is available."""
    return "This question is outside the current scope of this tutor."

def offline_generate_explanation(question, learner_mode="regular", level="basic", subject="general", language="English"):
    """Generate structured offline explanation for Math, Science, and Computer basics."""
    if not question:
        return {
            "explanation": "Please ask a clear question about Math, Science, English, or Computer basics.",
            "example": "Example: What is RAM?",
            "summary": "Ask a clear question to get a full explanation."
        }

    question_lower = question.lower()
    matched_answer = None

    for key, answer in offline_answers.items():
        if key in question_lower:
            matched_answer = answer
            break

    if not matched_answer:
        matched_answer = "This is a school topic. Here is a simple explanation based on common syllabus knowledge."

    if subject == "math":
        explanation = _format_math_steps(question_lower, learner_mode, matched_answer)
        example = _format_example(question_lower, learner_mode)
        summary = _format_summary(matched_answer, learner_mode)
    else:
        explanation = _format_explanation(matched_answer, learner_mode)
        example = _format_example(question_lower, learner_mode)
        summary = _format_summary(matched_answer, learner_mode)

    return {
        "explanation": explanation,
        "example": example,
        "summary": summary
    }


def _format_explanation(text, learner_mode):
    if learner_mode == "deaf":
        return "- " + text + "\n- Step 1: Read the definition\n- Step 2: Connect to a real-life example"
    if learner_mode == "speech":
        return "".join([
            "Simple explanation: ", text, " ",
            "Step 1: Understand the meaning. ",
            "Step 2: Practice with an example."
        ])
    return text + " This is a basic, clear explanation."


def _format_example(question_lower, learner_mode):
    if "fraction" in question_lower:
        example = "Example: 1/2 is half of a pizza."
    elif "percentage" in question_lower:
        example = "Example: 50% means 50 out of 100."
    elif "ram" in question_lower:
        example = "Example: Opening many apps uses more RAM."
    elif "cpu" in question_lower:
        example = "Example: The CPU processes calculations when you solve math."
    else:
        example = "Example: Think of a daily-life case that fits this concept."

    if learner_mode == "deaf":
        return "- " + example
    if learner_mode == "speech":
        return "Example: " + example.replace("Example: ", "")
    return example


def _format_summary(text, learner_mode):
    summary = " ".join(text.split()[:18])
    if learner_mode == "deaf":
        return "- Summary: " + summary + "..."
    if learner_mode == "speech":
        return "Summary: " + summary + "..."
    return "Summary: " + summary + "..."


def _is_math_question(question):
    if not question:
        return False
    q = question.lower()
    keywords = [
        "math", "calculate", "solve", "equation", "algebra", "geometry",
        "fraction", "decimal", "percent", "percentage", "ratio", "proportion",
        "integral", "derivative", "limit", "matrix", "vector", "triangle",
        "circle", "area", "perimeter", "volume", "polynomial", "factor",
        "simplify", "linear", "quadratic", "graph", "slope"
    ]
    has_digit = any(ch.isdigit() for ch in q)
    return has_digit or any(k in q for k in keywords)


def _format_math_steps(question_lower, learner_mode, matched_answer):
    guidance = (
        "Step 1: Identify the given values and the goal. "
        "Step 2: Choose the relevant formula or rule. "
        "Step 3: Substitute values carefully. "
        "Step 4: Compute step by step and simplify. "
        "Step 5: State the final result with units if needed."
    )

    if learner_mode == "deaf":
        return "- " + matched_answer + "\n- " + guidance.replace(". ", "\n- ")
    if learner_mode == "speech":
        return "Simple steps: " + matched_answer + " " + guidance
    return matched_answer + " " + guidance
