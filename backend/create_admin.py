from pymongo import MongoClient
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/edu_ai")
client = MongoClient(MONGO_URI)
db = client.get_database()

def create_admin(username, email, password):
    admin_data = {
        "username": username,
        "email": email,
        "password_hash": generate_password_hash(password),
        "role": "admin",
        "accessibility_mode": "regular",
        "preferred_language": "en"
    }
    
    # Check if exists
    if db.users.find_one({"username": username}):
        print(f"Admin '{username}' already exists.")
        return

    result = db.users.insert_one(admin_data)
    print(f"Admin '{username}' created with ID: {result.inserted_id}")

if __name__ == "__main__":
    create_admin("admin", "admin@eduai.com", "admin@eduai123")
    create_admin("admin2", "admin2@eduai.com", "admin2@eduai123")
    create_admin("admin3", "admin3@eduai.com", "admin3@eduai123")
    create_admin("admin4", "admin4@eduai.com", "admin4@eduai123")