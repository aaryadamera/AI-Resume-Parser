import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import ScoreCircle from '../components/ScoreCircle'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Target } from 'lucide-react'

export default function CandidateDetail() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matching, setMatching] = useState(false)

  useEffect(() => { api.getResume(id).then(r => setCandidate(r.data)) }, [id])

  const handleMatch = async () => {
    if (!jobDesc.trim()) return
    setMatching(true)
    try { const r = await api.matchJob(id, jobDesc); setMatchResult(r.data) }
    catch { alert('Match failed. Please try again.') }
    setMatching(false)
  }

  if (!candidate) return <div className="loading-center"><div className="spinner-ring" style={{ margin: '3rem auto' }}/></div>

  const tagColors = ['blue','cyan','purple','yellow','orange','green']
  const allSkills = [...(candidate.skills?.technical||[]), ...(candidate.skills?.languages_programming||[]), ...(candidate.skills?.tools||[])]

  return (
    <div className="page">
      <Link to="/candidates" className="back-link"><ArrowLeft size={16}/> Back to Candidates</Link>

      <div className="detail-grid">
        {/* Sidebar */}
        <div className="profile-side">
          <div className="card profile-card">
            <div className="profile-avatar" style={{ width: 80, height: 80, fontSize: '2rem', margin: '0 auto 0.5rem' }}>
              {candidate.candidate_name?.[0] || '?'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, margin: '0.8rem 0 0.5rem' }}>
              {candidate.candidate_name}
            </h1>
            <div className="contact-info">
              {candidate.email && <div><Mail size={15}/>{candidate.email}</div>}
              {candidate.phone && <div><Phone size={15}/>{candidate.phone}</div>}
              {candidate.location && <div><MapPin size={15}/>{candidate.location}</div>}
            </div>
            <hr className="divider"/>
            <ScoreCircle score={Math.round(candidate.ai_score || 0)} size={120} />
            <hr className="divider"/>
            {candidate.summary && <p className="summary-text">{candidate.summary}</p>}
            <hr className="divider"/>
            <div style={{ textAlign: 'left' }}>
              <div className="skill-section-title" style={{ marginBottom: 8 }}>AI Feedback</div>
              <p className="feedback-text">{candidate.ai_feedback}</p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="detail-main">
          {/* Skills */}
          <div className="card">
            <h3><span>🛠</span> Skills & Technologies</h3>
            {candidate.skills?.languages_programming?.length > 0 && (
              <div className="skill-section">
                <div className="skill-section-title">Programming Languages</div>
                <div className="tags">{candidate.skills.languages_programming.map((s,i)=><span key={s} className={`tag ${tagColors[i%tagColors.length]}`}>{s}</span>)}</div>
              </div>
            )}
            {candidate.skills?.technical?.length > 0 && (
              <div className="skill-section">
                <div className="skill-section-title">Technical</div>
                <div className="tags">{candidate.skills.technical.map((s,i)=><span key={s} className={`tag ${tagColors[(i+1)%tagColors.length]}`}>{s}</span>)}</div>
              </div>
            )}
            {candidate.skills?.tools?.length > 0 && (
              <div className="skill-section">
                <div className="skill-section-title">Tools</div>
                <div className="tags">{candidate.skills.tools.map(s=><span key={s} className="tag gray">{s}</span>)}</div>
              </div>
            )}
            {candidate.skills?.soft?.length > 0 && (
              <div className="skill-section">
                <div className="skill-section-title">Soft Skills</div>
                <div className="tags">{candidate.skills.soft.map(s=><span key={s} className="tag purple">{s}</span>)}</div>
              </div>
            )}
          </div>

          {/* Experience */}
          {candidate.experience?.length > 0 && (
            <div className="card">
              <h3><Briefcase size={18}/> Work Experience</h3>
              <div className="timeline">
                {candidate.experience.map((exp,i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot"/>
                    <div style={{ flex: 1 }}>
                      <div className="timeline-title">{exp.title}</div>
                      <div className="timeline-sub">{exp.company}{exp.duration ? ` · ${exp.duration}` : ''}</div>
                      {exp.description && <p className="timeline-desc">{exp.description}</p>}
                      {exp.achievements?.map((a,j)=><div key={j} className="achievement">{a}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <div className="card">
              <h3><GraduationCap size={18}/> Education</h3>
              <div className="timeline">
                {candidate.education.map((edu,i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot green"/>
                    <div>
                      <div className="timeline-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                      <div className="timeline-sub">{edu.institution}{edu.year ? ` · ${edu.year}` : ''}</div>
                      {edu.gpa && <span className="tag green small" style={{marginTop:6,display:'inline-block'}}>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {candidate.certifications?.length > 0 && (
            <div className="card">
              <h3><Award size={18}/> Certifications</h3>
              {candidate.certifications.map((c,i) => (
                <div key={i} className="cert-item">
                  <span className="tag purple">{c.name}</span>
                  {c.issuer && <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{c.issuer}</span>}
                  {c.year && <span className="tag gray small">{c.year}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Job Match */}
          <div className="card">
            <h3><Target size={18}/> Job Description Matcher</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem', fontSize: '0.92rem' }}>
              Paste a job description to get an instant match score and interview questions
            </p>
            <textarea className="job-textarea" rows={6}
              placeholder="Paste the full job description here..."
              value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            <button onClick={handleMatch} className="btn primary" disabled={matching || !jobDesc.trim()}>
              {matching ? '⏳ Analyzing...' : '🎯 Analyze Match'}
            </button>

            {matchResult && (
              <div className="match-result">
                <div className="match-score-row">
                  <ScoreCircle score={matchResult.match_score} size={90} />
                  <div>
                    <div className="match-rec">{matchResult.recommendation}</div>
                    <p style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.7 }}>{matchResult.reasoning}</p>
                  </div>
                </div>
                <div className="match-skills">
                  <div>
                    <h4>✅ Matched Skills</h4>
                    <div className="tags">{matchResult.matched_skills?.map(s=><span key={s} className="tag green">{s}</span>)}</div>
                  </div>
                  <div>
                    <h4>❌ Missing Skills</h4>
                    <div className="tags">{matchResult.missing_skills?.map(s=><span key={s} className="tag red">{s}</span>)}</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text2)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    💬 Suggested Interview Questions
                  </h4>
                  {matchResult.interview_questions?.map((q,i) => (
                    <div key={i} className="interview-q">
                      <strong style={{ color: 'var(--blue2)', marginRight: 8 }}>Q{i+1}.</strong>{q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
