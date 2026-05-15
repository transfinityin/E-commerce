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
    <div className="min-h-screen bg-slate-50">
      <div className="page-box">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              Management
            </p>
            <h1 className="text-3xl font-bold text-[#C8A96E]">Users</h1>
          </div>
          <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-full" style={{ padding: '6px 16px' }}>
            {users.length} users
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['User', 'Email', 'Phone', 'Role', 'Status', 'Action'].map(h => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                        style={{ padding: '16px 20px' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td style={{ padding: '16px 20px' }}>
                        <div className="flex items-center" style={{ gap: '12px' }}>
                          <div className="w-9 h-9 rounded-full bg-[#C8A96E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#C8A96E]">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-500" style={{ padding: '16px 20px' }}>{user.email}</td>
                      <td className="font-mono text-slate-500" style={{ padding: '16px 20px' }}>{user.phone || '—'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`inline-block text-xs font-bold rounded-full border ${user.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`} style={{ padding: '4px 12px' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`inline-block text-xs font-bold rounded-full border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`} style={{ padding: '4px 12px' }}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => toggleActive(user)}
                            className={`text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            style={{ padding: '8px 16px' }}
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