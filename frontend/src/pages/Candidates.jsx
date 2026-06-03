import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { Search, Trash2, Eye, MapPin, Mail, Users } from 'lucide-react'
import ScoreCircle from '../components/ScoreCircle'

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (q = '') => {
    setLoading(true)
    try { const r = await api.getResumes(q); setCandidates(r.data.resumes || []) }
    catch { setCandidates([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this candidate?')) return
    await api.deleteResume(id); load(search)
  }

  const tagColors = ['blue','cyan','purple','yellow','orange']

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidates</h1>
          <p style={{ color: 'var(--text2)', fontSize: '1rem' }}>{candidates.length} profiles found</p>
        </div>
        <div className="search-bar">
          <Search size={17} />
          <input placeholder="Search name, skill, location..."
            value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <Users size={48} style={{ color: 'var(--text3)', margin: '0 auto 1rem', display: 'block' }} />
          <p>No candidates found. <Link to="/upload">Upload a resume</Link> to get started.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((c, idx) => (
            <div key={c.id} className="candidate-card" style={{ animationDelay: `${idx * 0.05}s`, animation: 'fadeUp 0.4s ease forwards', opacity: 0 }}>
              <div className="candidate-header">
                <div className="candidate-avatar">{c.candidate_name?.[0] || '?'}</div>
                <ScoreCircle score={Math.round(c.ai_score || 0)} size={64} />
              </div>
              <h3 className="candidate-name">{c.candidate_name}</h3>
              <div className="candidate-meta">
                {c.email && <span><Mail size={13}/>{c.email}</span>}
                {c.location && <span><MapPin size={13}/>{c.location}</span>}
              </div>
              <div className="skill-tags">
                {[...(c.skills?.languages_programming || []), ...(c.skills?.technical || [])].slice(0,4).map((s,i) => (
                  <span key={s} className={`tag small ${tagColors[i % tagColors.length]}`}>{s}</span>
                ))}
              </div>
              {c.summary && <p className="candidate-summary">{c.summary}</p>}
              <div className="candidate-actions">
                <Link to={`/candidates/${c.id}`} className="btn primary small"><Eye size={14}/> View Profile</Link>
                <button onClick={() => handleDelete(c.id)} className="btn danger small"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
