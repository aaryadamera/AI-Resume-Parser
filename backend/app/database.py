from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resumes.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ResumeDB(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    candidate_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(100))
    location = Column(String(255))
    summary = Column(Text)
    skills = Column(Text)           # JSON string
    experience = Column(Text)       # JSON string
    education = Column(Text)        # JSON string
    certifications = Column(Text)   # JSON string
    languages = Column(Text)        # JSON string
    ai_score = Column(Float, default=0.0)
    ai_feedback = Column(Text)
    raw_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        