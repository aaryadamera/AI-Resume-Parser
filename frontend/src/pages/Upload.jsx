import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../utils/api'
import { CheckCircle, AlertCircle, Upload as UploadIcon, Target, GraduationCap } from 'lucide-react'
import ScoreCircle from '../components/ScoreCircle'

export default function Upload() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matching, setMatching] = useState(false)
  const [resumeId, setResumeId] = useState(null)

  const onDrop = useCallback(async (files) => {
    if (!files.length) return
    setStatus('uploading'); setError('')
    setMatchResult(null); setJobDesc('')
    try {
      const res = await api.uploadResume(files[0])
      setResult(res.data)
      setResumeId(res.data.id)
      setStatus('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const handleMatch = async () => {
    if (!jobDesc.trim() || !resumeId) return
    setMatching(true)
    try {
      const r = await api.matchJob(resumeId, jobDesc)
      setMatchResult(r.data)
    } catch { alert('Match failed. Please try again.') }
    setMatching(false)
  }

  const reset = () => {
    setStatus('idle'); setResult(null)
    setError(''); setMatchResult(null)
    setJobDesc(''); setResumeId(null)
  }

  const tagColors = ['blue','cyan','purple','yellow','orange','green']

  // Get best education for CGPA display
  const bestEdu = result?.data?.education?.find(e => e.gpa) || result?.data?.education?.[0]

  return (
    <div className="page">
      <h1 className="page-title">Upload Resume</h1>
      <p className="page-subtitle">Drop a resume and watch our AI extract everything instantly</p>

      {(status === 'idle' || status === 'error') && (
        <>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <UploadIcon size={52} className="dropzone-icon" />
            <h3>{isDragActive ? '✨ Release to parse!' : 'Drop your resume here'}</h3>
            <p>Drag & drop or click to browse your files</p>
            <div className="dropzone-formats">
              {['PDF', 'DOCX', 'TXT'].map(f => <span key={f} className="format-badge">{f}</span>)}
            </div>
          </div>
          {error && <div className="alert error"><AlertCircle size={18}/><span>{error}</span></div>}
        </>
      )}

      {status === 'uploading' && (
        <div className="loading-state">
          <div className="spinner-ring"/>
          <h3>Parsing your resume...</h3>
          <p>Extracting skills, experience, education and more</p>
          <div className="loading-dots"><span/><span/><span/></div>
        </div>
      )}

      {status === 'success' && result && (
        <div style={{ animation: 'fadeUp 0.5s ease' }}>
          <div className="result-header">
            <CheckCircle size={30} color="#00e5a0" />
            <h2>Resume Parsed Successfully!</h2>
            <button onClick={reset} className="btn secondary">↑ Upload Another</button>
          </div>

          <div className="parsed-grid">
            {/* ── Profile Sidebar ── */}
            <div className="profile-card card">
              <div className="profile-avatar">{result.data.candidate_name?.[0] || '?'}</div>
              <h2>{result.data.candidate_name}</h2>
              {result.data.email    && <div className="contact-row">📧 {result.data.email}</div>}
              {result.data.phone    && <div className="contact-row">📱 {result.data.phone}</div>}
              {result.data.location && <div className="contact-row">📍 {result.data.location}</div>}

              {/* CGPA Block */}
              {bestEdu?.gpa && (
                <div className="cgpa-block">
                  <div className="cgpa-value">{bestEdu.gpa}
                    <span className="cgpa-denom">/10</span>
                  </div>
                  <div className="cgpa-label">CGPA</div>
                  {bestEdu.institution && (
                    <div className="cgpa-inst">{bestEdu.institution}</div>
                  )}
                </div>
              )}

              <hr className="profile-divider"/>
              <ScoreCircle score={Math.round(result.data.ai_score || 0)} size={110} />
              {result.data.summary && <p className="profile-summary">{result.data.summary}</p>}
            </div>

            {/* ── Right Column ── */}
            <div>
              {/* AI Feedback */}
              <div className="card">
                <h3>🤖 AI Analysis</h3>
                <p style={{ color: 'var(--text2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  {result.data.ai_feedback}
                </p>
                <div className="tags" style={{ marginTop: '1rem' }}>
                  {result.data.strengths?.map(s => <span key={s} className="tag green">{s}</span>)}
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <h3>🛠 Skills & Technologies</h3>
                {result.data.skills?.languages_programming?.length > 0 && (
                  <div className="skill-section">
                    <div className="skill-section-title">Programming Languages</div>
                    <div className="tags">
                      {result.data.skills.languages_programming.map((s,i) =>
                        <span key={s} className={`tag ${tagColors[i%tagColors.length]}`}>{s}</span>)}
                    </div>
                  </div>
                )}
                {result.data.skills?.technical?.length > 0 && (
                  <div className="skill-section">
                    <div className="skill-section-title">Technical Skills</div>
                    <div className="tags">
                      {result.data.skills.technical.map((s,i) =>
                        <span key={s} className={`tag ${tagColors[(i+2)%tagColors.length]}`}>{s}</span>)}
                    </div>
                  </div>
                )}
                {result.data.skills?.tools?.length > 0 && (
                  <div className="skill-section">
                    <div className="skill-section-title">Tools & Platforms</div>
                    <div className="tags">
                      {result.data.skills.tools.map(s => <span key={s} className="tag gray">{s}</span>)}
                    </div>
                  </div>
                )}
                {result.data.skills?.soft?.length > 0 && (
                  <div className="skill-section">
                    <div className="skill-section-title">Soft Skills</div>
                    <div className="tags">
                      {result.data.skills.soft.map(s => <span key={s} className="tag purple">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              {result.data.experience?.length > 0 && (
                <div className="card">
                  <h3>💼 Work Experience</h3>
                  <div className="timeline">
                    {result.data.experience.map((exp, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot"/>
                        <div style={{ flex: 1 }}>
                          <div className="timeline-title">{exp.title}</div>
                          {exp.company && (
                            <div className="timeline-sub">{exp.company}{exp.duration ? ` · ${exp.duration}` : ''}</div>
                          )}
                          {exp.description && <p className="timeline-desc">{exp.description}</p>}
                          {exp.achievements?.slice(0,4).map((a,j) =>
                            <div key={j} className="achievement">{a}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Projects */}
              {result.data.projects?.length > 0 && (
                <div className="card">
                  <h3>🚀 Projects</h3>
                  <div className="projects-grid">
                    {result.data.projects.map((proj, i) => (
                      <div key={i} className="project-card">
                        <div className="project-name">
                          <span>{proj.name}</span>
                          {proj.link && <span className="project-link">↗ Link</span>}
                        </div>
                        {proj.tech_stack?.length > 0 && (
                          <div className="project-tech">
                            {proj.tech_stack.map((t, j) => (
                              <span key={j} className="tag purple small">{t}</span>
                            ))}
                          </div>
                        )}
                        {proj.points?.map((pt, j) => (
                          <div key={j} className="project-point">{pt}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Education */}
              {result.data.education?.length > 0 && (
                <div className="card">
                  <h3><GraduationCap size={18}/> Education</h3>
                  <div className="timeline">
                    {result.data.education.map((edu, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot green"/>
                        <div>
                          <div className="timeline-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                          <div className="timeline-sub">
                            {edu.institution}{edu.year ? ` · ${edu.year}` : ''}
                          </div>
                          {edu.gpa && (
                            <span className="tag green small" style={{ marginTop: 6, display: 'inline-block' }}>
                              CGPA: {edu.gpa} / 10
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Job Description Matcher ── */}
              <div className="card">
                <h3><Target size={18}/> Job Description Matcher</h3>
                <p style={{ color: 'var(--text2)', marginBottom: '1.2rem', fontSize: '1rem' }}>
                  Paste a job description to instantly see how well this resume matches
                </p>
                <textarea
                  className="job-textarea" rows={6}
                  placeholder="Paste the full job description here..."
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                />
                <button
                  onClick={handleMatch}
                  className="btn primary"
                  disabled={matching || !jobDesc.trim()}
                >
                  {matching ? '⏳ Analyzing...' : '🎯 Analyze Match'}
                </button>

                {matchResult && (
                  <div className="match-result">
                    <div className="match-score-row">
                      <ScoreCircle score={matchResult.match_score} size={90} />
                      <div>
                        <div className="match-rec">{matchResult.recommendation}</div>
                        <p style={{ color: 'var(--text2)', fontSize: '1rem', lineHeight: 1.75 }}>
                          {matchResult.reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="match-skills">
                      <div>
                        <h4>✅ Matched Skills</h4>
                        <div className="tags">
                          {matchResult.matched_skills?.map(s =>
                            <span key={s} className="tag green">{s}</span>)}
                        </div>
                      </div>
                      <div>
                        <h4>❌ Missing Skills</h4>
                        <div className="tags">
                          {matchResult.missing_skills?.map(s =>
                            <span key={s} className="tag red">{s}</span>)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: 'var(--text2)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                        💬 Suggested Interview Questions
                      </h4>
                      {matchResult.interview_questions?.map((q, i) => (
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
      )}
    </div>
  )
}