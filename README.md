# 🚀 AI Resume Parser

An AI-powered Resume Parsing and Candidate Screening System that automatically extracts, organizes, and analyzes information from resumes using Claude AI.

## 📌 Overview

This project helps recruiters and HR teams automate resume screening by extracting structured information from PDF and DOCX resumes.

The system can:

- Upload resumes
- Extract candidate information using AI
- Parse skills, education, and experience
- Organize candidate data
- Score and evaluate candidates
- Display results through an interactive dashboard

---

## ✨ Features

📄 PDF & DOCX Resume Upload
🤖 Claude AI Integration
👤 Contact Information Extraction
💼 Work Experience Detection
🎓 Education Analysis
🛠️ Skills Extraction
📊 Candidate Scoring
🔍 Search & Filter Functionality
💾 Data Storage with SQLite
🎨 Modern Dashboard Interface

---

## 🖼️ Screenshots

### Dashboard

<img width="1917" height="1001" alt="image" src="https://github.com/user-attachments/assets/2f35b9b4-00e9-4468-b989-b51aa5db7455" />
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/4c955ecd-83e5-482e-87d0-c87b076ecda9" />

Main dashboard displaying candidate information and analytics.

### Resume Upload
<img width="1919" height="1023" alt="image" src="https://github.com/user-attachments/assets/f693fc8e-6bc1-4ade-9046-2313b21abeaf" />
Upload resumes for AI-powered parsing.

### Parsed Results
<img width="1917" height="1001" alt="image" src="https://github.com/user-attachments/assets/02995bc8-07be-4529-8f5e-9c441ed64b0c" />


Structured information extracted from resumes.

---

## 🏗️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### AI & Document Processing
- Claude AI API
- PyMuPDF
- Python-Docx

### Security
- JWT Authentication
- Passlib
- Bcrypt

---

## 📂 Project Structure

```bash
AI-RESUME-PARSER/
│
├── backend/
│   │
│   ├── app/
│   │   ├── database.py      # Database configuration
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── models.py        # SQLAlchemy database models
│   │   ├── parser.py        # Resume parsing & Claude AI integration
│   │   └── routes.py        # API routes
│   │
│   ├── uploads/            # Uploaded resume files
│   ├── .env                # Environment variables
│   ├── requirements.txt    # Python dependencies
│   └── resumes.db          # SQLite database
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ScoreCircle.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Candidates.jsx
│   │   │   └── CandidateDetail.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── dashboard.png
│   ├── upload.png
│   └── parsed-results.png
│
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/AI-Resume-Parser.git

cd AI-Resume-Parser
```

### 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv
```

Activate virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / Mac**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```bash
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend URL:

```bash
http://localhost:3000
```

---

## 🔄 Workflow
<img width="649" height="578" alt="image" src="https://github.com/user-attachments/assets/0d5f0847-5024-4949-8bbf-b08b6a34154f" />

---

## 🎯 Use Cases

- Resume Screening
- Recruitment Automation
- Candidate Evaluation
- HR Analytics
- Talent Acquisition
- Applicant Tracking

---

## 🔮 Future Enhancements

- Multi-Resume Processing
- Resume-to-Job Matching
- ATS Compatibility Analysis
- AI Candidate Summaries
- Interview Recommendations
- Cloud Deployment

---

## 📚 Learning Outcomes

Through this project, I gained experience in:

- Full-Stack Development
- FastAPI APIs
- React Development
- Claude AI Integration
- Resume Parsing Techniques
- Database Management
- Authentication Systems
- AI-Powered Applications

---

## 👨‍💻 Author

**Aarya Damera**
**2420030530cse@gmail.com**
