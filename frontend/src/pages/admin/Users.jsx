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

const SEARCH_INPUT =
  'w-full !rounded-full bg-white !py-3 !pl-11 !pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 !border-0 ring-1 ring-black/8 outline-none transition focus:ring-2 focus:ring-neutral-950/15'

function getInitial(name, email) {
  return (name?.[0] || email?.[0] || 'U').toUpperCase()
}

function isProtectedUser(user) {
  return Boolean(user.is_superuser) || user.role === 'admin'
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${
        isAdmin
          ? 'bg-neutral-950 text-white ring-neutral-950'
          : 'bg-[#F4F4F2] text-neutral-700 ring-black/6'
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-red-200'
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
    <div className="space-y-7 sm:space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
            User management
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
            Users
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
            View customers, inspect contact details, and manage account access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase ring-1 ring-black/8">
            <Users size={14} />
            {users.length} users
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex size-10 items-center justify-center rounded-full bg-white text-neutral-500 ring-1 ring-black/8 transition hover:text-neutral-950"
            aria-label="Refresh users"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </section>

      <section className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name, email, phone, or role..."
          className={SEARCH_INPUT}
        />
      </section>

      {loading ? (
        <section className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-2xl bg-[#F4F4F2] ring-1 ring-black/5"
            />
          ))}
        </section>
      ) : filteredUsers.length === 0 ? (
        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-14">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-400">
            <Users size={34} />
          </div>
          <h2 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
            No users found
          </h2>
          <p className="text-sm text-neutral-500">
            Try changing your search query or refresh the user list.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-[#F4F4F2]/80">
                    {['User', 'Email', 'Phone', 'Role', 'Status', 'Action'].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-black/5 transition last:border-b-0 hover:bg-[#F4F4F2]/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                            {getInitial(user.name, user.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">
                              {user.name || 'Unnamed User'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-neutral-500">
                              ID: {user.id?.toString().slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{user.email || '—'}</td>
                      <td className="px-5 py-4 text-neutral-600">{user.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={user.is_active} />
                      </td>
                      <td className="px-5 py-4">
                        {!isProtectedUser(user) ? (
                          <button
                            type="button"
                            onClick={() => toggleActive(user)}
                            disabled={updatingId === user.id}
                            className={`inline-flex min-w-[100px] items-center justify-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.is_active
                                ? 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
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
                          <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase">
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

          <section className="flex flex-col gap-3 lg:hidden">
            {filteredUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-base font-semibold text-white">
                    {getInitial(user.name, user.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-neutral-900">
                          {user.name || 'Unnamed User'}
                        </h3>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          ID: {user.id?.toString().slice(0, 8)}
                        </p>
                      </div>
                      <StatusBadge active={user.is_active} />
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    {!isProtectedUser(user) ? (
                      <button
                        type="button"
                        onClick={() => toggleActive(user)}
                        disabled={updatingId === user.id}
                        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[10px] font-semibold tracking-[0.14em] uppercase transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.is_active
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
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
                            Block user
                          </>
                        ) : (
                          <>
                            <Unlock size={14} />
                            Unblock user
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="mt-4 rounded-xl bg-[#F4F4F2] px-4 py-3 text-center">
                        <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
                          Protected account
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
    </div>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#F4F4F2]/80 p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon size={13} className="text-neutral-500" />
        <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
          {label}
        </span>
      </div>
      <p
        className={`truncate text-xs sm:text-sm ${
          highlight ? 'font-medium text-emerald-700' : 'text-neutral-900'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
