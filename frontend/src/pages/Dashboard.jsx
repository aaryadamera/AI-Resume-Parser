import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Users, TrendingUp, Award, Clock, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0f1829', border: '1px solid rgba(99,132,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: '#94a3c4', fontSize: '0.85rem' }}>{label}</p>
        <p style={{ color: '#4f8fff', fontWeight: 700 }}>{payload[0].value} candidates</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    api.getStats().then(r => setStats(r.data)).catch(() => {})
    api.getResumes().then(r => setResumes(r.data.resumes || [])).catch(() => {})
  }, [])

  const scoreData = [
    { name: '0–40', count: resumes.filter(r => r.ai_score < 40).length, color: '#ff5c7a' },
    { name: '40–60', count: resumes.filter(r => r.ai_score >= 40 && r.ai_score < 60).length, color: '#ffd166' },
    { name: '60–80', count: resumes.filter(r => r.ai_score >= 60 && r.ai_score < 80).length, color: '#4f8fff' },
    { name: '80–100', count: resumes.filter(r => r.ai_score >= 80).length, color: '#00e5a0' },
  ]

  const statCards = [
    { label: 'Total Resumes', value: stats?.total_resumes ?? 0, icon: Users, color: '#4f8fff', glow: 'rgba(79,143,255,0.15)' },
    { label: 'Top Candidates', value: stats?.high_score_candidates ?? 0, icon: Award, color: '#00e5a0', glow: 'rgba(0,229,160,0.15)' },
    { label: 'Avg AI Score', value: `${stats?.average_score ?? 0}`, icon: TrendingUp, color: '#ffd166', glow: 'rgba(255,209,102,0.15)' },
    { label: 'Recent Uploads', value: stats?.recent_uploads?.length ?? 0, icon: Clock, color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
  ]

  return (
    <div className="page">
      <h1 className="page-title">Overview</h1>
      <p className="page-subtitle">Track and manage your candidate pipeline in real time</p>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, glow }, i) => (
          <div key={label} className="stat-card" style={{ animationDelay: `${i * 0.08}s`, animation: 'fadeUp 0.5s ease forwards', opacity: 0 }}>
            <div className="stat-icon" style={{ background: glow }}>
              <Icon size={26} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
            <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text3)' }} />
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3>📊 Score Distribution</h3>
          {resumes.length === 0
            ? <p className="empty">Upload resumes to see distribution</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scoreData} barSize={48}>
                  <XAxis dataKey="name" stroke="#5a6a8a" tick={{ fontSize: 13 }} />
                  <YAxis stroke="#5a6a8a" tick={{ fontSize: 13 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,143,255,0.05)' }} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {scoreData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="card">
          <h3>🕐 Recent Uploads</h3>
          <div className="recent-list">
            {!stats?.recent_uploads?.length
              ? <p className="empty">No resumes yet</p>
              : stats.recent_uploads.map(r => (
                  <div key={r.id} className="recent-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f8fff,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                        {r.name?.[0] || '?'}
                      </div>
                      <span className="recent-name">{r.name}</span>
                    </div>
                    <span className="score-badge" style={{
                      background: r.score >= 80 ? 'rgba(0,229,160,0.1)' : r.score >= 60 ? 'rgba(255,209,102,0.1)' : 'rgba(255,92,122,0.1)',
                      color: r.score >= 80 ? '#00e5a0' : r.score >= 60 ? '#ffd166' : '#ff5c7a'
                    }}>{r.score}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
