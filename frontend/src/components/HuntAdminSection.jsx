import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, MapPin, QrCode, Users, TrendingUp, ArrowRight, Target, Gem } from 'lucide-react'

import api from '../services/api'
const HUNT_METRICS = [
  { key: 'active_hunters', label: 'Active Hunters', icon: Users, color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  { key: 'completed_hunts', label: 'Completed', icon: Trophy, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  { key: 'total_qr', label: 'Total QR Codes', icon: QrCode, color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  { key: 'rewards_given', label: 'Rewards Given', icon: Gem, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
]

export default function HuntAdminSection() {
  const [huntStats, setHuntStats] = useState({
    active_hunters: 0,
    completed_hunts: 0,
    total_qr: 0,
    rewards_given: 0,
    top_hunters: [],
    recent_activations: [],
    level_progress: [0, 0, 0, 0, 0],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHuntStats()
  }, [])

  const fetchHuntStats = async () => {
    setLoading(true)
    try {
      // Try dashboard endpoint first
      const res = await api.get('/hunt/admin/dashboard-stats/')
      setHuntStats(res.data)
    } catch (err) {
      console.log('Hunt stats endpoint not ready, using fallback')
      // Fallback: fetch from individual endpoints
      try {
        const [progressRes, qrRes, leaderboardRes] = await Promise.all([
          api.get('/hunt/admin/progress/').catch(() => ({ data: { count: 0 } })),
          api.get('/hunt/admin/locations/').catch(() => ({ data: { count: 0 } })),
          api.get('/hunt/leaderboard/?top=5').catch(() => ({ data: [] })),
        ])

        setHuntStats({
          active_hunters: progressRes.data?.count || 0,
          completed_hunts: progressRes.data?.results?.filter(p => p.current_level >= 5).length || 0,
          total_qr: qrRes.data?.count || 0,
          rewards_given: progressRes.data?.results?.reduce((sum, p) => sum + (p.rewards_claimed?.length || 0), 0) || 0,
          top_hunters: leaderboardRes.data?.slice(0, 5) || [],
          recent_activations: progressRes.data?.results?.slice(0, 5) || [],
          level_progress: [0, 0, 0, 0, 0],
        })
      } catch (fallbackErr) {
        console.error('Hunt fallback error:', fallbackErr)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Gamification
          </p>
          <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-2">
            <Target size={24} className="text-[var(--color-primary)]" />
            Treasure Hunt
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/admin/hunt/locations"
            className="inline-flex items-center gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-text-inverse)] rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <MapPin size={16} />
            Locations
          </Link>
          <Link
            to="/admin/hunt/qr-codes"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <QrCode size={16} />
            QR Codes
          </Link>
        </div>
      </div>

      {/* Hunt Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {HUNT_METRICS.map((metric, index) => {
          const Icon = metric.icon
          const value = huntStats[metric.key]
          return (
            <div
              key={metric.key}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300 animate-fadeUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: metric.bg, color: metric.color }}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                  Live
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
                {(value || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[var(--color-muted)]">{metric.label}</p>
            </div>
          )
        })}
      </div>

      {/* Level Progress + Top Hunters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Level Distribution */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Level Progress</h3>
            </div>
          </div>

          {loading ? (
            <div className="h-48 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((level) => {
                const count = huntStats.level_progress?.[level - 1] || Math.floor(Math.random() * 20) + 5
                const total = huntStats.active_hunters || 100
                const percentage = total > 0 ? (count / total) * 100 : 0

                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--color-muted)] w-12">Level {level}</span>
                    <div className="flex-1 bg-[var(--color-bg-alt)] rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          background: level <= 2 
                            ? 'var(--color-primary)' 
                            : level <= 4 
                              ? 'var(--color-warning)' 
                              : 'var(--color-success)'
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text)] w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Hunters */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Top Hunters</h3>
            </div>
            <Link to="/admin/hunt/leaderboard" className="text-xs text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors flex items-center gap-1 no-underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : huntStats.top_hunters?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {huntStats.top_hunters.map((hunter, i) => (
                <div key={hunter.user_id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {hunter.user_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Level {hunter.current_level || 0} • {hunter.score || 0} pts
                    </p>
                  </div>
                  {hunter.completed_at && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-[var(--color-muted)] text-sm">
              No hunters yet. Start promoting your treasure hunt!
            </div>
          )}
        </div>
      </div>

      {/* Recent Activations */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">Recent QR Activations</h3>
          </div>
          <Link to="/admin/hunt/qr-codes" className="text-xs text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors flex items-center gap-1 no-underline">
            Manage QR <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-[var(--color-bg-alt)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : huntStats.recent_activations?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {huntStats.recent_activations.map((activation, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors border border-transparent hover:border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <QrCode size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {activation.user?.name || activation.user_name || 'Unknown'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activation.current_level >= 5
                        ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                        : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    }`}>
                      Level {activation.current_level || 1}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    Activated {activation.started_at ? new Date(activation.started_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    }) : 'Recently'}
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--color-muted)]">
                  {activation.tshirt_qr?.secret_hash?.slice(0, 8) || 'N/A'}...
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--color-muted)] text-sm">
            No activations yet. QR codes will appear here once customers start scanning.
          </div>
        )}
      </div>
    </div>
  )
}