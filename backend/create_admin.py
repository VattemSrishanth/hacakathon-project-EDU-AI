from pymongo import MongoClient
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/edu_ai")
client = MongoClient(MONGO_URI)
db = client.get_database()

def create_admin():
    admin_data = {
        "username": "admin",
        "email": "admin@eduai.com",
        "password_hash": generate_password_hash("admin@eduai123"),
        "role": "admin",
        "accessibility_mode": "regular",
        "preferred_language": "en"
    }
    
    # Check if exists
    if db.users.find_one({"username": "admin"}):
        print("Admin already exists.")
        return

    result = db.users.insert_one(admin_data)
    print(f"Admin created with ID: {result.inserted_id}")

if __name__ == "__main__":
    create_admin()
