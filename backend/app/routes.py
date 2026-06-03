from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json
import aiofiles
import uuid
from datetime import datetime

from .database import get_db, ResumeDB
from .parser import extract_text, parse_resume_with_ai, match_job_description

router = APIRouter()
UPLOAD_DIR = "uploads"

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse a resume"""
    
    # Validate file type
    allowed_types = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not supported. Use PDF, DOCX, or TXT.")
    
    # Save file
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    try:
        # Extract text
        raw_text = extract_text(file_path)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the file.")
        
        # Parse with AI
        parsed_data = parse_resume_with_ai(raw_text)
        
        # Save to database
        resume_db = ResumeDB(
            filename=file.filename,
            candidate_name=parsed_data.get("candidate_name", "Unknown"),
            email=parsed_data.get("email", ""),
            phone=parsed_data.get("phone", ""),
            location=parsed_data.get("location", ""),
            summary=parsed_data.get("summary", ""),
            skills=json.dumps(parsed_data.get("skills", {})),
            experience=json.dumps(parsed_data.get("experience", [])),
            education=json.dumps(parsed_data.get("education", [])),
            certifications=json.dumps(parsed_data.get("certifications", [])),
            languages=json.dumps(parsed_data.get("languages", [])),
            ai_score=parsed_data.get("ai_score", 0),
            ai_feedback=parsed_data.get("ai_feedback", ""),
            raw_text=raw_text[:5000]  # Store first 5000 chars
        )
        
        db.add(resume_db)
        db.commit()
        db.refresh(resume_db)
        
        return {
            "id": resume_db.id,
            "message": "Resume parsed successfully!",
            "data": parsed_data
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI parsing failed. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resumes")
def get_all_resumes(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all parsed resumes"""
    query = db.query(ResumeDB)
    
    if search:
        query = query.filter(
            ResumeDB.candidate_name.contains(search) |
            ResumeDB.skills.contains(search) |
            ResumeDB.location.contains(search)
        )
    
    resumes = query.offset(skip).limit(limit).all()
    
    result = []
    for r in resumes:
        result.append({
            "id": r.id,
            "filename": r.filename,
            "candidate_name": r.candidate_name,
            "email": r.email,
            "phone": r.phone,
            "location": r.location,
            "summary": r.summary,
            "skills": json.loads(r.skills) if r.skills else {},
            "experience": json.loads(r.experience) if r.experience else [],
            "education": json.loads(r.education) if r.education else [],
            "certifications": json.loads(r.certifications) if r.certifications else [],
            "languages": json.loads(r.languages) if r.languages else [],
            "ai_score": r.ai_score,
            "ai_feedback": r.ai_feedback,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    
    return {"resumes": result, "total": len(result)}

@router.get("/resumes/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get a specific resume by ID"""
    resume = db.query(ResumeDB).filter(ResumeDB.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "filename": resume.filename,
        "candidate_name": resume.candidate_name,
        "email": resume.email,
        "phone": resume.phone,
        "location": resume.location,
        "summary": resume.summary,
        "skills": json.loads(resume.skills) if resume.skills else {},
        "experience": json.loads(resume.experience) if resume.experience else [],
        "education": json.loads(resume.education) if resume.education else [],
        "certifications": json.loads(resume.certifications) if resume.certifications else [],
        "languages": json.loads(resume.languages) if resume.languages else [],
        "ai_score": resume.ai_score,
        "ai_feedback": resume.ai_feedback,
        "created_at": resume.created_at.isoformat() if resume.created_at else None
    }

@router.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    """Delete a resume"""
    resume = db.query(ResumeDB).filter(ResumeDB.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

@router.post("/match/{resume_id}")
async def match_resume(
    resume_id: int,
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):
    """Match a resume against a job description"""
    resume = db.query(ResumeDB).filter(ResumeDB.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume_data = {
        "skills": json.loads(resume.skills) if resume.skills else {},
        "experience": json.loads(resume.experience) if resume.experience else [],
        "education": json.loads(resume.education) if resume.education else [],
        "total_experience_years": 0
    }
    
    match_result = match_job_description(resume_data, job_description)
    return match_result

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total = db.query(ResumeDB).count()
    high_score = db.query(ResumeDB).filter(ResumeDB.ai_score >= 80).count()
    recent = db.query(ResumeDB).order_by(ResumeDB.created_at.desc()).limit(5).all()
    
    avg_score = 0
    if total > 0:
        scores = [r.ai_score for r in db.query(ResumeDB).all() if r.ai_score]
        avg_score = sum(scores) / len(scores) if scores else 0
    
    return {
        "total_resumes": total,
        "high_score_candidates": high_score,
        "average_score": round(avg_score, 1),
        "recent_uploads": [
            {"id": r.id, "name": r.candidate_name, "score": r.ai_score}
            for r in recent
        ]
    }


