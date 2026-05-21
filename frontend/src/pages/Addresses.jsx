import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, MapPin, Home } from 'lucide-react'
import api from '../services/api'

const EMPTY = { full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false }

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/auth/addresses/')
      .then(r => setAddresses(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.patch(`/auth/addresses/${editing}/`, form)
        toast.success('Address updated!')
      } else {
        await api.post('/auth/addresses/', form)
        toast.success('Address added!')
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY)
      load()
    } catch {
      toast.error('Failed to save address')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await api.delete(`/auth/addresses/${id}/`)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const startEdit = (addr) => {
    setEditing(addr.id)
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-6 sm:py-8 lg:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
              Saved Locations
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
              My Addresses
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              Manage your delivery addresses for faster checkout.
            </p>
          </div>

          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-4 sm:px-5 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
            Add New Address
          </button>
        </div>

        {/* Form Card */}
        {showForm && (
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 animate-fadeIn">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <Home size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-primary)]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)]">
                {editing ? 'Edit Address' : 'Add New Address'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    Full Name
                  </label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    Address Line 1
                  </label>
                  <input
                    value={form.line1}
                    onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    Address Line 2 <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                  </label>
                  <input
                    value={form.line2}
                    onChange={e => setForm(p => ({ ...p, line2: e.target.value }))}
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="Landmark, building name, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="City name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5">
                    Pincode
                  </label>
                  <input
                    value={form.pincode}
                    onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                    required
                    className="w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer text-xs sm:text-sm text-[var(--color-text)] mb-4 sm:mb-6">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                />
                <span className="font-medium">Set as default address</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  {editing ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 animate-pulse">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-bg-alt)] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-[var(--color-bg-alt)] rounded w-1/3" />
                    <div className="h-2.5 sm:h-3 bg-[var(--color-bg-alt)] rounded w-3/4" />
                    <div className="h-2.5 sm:h-3 bg-[var(--color-bg-alt)] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          /* Empty State */
          <div className="flex flex-col items-center text-center bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-4 sm:mb-5">
              <MapPin size={22} className="sm:w-7 sm:h-7 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">
              No addresses saved yet
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] max-w-sm mb-5 sm:mb-6">
              Add your delivery address to make checkout faster and more convenient.
            </p>
            <button
              onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              Add Your First Address
            </button>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {addresses.map((addr, index) => (
              <div
                key={addr.id}
                className="group bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={16} className="sm:w-5 sm:h-5 text-[var(--color-primary)]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1">
                      <p className="text-xs sm:text-sm font-bold text-[var(--color-text)] truncate">{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full px-2 sm:px-2.5 py-0.5 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border border-[var(--color-primary)]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-0.5 truncate">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-0.5 truncate">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--color-muted)]">{addr.phone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => startEdit(addr)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center justify-center transition-all duration-200"
                    title="Edit"
                  >
                    <Pencil size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger)] text-[var(--color-danger)] hover:text-white flex items-center justify-center transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .animate-fadeUp {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}