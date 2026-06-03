export default function ScoreCircle({ score, size = 100 }) {
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#00e5a0' : score >= 60 ? '#ffd166' : '#ff5c7a'
  const trackColor = score >= 80 ? 'rgba(0,229,160,0.1)' : score >= 60 ? 'rgba(255,209,102,0.1)' : 'rgba(255,92,122,0.1)'
  const fontSize = size > 90 ? '1.4rem' : '1rem'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="score-circle" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={trackColor} strokeWidth="10" />
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <span className="score-text" style={{ color, fontSize }}>{score}</span>
      </div>
      <span className="score-label">AI Score</span>
    </div>
  )
}
