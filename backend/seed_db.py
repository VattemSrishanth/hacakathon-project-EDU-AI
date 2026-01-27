from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/edu_ai")
client = MongoClient(MONGO_URI)
db = client.get_database()

LESSONS = [
    {
        "title": "Introduction to Algebra",
        "description": "Learn the basics of variables, equations, and solving for x.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "Mathematics",
        "topics": ["Variables", "Equations", "Basic Arithmetic"],
        "pdf_path": "algebra_intro.pdf"
    },
    {
        "title": "World History: Ancient Civilizations",
        "description": "Explore the rise and fall of great ancient civilizations like Egypt and Rome.",
        "duration": "60 mins",
        "level": "Intermediate",
        "category": "History",
        "topics": ["Egypt", "Rome", "Mesopotamia"],
        "pdf_path": "ancient_civ.pdf"
    },
    {
        "title": "English Grammar Essentials",
        "description": "Master parts of speech, sentence structure, and common grammar rules.",
        "duration": "40 mins",
        "level": "Beginner",
        "category": "English",
        "topics": ["Nouns", "Verbs", "Sentences", "Punctuation"],
        "pdf_path": "english_grammar.pdf"
    },
    {
        "title": "Programming Fundamentals",
        "description": "Learn the basics of logic, loops, and variables in programming.",
        "duration": "35 mins",
        "level": "Beginner",
        "category": "Computer Science",
        "topics": ["Logic", "Loops", "Variables", "Functions"],
        "pdf_path": "programming_fundamentals.pdf"
    },
    {
        "title": "Fractions and Decimals",
        "description": "Learn about fractions, decimals, and how to convert between them.",
        "duration": "50 mins",
        "level": "Intermediate",
        "category": "Mathematics",
        "topics": ["Fractions", "Decimals", "Percentages"],
        "pdf_path": "fractions_decimals.pdf"
    },
    {
        "title": "The Solar System",
        "description": "Explore our solar system, planets, moons, and celestial bodies.",
        "duration": "55 mins",
        "level": "Intermediate",
        "category": "Science",
        "topics": ["Planets", "Sun", "Moon", "Space"],
        "pdf_path": "solar_system.pdf"
    },
    {
        "title": "Reading Comprehension",
        "description": "Improve your reading skills and learn to understand written texts better.",
        "duration": "45 mins",
        "level": "Beginner",
        "category": "English",
        "topics": ["Reading", "Vocabulary", "Comprehension"],
        "pdf_path": "reading_comp.pdf"
    },
    {
        "title": "Introduction to Programming",
        "description": "Learn the basics of programming with simple examples and concepts.",
        "duration": "60 mins",
        "level": "Intermediate",
        "category": "Computer Science",
        "topics": ["Logic", "Variables", "Loops", "Conditions"]
    }
]

def seed_lessons():
    print("Seeding lessons...")
    db.courses.delete_many({})  # Clear existing
    db.courses.insert_many(LESSONS)
    print(f"Inserted {len(LESSONS)} lessons.")

if __name__ == "__main__":
    seed_lessons()
