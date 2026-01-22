from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    accessibility_mode = db.Column(db.String(20), nullable=False, default="regular")
    preferred_language = db.Column(db.String(20), nullable=False, default="en")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_public_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "accessibility_mode": self.accessibility_mode,
            "preferred_language": self.preferred_language
        }
