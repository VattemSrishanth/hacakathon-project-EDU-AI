from datetime import datetime, date, timedelta
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash


class MongoModel:
    """Base class for MongoDB models to provide common logic."""
    collection = None

    @classmethod
    def find_by_id(cls, id):
        try:
            if isinstance(id, str):
                id = ObjectId(id)
            return cls.collection.find_one({"_id": id})
        except Exception:
            return None

    @classmethod
    def find_one(cls, query):
        return cls.collection.find_one(query)

    @classmethod
    def find_all(cls, query=None, sort=None, limit=0):
        cursor = cls.collection.find(query or {})
        if sort:
            cursor = cursor.sort(sort)
        if limit > 0:
            cursor = cursor.limit(limit)
        return list(cursor)

    @classmethod
    def create(cls, data):
        data["created_at"] = datetime.utcnow()
        result = cls.collection.insert_one(data)
        return result.inserted_id

    @classmethod
    def update(cls, id, data):
        try:
            if isinstance(id, str):
                id = ObjectId(id)
            data["updated_at"] = datetime.utcnow()
            return cls.collection.update_one({"_id": id}, {"$set": data})
        except Exception:
            return None

    @classmethod
    def delete(cls, id):
        try:
            if isinstance(id, str):
                id = ObjectId(id)
            return cls.collection.delete_one({"_id": id})
        except Exception:
            return None

    @staticmethod
    def format_doc(doc):
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    @staticmethod
    def format_list(docs):
        return [MongoModel.format_doc(doc) for doc in docs]


def init_mongo_models(mongo_db):
    """Initialize collections for all models."""
    db = mongo_db.db
    User.collection = db.users
    Profile.collection = db.profiles
    Course.collection = db.courses
    ChatHistory.collection = db.chat_history
    Progress.collection = db.progress
    Assignment.collection = db.assignments
    Notification.collection = db.notifications
    Feedback.collection = db.feedback
    OfflineSync.collection = db.offline_sync
    LoginStreak.collection = db.login_streaks


class User(MongoModel):
    collection = None
    # Fields: username, email, password_hash, role, accessibility_mode, preferred_language

    @staticmethod
    def set_password(password):
        return generate_password_hash(password)

    @staticmethod
    def check_password(password_hash, password):
        return check_password_hash(password_hash, password)

    @classmethod
    def to_public_dict(cls, user_doc):
        if not user_doc:
            return {}
        return {
            "id": str(user_doc["_id"]),
            "username": user_doc.get("username"),
            "email": user_doc.get("email"),
            "role": user_doc.get("role", "user"),
            "accessibility_mode": user_doc.get("accessibility_mode", "regular"),
            "preferred_language": user_doc.get("preferred_language", "en")
        }


class Profile(MongoModel):
    collection = None
    # user_id, full_name, disability_type, content_format, font_size, theme, voice_settings


class Course(MongoModel):
    collection = None
    # title, class_level, subject, chapter, topics [], content_links {}


class ChatHistory(MongoModel):
    collection = None
    # user_id, question, answer, type, timestamp


class Progress(MongoModel):
    collection = None
    # user_id, lessons_completed [], quiz_scores [], time_spent, weak_areas [], strong_areas []


class Assignment(MongoModel):
    collection = None
    # course_id, title, description, questions [], due_date, submissions []


class Notification(MongoModel):
    collection = None
    # user_id, title, message, type, is_read, timestamp


class Feedback(MongoModel):
    collection = None
    # user_id, type (feedback/issue/suggestion), comment, rating


class OfflineSync(MongoModel):
    collection = None
    # user_id, pending_actions [], last_sync


class LoginStreak(MongoModel):
    collection = None
    # Tracks daily login streaks per user

    @classmethod
    def touch(cls, user_id):
        """Update streak for today's login and return the streak document."""
        today = date.today()
        today_str = today.isoformat()

        doc = cls.find_one({"user_id": str(user_id)})

        if not doc:
            doc = {
                "user_id": str(user_id),
                "join_date": today_str,
                "last_login_date": today_str,
                "current_streak": 1,
                "longest_streak": 1,
                "login_dates": [today_str],
            }
            new_id = cls.create(doc)
            doc["_id"] = new_id
        else:
            last_login_str = doc.get("last_login_date")
            if last_login_str != today_str:
                try:
                    last_login_date = date.fromisoformat(last_login_str) if last_login_str else None
                except Exception:
                    last_login_date = None

                is_consecutive = last_login_date == today - timedelta(days=1) if last_login_date else False
                doc["current_streak"] = doc.get("current_streak", 1) + 1 if is_consecutive else 1
                doc["longest_streak"] = max(doc.get("longest_streak", 1), doc["current_streak"])
                doc["last_login_date"] = today_str

            if today_str not in doc.get("login_dates", []):
                doc.setdefault("login_dates", []).append(today_str)

            cls.update(doc.get("_id"), doc)

        return {
            "user_id": doc.get("user_id"),
            "join_date": doc.get("join_date"),
            "last_login_date": doc.get("last_login_date"),
            "current_streak": doc.get("current_streak", 1),
            "longest_streak": doc.get("longest_streak", 1),
            "login_dates": doc.get("login_dates", []),
        }
