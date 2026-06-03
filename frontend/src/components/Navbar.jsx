import { Link, useLocation } from 'react-router-dom'
import { Brain, Upload, Users, LayoutDashboard, Sparkles } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Resume' },
    { to: '/candidates', icon: Users, label: 'Candidates' },
  ]
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Brain size={26} />
        ResumeIQ
      </div>
      <div className="nav-links">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`nav-link ${location.pathname === to ? 'active' : ''}`}>
            <Icon size={17} /><span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
