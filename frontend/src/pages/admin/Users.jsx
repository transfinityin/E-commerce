import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/auth/admin/users/').then(r => setUsers(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleActive = async (user) => {
    try {
      await api.patch(`/auth/admin/users/${user.id}/`, { is_active: !user.is_active })
      toast.success(`User ${user.is_active ? 'blocked' : 'unblocked'}!`); load()
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              Management
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Users</h1>
          </div>
          <span className="text-sm font-medium text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5">
            {users.length} users
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                    {['User', 'Email', 'Phone', 'Role', 'Status', 'Action'].map(h => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors duration-200">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-[var(--color-btn-text)] flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-[var(--color-text)]">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-[var(--color-muted)] px-5 py-4">{user.email}</td>
                      <td className="font-mono text-[var(--color-muted)] px-5 py-4">{user.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-bold rounded-full border px-3 py-1 ${user.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-bold rounded-full border px-3 py-1 ${user.is_active ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20'}`}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => toggleActive(user)}
                            className={`text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 px-4 py-2 ${user.is_active ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10' : 'bg-[var(--color-success-bg)] text-[var(--color-success)] hover:bg-[var(--color-success)]/10'}`}
                          >
                            {user.is_active ? 'Block' : 'Unblock'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}