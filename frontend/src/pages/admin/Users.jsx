import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  Unlock,
} from 'lucide-react'
import api from '../../services/api'

function getInitial(name, email) {
  return (name?.[0] || email?.[0] || 'U').toUpperCase()
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${
        isAdmin
          ? 'bg-gold/10 text-gold border-gold/30'
          : 'bg-black text-muted border-gold/20'
      }`}
    >
      <Shield size={12} />
      {role || 'user'}
    </span>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${
        active
          ? 'bg-gold/10 text-gold border-gold/30'
          : 'bg-red-400/10 text-red-400 border-red-400/30'
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? 'Active' : 'Blocked'}
    </span>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setLoading(true)

    try {
      const res = await api.get('/auth/admin/users/')
      setUsers(res.data.results || res.data || [])
    } catch {
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggleActive = async (user) => {
    setUpdatingId(user.id)

    try {
      await api.patch(`/auth/admin/users/${user.id}/`, {
        is_active: !user.is_active,
      })

      toast.success(`User ${user.is_active ? 'blocked' : 'unblocked'}!`)
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase()

    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7 sm:mb-9">
          <div>
            <p className="label-gold mb-2">User Management</p>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
              ADMIN <span className="text-gradient-gold">USERS</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
              View customers, inspect contact details, and manage account access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-2">
              <Users size={14} />
              {users.length} Users
            </span>

            <button
              type="button"
              onClick={load}
              className="w-10 h-10 bg-[#0A0A0A] border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Refresh users"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* Search */}
        <section className="relative mb-6">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, phone, or role..."
            className="w-full bg-[#0A0A0A] border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider pl-11 pr-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          />
        </section>

        {/* Loading */}
        {loading ? (
          <section className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="w-full h-20 skeleton-dark border border-gold/10 animate-pulse"
              />
            ))}
          </section>
        ) : filteredUsers.length === 0 ? (
          <section className="bg-[#0A0A0A] border border-gold/15 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <Users size={34} className="text-gold/50" />
            </div>

            <p className="label-gold mb-3">No User Signal</p>

            <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO USERS <span className="text-gradient-gold">FOUND</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
              Try changing your search query or refresh the user list.
            </p>
          </section>
        ) : (
          <>
            {/* Desktop Table */}
            <section className="hidden lg:block bg-[#0A0A0A] border border-gold/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 bg-black">
                      {['User', 'Email', 'Phone', 'Role', 'Status', 'Action'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="text-left text-[10px] font-mono text-gold/70 uppercase tracking-[0.18em] px-5 py-3"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors duration-200"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold text-black flex items-center justify-center text-sm font-display shrink-0">
                              {getInitial(user.name, user.email)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-mono text-white truncate">
                                {user.name || 'Unnamed User'}
                              </p>

                              <p className="text-[10px] text-muted font-mono mt-0.5">
                                ID: {user.id?.toString().slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="text-muted font-mono px-5 py-4">
                          {user.email || '—'}
                        </td>

                        <td className="font-mono text-muted px-5 py-4">
                          {user.phone || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge active={user.is_active} />
                        </td>

                        <td className="px-5 py-4">
                          {user.role !== 'admin' ? (
                            <button
                              type="button"
                              onClick={() => toggleActive(user)}
                              disabled={updatingId === user.id}
                              className={`inline-flex items-center justify-center gap-2 min-w-[100px] text-xs font-mono tracking-wider uppercase border px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.is_active
                                  ? 'bg-red-400/10 text-red-400 border-red-400/25 hover:bg-red-400 hover:text-white'
                                  : 'bg-gold/10 text-gold border-gold/25 hover:bg-gold hover:text-black'
                              }`}
                            >
                              {updatingId === user.id ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  Wait
                                </>
                              ) : user.is_active ? (
                                <>
                                  <Ban size={13} />
                                  Block
                                </>
                              ) : (
                                <>
                                  <Unlock size={13} />
                                  Unblock
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted font-mono tracking-wider uppercase">
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile Cards */}
            <section className="lg:hidden flex flex-col gap-3">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="bg-[#0A0A0A] border border-gold/15 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gold text-black flex items-center justify-center text-base font-display shrink-0">
                      {getInitial(user.name, user.email)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-mono text-white tracking-wider truncate">
                            {user.name || 'Unnamed User'}
                          </h3>

                          <p className="text-[10px] text-muted font-mono mt-1">
                            ID: {user.id?.toString().slice(0, 8)}
                          </p>
                        </div>

                        <StatusBadge active={user.is_active} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <InfoBox icon={Mail} label="Email" value={user.email || '—'} />
                        <InfoBox icon={Phone} label="Phone" value={user.phone || '—'} />
                        <InfoBox icon={Shield} label="Role" value={user.role || 'user'} />
                        <InfoBox
                          icon={User}
                          label="Status"
                          value={user.is_active ? 'Active' : 'Blocked'}
                          highlight={user.is_active}
                        />
                      </div>

                      {user.role !== 'admin' ? (
                        <button
                          type="button"
                          onClick={() => toggleActive(user)}
                          disabled={updatingId === user.id}
                          className={`w-full mt-4 inline-flex items-center justify-center gap-2 text-xs font-mono tracking-wider uppercase border px-4 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.is_active
                              ? 'bg-red-400/10 text-red-400 border-red-400/25 hover:bg-red-400 hover:text-white'
                              : 'bg-gold/10 text-gold border-gold/25 hover:bg-gold hover:text-black'
                          }`}
                        >
                          {updatingId === user.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Updating...
                            </>
                          ) : user.is_active ? (
                            <>
                              <Ban size={14} />
                              Block User
                            </>
                          ) : (
                            <>
                              <Unlock size={14} />
                              Unblock User
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="mt-4 border border-gold/15 bg-black px-4 py-3 text-center">
                          <span className="text-[10px] text-muted font-mono tracking-wider uppercase">
                            Admin account protected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="bg-black border border-gold/10 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} className="text-gold" />
        <span className="text-[10px] text-muted font-mono tracking-wider uppercase">
          {label}
        </span>
      </div>

      <p
        className={`text-xs sm:text-sm font-mono truncate ${
          highlight ? 'text-gold' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}