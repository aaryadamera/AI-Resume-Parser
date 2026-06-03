import os
import re
import json
import fitz
import docx
import spacy
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)

nlp = spacy.load("en_core_web_sm")

SKILLS_DATABASE = [
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php",
    "swift", "kotlin", "go", "rust", "scala", "r", "matlab", "perl",
    "react", "angular", "vue", "nodejs", "express", "django", "flask",
    "fastapi", "spring", "laravel", "rails", "asp.net",
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
    "elasticsearch", "cassandra", "dynamodb",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "git", "github", "gitlab", "bitbucket", "ci/cd",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "html", "css", "sass", "tailwind", "bootstrap", "jquery",
    "rest api", "graphql", "microservices", "agile", "scrum",
    "linux", "unix", "bash", "powershell",
    "figma", "photoshop", "illustrator", "sketch",
    "excel", "powerpoint", "tableau", "power bi",
    "communication", "leadership", "teamwork", "problem solving",
    "project management", "time management", "critical thinking"
]

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def extract_text(file_path: str) -> str:
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(('.docx', '.doc')):
        return extract_text_from_docx(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

def extract_email(text: str) -> str:
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(pattern, text)
    return matches[0] if matches else ""

def extract_phone(text: str) -> str:
    pattern = r'(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})'
    matches = re.findall(pattern, text)
    for match in matches:
        digits = re.sub(r'\D', '', match)
        if 8 <= len(digits) <= 15:
            return match
    return ""

def extract_name(text: str) -> str:
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    lines = text.strip().split('\n')
    for line in lines[:5]:
        line = line.strip()
        if 2 <= len(line.split()) <= 4 and line.replace(' ', '').isalpha():
            return line
    return "Unknown"

def extract_location(text: str) -> str:
    doc = nlp(text[:1000])
    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC"]:
            return ent.text
    return ""

def extract_skills(text: str) -> dict:
    text_lower = text.lower()
    technical = []
    soft = []
    tools = []
    programming = []

    prog_langs = ["python", "java", "javascript", "typescript", "c++", "c#",
                  "ruby", "php", "swift", "kotlin", "go", "rust", "scala", "r"]
    tool_list = ["git", "docker", "kubernetes", "jenkins", "aws", "azure",
                 "gcp", "figma", "photoshop", "tableau", "power bi", "excel"]
    soft_list = ["communication", "leadership", "teamwork", "problem solving",
                 "project management", "time management", "critical thinking",
                 "collaboration", "adaptability", "creativity"]

    for skill in SKILLS_DATABASE:
        if skill in text_lower:
            if skill in prog_langs:
                programming.append(skill.title())
            elif skill in tool_list:
                tools.append(skill.title())
            elif skill in soft_list:
                soft.append(skill.title())
            else:
                technical.append(skill.title())

    return {
        "technical": list(set(technical)),
        "soft": list(set(soft)),
        "tools": list(set(tools)),
        "languages_programming": list(set(programming))
    }

def extract_experience(text: str) -> list:
    experience = []
    lines = text.split('\n')

    education_keywords = [
        "bachelor", "master", "phd", "doctorate", "b.sc", "m.sc",
        "b.tech", "m.tech", "mba", "b.e", "m.e", "diploma",
        "university", "college", "institute", "school", "cgpa",
        "gpa", "10th", "12th", "ssc", "hsc", "intermediate",
        "undergraduate", "postgraduate", "degree", "graduation",
        "computer science and engineering", "cse", "ece", "eee",
        "mechanical", "civil", "electronics"
    ]

    experience_section_headers = [
        "experience", "internship", "work history", "employment",
        "professional experience", "work experience", "career"
    ]

    education_section_headers = [
        "education", "academic", "qualification", "schooling",
        "educational background", "academic background"
    ]

    other_stop_headers = [
        "skills", "projects", "certifications", "achievements",
        "activities", "extracurricular", "languages", "interests",
        "hobbies", "references", "declaration", "objective", "summary"
    ]

    job_titles = [
        "engineer", "developer", "manager", "analyst", "designer",
        "consultant", "director", "lead", "architect", "specialist",
        "coordinator", "associate", "intern", "officer", "executive",
        "trainee", "researcher", "scientist", "administrator", "head"
    ]

    date_pattern = r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\s,]*\d{4}'

    in_experience_section = False
    experience_start = -1
    experience_end = len(lines)

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if not line_lower:
            continue
        is_exp_header = any(h in line_lower for h in experience_section_headers) and len(line_lower) < 40
        is_edu_header = any(h in line_lower for h in education_section_headers) and len(line_lower) < 40
        is_stop_header = any(h in line_lower for h in other_stop_headers) and len(line_lower) < 40

        if is_exp_header:
            in_experience_section = True
            experience_start = i + 1
        elif in_experience_section and (is_edu_header or is_stop_header):
            experience_end = i
            break

    if experience_start == -1:
        experience_start = 0
        experience_end = len(lines)

    relevant_lines = lines[experience_start:experience_end]

    current_exp = None
    for i, line in enumerate(relevant_lines):
        line_lower = line.lower().strip()
        if not line_lower:
            continue

        if any(edu_kw in line_lower for edu_kw in education_keywords):
            continue

        has_job_title = any(title in line_lower for title in job_titles)
        has_date = bool(re.search(date_pattern, line_lower))
        is_bullet = line.strip().startswith(('•', '-', '*', '→', '◦', '▪'))

        if has_job_title and len(line.strip()) < 90 and not is_bullet:
            if current_exp:
                experience.append(current_exp)
            company = ""
            for j in range(i + 1, min(i + 3, len(relevant_lines))):
                next_line = relevant_lines[j].strip()
                next_lower = next_line.lower()
                if next_line and not any(edu_kw in next_lower for edu_kw in education_keywords):
                    if not re.search(date_pattern, next_lower) and len(next_line) < 80:
                        company = next_line
                        break
            current_exp = {
                "title": line.strip(),
                "company": company,
                "duration": "",
                "description": "",
                "achievements": []
            }
        elif has_date and current_exp and not current_exp["duration"]:
            current_exp["duration"] = line.strip()
        elif is_bullet and current_exp:
            clean = line.strip().lstrip('•-*→◦▪ ').strip()
            if clean and len(clean) > 8:
                current_exp["achievements"].append(clean)
        elif current_exp and not current_exp["description"] and len(line.strip()) > 25 and not is_bullet:
            if not any(edu_kw in line_lower for edu_kw in education_keywords):
                current_exp["description"] = line.strip()

    if current_exp:
        experience.append(current_exp)

    filtered = []
    for exp in experience:
        title_lower = exp.get("title", "").lower()
        company_lower = exp.get("company", "").lower()
        if not any(edu_kw in title_lower for edu_kw in education_keywords):
            if not any(edu_kw in company_lower for edu_kw in education_keywords):
                filtered.append(exp)

    for exp in filtered:
        cleaned = []
        for ach in exp.get("achievements", []):
            if len(ach) > 120:
                ach = ach[:117] + "..."
            cleaned.append(ach)
        exp["achievements"] = cleaned[:4]
        if exp.get("description") and len(exp["description"]) > 150:
            exp["description"] = exp["description"][:147] + "..."

    return filtered[:6]


def extract_education(text: str) -> list:
    education = []
    lines = text.split('\n')

    degree_keywords = ["bachelor", "master", "phd", "doctorate", "b.sc", "m.sc",
                       "b.tech", "m.tech", "mba", "b.e", "m.e", "diploma",
                       "undergraduate", "postgraduate", "degree", "b.tech", "be",
                       "computer science", "engineering"]

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in degree_keywords):
            edu = {
                "degree": line.strip(),
                "institution": "",
                "field": "",
                "year": "",
                "gpa": ""
            }

            search_range = lines[max(0, i-2):min(len(lines), i+6)]
            for nearby in search_range:
                nearby_lower = nearby.lower()

                year_match = re.search(r'\b(19|20)\d{2}\b', nearby)
                if year_match and not edu["year"]:
                    edu["year"] = year_match.group()

                gpa_match = re.search(r'(?:cgpa|gpa|c\.g\.p\.a)[:\s]*(\d+\.?\d*)', nearby_lower)
                if gpa_match and not edu["gpa"]:
                    edu["gpa"] = gpa_match.group(1)

                if not edu["gpa"]:
                    score_match = re.search(r'(\d+\.\d+)\s*/\s*10', nearby)
                    if score_match:
                        edu["gpa"] = score_match.group(1)

                inst_keywords = ["university", "college", "institute", "school", "iit", "nit", "bits"]
                if any(k in nearby_lower for k in inst_keywords) and not edu["institution"]:
                    edu["institution"] = nearby.strip()

            if not edu["institution"] and i + 1 < len(lines):
                edu["institution"] = lines[i+1].strip()

            education.append(edu)

    seen = set()
    unique = []
    for e in education:
        key = e["degree"][:30]
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique[:3]


def extract_certifications(text: str) -> list:
    certs = []
    lines = text.split('\n')
    cert_keywords = ["certified", "certification", "certificate", "aws", "azure",
                     "google", "microsoft", "oracle", "cisco", "comptia", "pmp",
                     "scrum", "agile", "iso"]

    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in cert_keywords) and len(line.strip()) > 5:
            year_match = re.search(r'\b(20)\d{2}\b', line)
            certs.append({
                "name": line.strip(),
                "issuer": "",
                "year": year_match.group() if year_match else ""
            })

    return certs[:5]


def extract_projects(text: str) -> list:
    projects = []
    lines = text.split('\n')

    project_section_headers = [
        "projects", "personal projects", "academic projects",
        "project work", "key projects", "notable projects"
    ]

    stop_headers = [
        "certifications", "achievements", "coding profiles",
        "leadership", "extracurricular", "experience", "education",
        "skills", "references", "declaration", "hobbies"
    ]

    project_start = -1
    project_end = len(lines)

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if not line_lower:
            continue
        if any(h in line_lower for h in project_section_headers) and len(line_lower) < 40:
            project_start = i + 1
        elif project_start != -1 and any(h in line_lower for h in stop_headers) and len(line_lower) < 40:
            project_end = i
            break

    if project_start == -1:
        return []

    relevant_lines = lines[project_start:project_end]

    current_project = None

    for i, line in enumerate(relevant_lines):
        stripped = line.strip()
        line_lower = stripped.lower()
        if not stripped:
            continue

        is_bullet = stripped.startswith(('•', '-', '*', '→', '◦', '▪'))
        has_tech_separator = '—' in stripped or '--' in stripped

        if not is_bullet and has_tech_separator:
            if current_project:
                projects.append(current_project)

            name = stripped
            tech_stack = []
            link = ""

            if '—' in stripped:
                parts = stripped.split('—', 1)
                name = parts[0].strip()
                tech_part = parts[1].strip() if len(parts) > 1 else ""
                if 'link' in tech_part.lower():
                    tech_part = re.sub(r'\s*link\s*', '', tech_part, flags=re.IGNORECASE).strip()
                    link = "Link"
                tech_stack = [t.strip() for t in re.split(r'[,;]', tech_part) if t.strip()]

            current_project = {
                "name": name,
                "tech_stack": tech_stack,
                "link": link,
                "description": "",
                "points": []
            }

        elif not is_bullet and current_project is None and len(stripped) < 100:
            current_project = {
                "name": stripped,
                "tech_stack": [],
                "link": "",
                "description": "",
                "points": []
            }

        elif is_bullet and current_project:
            clean = stripped.lstrip('•-*→◦▪ ').strip()
            if clean and len(clean) > 8:
                if len(clean) > 130:
                    clean = clean[:127] + "..."
                current_project["points"].append(clean)

    if current_project:
        projects.append(current_project)

    return projects[:6]


def calculate_score(skills: dict, experience: list, education: list, email: str, phone: str, projects: list = None) -> int:
    score = 0

    all_skills = (skills.get("technical", []) + skills.get("languages_programming", []) +
                  skills.get("tools", []) + skills.get("soft", []))
    skill_count = len(all_skills)

    # ── SKILLS (max 30 pts) ──
    # Average student has 8-12 skills → 16-24 pts
    score += min(30, skill_count * 2)

    # ── EDUCATION + CGPA (max 25 pts) ──
    for edu in education:
        score += 5  # base for having degree listed
        gpa = edu.get("gpa", "")
        if gpa:
            try:
                gpa_val = float(gpa)
                if gpa_val >= 9.5:   score += 20
                elif gpa_val >= 9.0: score += 17
                elif gpa_val >= 8.5: score += 13
                elif gpa_val >= 8.0: score += 10
                elif gpa_val >= 7.5: score += 7
                elif gpa_val >= 7.0: score += 4
                elif gpa_val >= 6.0: score += 2
                else:                score += 0
            except:
                pass
        else:
            # No CGPA mentioned — small penalty
            score -= 3

    score = min(score, 55)  # cap before projects/experience added

    # ── PROJECTS (max 20 pts) ──
    proj_count = len(projects) if projects else 0
    if proj_count == 0:   score += 0
    elif proj_count == 1: score += 8
    elif proj_count == 2: score += 14
    elif proj_count == 3: score += 18
    else:                 score += 20

    # ── EXPERIENCE / INTERNSHIPS (max 15 pts) ──
    exp_count = len(experience)
    if exp_count == 0:   score += 0
    elif exp_count == 1: score += 10
    elif exp_count == 2: score += 13
    else:                score += 15

    # ── CERTIFICATIONS (max 5 pts) ──
    certs = education  # reuse — certifications come through here sometimes
    cert_keywords = ["aws", "azure", "microsoft", "google", "oracle", "cisco", "comptia", "pmp"]
    has_cert = any(
        any(kw in str(c).lower() for kw in cert_keywords)
        for c in certs
    )
    if has_cert:
        score += 5

    # ── CONTACT INFO (max 5 pts) ──
    if email and phone:
        score += 5
    elif email or phone:
        score += 2

    # ── HONEST PENALTIES ──
    if skill_count == 0:  score -= 15
    if skill_count < 4:   score -= 8
    if not education:     score -= 10
    if proj_count == 0 and exp_count == 0:
        score -= 10  # nothing practical at all

    return max(15, min(97, score))


def generate_feedback(skills: dict, experience: list, education: list, score: int, projects: list = None) -> str:
    all_skills = (skills.get("technical", []) + skills.get("languages_programming", []))
    proj_count = len(projects) if projects else 0
    parts = []

    # Overall verdict
    if score >= 85:
        parts.append("Excellent resume — very well-rounded profile.")
    elif score >= 75:
        parts.append("Strong resume with good skills and practical experience.")
    elif score >= 62:
        parts.append("Good resume — solid foundation with some areas to improve.")
    elif score >= 48:
        parts.append("Average resume — needs more projects or stronger skills.")
    else:
        parts.append("Weak profile — focus on building skills and adding projects.")

    # Skills comment
    if len(all_skills) >= 15:
        parts.append(f"Strong technical skillset with {len(all_skills)} skills listed.")
    elif len(all_skills) >= 8:
        parts.append(f"Decent skillset with {len(all_skills)} technical skills.")
    elif len(all_skills) > 0:
        parts.append(f"Only {len(all_skills)} skills detected — add more relevant technologies.")
    else:
        parts.append("No clear skills found — add a dedicated skills section.")

    # CGPA comment
    for edu in education:
        gpa = edu.get("gpa", "")
        if gpa:
            try:
                gpa_val = float(gpa)
                if gpa_val >= 9.0:
                    parts.append(f"Outstanding CGPA of {gpa_val} is a strong differentiator.")
                elif gpa_val >= 8.0:
                    parts.append(f"Good academic record with CGPA {gpa_val}.")
                elif gpa_val >= 7.0:
                    parts.append(f"Average CGPA of {gpa_val} — focus on practical skills.")
                else:
                    parts.append(f"Low CGPA of {gpa_val} — compensate with strong projects.")
            except:
                pass

    # Projects comment
    if proj_count >= 3:
        parts.append(f"{proj_count} projects show strong initiative and hands-on ability.")
    elif proj_count == 2:
        parts.append("2 projects are good — adding one more would strengthen the profile.")
    elif proj_count == 1:
        parts.append("Only 1 project — build 2-3 more to stand out.")
    else:
        parts.append("No projects found — this significantly weakens the profile.")

    # Experience comment
    if experience:
        parts.append(f"Has {len(experience)} practical experience {'entry' if len(experience)==1 else 'entries'} which adds real-world credibility.")
    else:
        parts.append("No experience listed — internships or freelance work would help.")

    return " ".join(parts)


def parse_resume_with_ai(resume_text: str) -> dict:
    email = extract_email(resume_text)
    phone = extract_phone(resume_text)
    name = extract_name(resume_text)
    location = extract_location(resume_text)
    skills = extract_skills(resume_text)
    experience = extract_experience(resume_text)
    education = extract_education(resume_text)
    certifications = extract_certifications(resume_text)
    projects = extract_projects(resume_text)
    score = calculate_score(skills, experience, education, email, phone, projects)
    feedback = generate_feedback(skills, experience, education, score, projects)

    lines = resume_text.split('\n')
    summary = ""
    for line in lines:
        if len(line.strip()) > 80:
            summary = line.strip()
            break

    all_skills = (skills.get("technical", []) + skills.get("languages_programming", []) +
                  skills.get("tools", []))

    return {
        "candidate_name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "summary": summary,
        "skills": skills,
        "experience": experience,
        "education": education,
        "certifications": certifications,
        "projects": projects,
        "languages": ["English"],
        "total_experience_years": len(experience) * 1.5,
        "ai_score": score,
        "ai_feedback": feedback,
        "strengths": all_skills[:3] if all_skills else ["See skills section"],
        "keywords": all_skills[:5]
    }


def match_job_description(resume_data: dict, job_description: str) -> dict:
    job_lower = job_description.lower()

    all_candidate_skills = []
    skills = resume_data.get("skills", {})
    for key in skills:
        all_candidate_skills.extend([s.lower() for s in skills[key]])

    job_skills = [skill for skill in SKILLS_DATABASE if skill in job_lower]

    matched = [s for s in all_candidate_skills if any(s in js or js in s for js in job_skills)]
    missing = [s for s in job_skills if not any(s in cs or cs in s for cs in all_candidate_skills)]

    matched = list(set(matched))[:8]
    missing = list(set(missing))[:8]

    total = len(job_skills) if job_skills else 1
    match_score = min(95, int((len(matched) / total) * 100)) if total > 0 else 50

    if match_score >= 75:
        recommendation = "Strong candidate"
    elif match_score >= 55:
        recommendation = "Good candidate"
    elif match_score >= 35:
        recommendation = "Potential candidate"
    else:
        recommendation = "Not a fit"

    questions = [
        f"Can you describe your experience with {matched[0]}?" if matched else "Tell us about your most relevant experience.",
        f"How have you used {matched[1]} in a professional setting?" if len(matched) > 1 else "What is your biggest professional achievement?",
        f"Are you familiar with {missing[0]}? Can you learn it quickly?" if missing else "Where do you see yourself growing technically?",
        "Describe a challenging project and how you handled it.",
        "Why are you interested in this role?"
    ]

    return {
        "match_score": match_score,
        "matched_skills": [s.title() for s in matched],
        "missing_skills": [s.title() for s in missing],
        "recommendation": recommendation,
        "reasoning": f"Candidate matches {len(matched)} out of {len(job_skills)} required skills. {recommendation} based on skill alignment.",
        "interview_questions": questions
    }
