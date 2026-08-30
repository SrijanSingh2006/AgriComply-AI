import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# ==========================================
# ZERO-DEPLOYMENT: LOCAL SQLITE DATABASE
# ==========================================

# Initialize SQLAlchemy WITHOUT a bound app so that app.py can call
# db.init_app(app) without conflicts (application factory pattern)
db = SQLAlchemy()

# ==========================================
# DATABASE SCHEMA (TABLES)
# ==========================================
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='farmer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Profile(db.Model):
    __tablename__ = 'profiles'
    profile_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    turnover = db.Column(db.Float, default=0.0)
    employees = db.Column(db.Integer, default=0)
    gst_status = db.Column(db.String(50))
    existing_loans = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Document(db.Model):
    __tablename__ = 'documents'
    document_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    file_url = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text)
    masked_text = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

# ==========================================
# RUN THIS FILE DIRECTLY TO BUILD THE TABLES
# ==========================================
if __name__ == '__main__':
    import os
    from flask import Flask
    _app = Flask(__name__)
    basedir = os.path.abspath(os.path.dirname(__file__))
    _app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'agricomply.db')
    _app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(_app)
    with _app.app_context():
        db.create_all()
        print("✅ SUCCESS: Local SQLite database (agricomply.db) created successfully!")