import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import api from '../services/api'

const EMPTY = { full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false }

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = () => api.get('/auth/addresses/').then(r => setAddresses(r.data.results || r.data))

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
      setShowForm(false); setEditing(null); setForm(EMPTY); load()
    } catch { toast.error('Failed to save address') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    await api.delete(`/auth/addresses/${id}/`)
    toast.success('Deleted'); load()
  }

  const startEdit = (addr) => {
    setEditing(addr.id)
    setForm({
      full_name: addr.full_name, phone: addr.phone, line1: addr.line1,
      line2: addr.line2, city: addr.city, state: addr.state,
      pincode: addr.pincode, is_default: addr.is_default
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto" style={{ padding: '32px 16px' }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              Saved Locations
            </p>
            <h1 className="text-2xl font-bold"style={{ marginBottom: '8px',color: 'var(--color-primary)' }}>
              My Addresses
            </h1>
           <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Manage your delivery addresses for faster checkout.
            </p>
          </div>

          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
            className="flex items-center text-white rounded-xl text-sm font-semibold transition-all border-none cursor-pointer" style={{ background: 'var(--color-primary)', gap: '8px' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
            style={{ padding: '12px 20px', gap: '8px' }}
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        {/* Form Card */}
        {showForm && (
          <div className="rounded-2xl shadow-sm" style={{background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '24px', marginBottom: '24px' }}>
            <h2 className="text-lg font-bold text-[#C8A96E]" style={{ marginBottom: '20px' }}>
              {editing ? 'Edit Address' : 'Add New Address'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                {[
                  { key: 'full_name', label: 'Full Name', col: 2 },
                  { key: 'phone', label: 'Phone', col: 1 },
                  { key: 'line1', label: 'Address Line 1', col: 2 },
                  { key: 'line2', label: 'Address Line 2', col: 2 },
                  { key: 'city', label: 'City', col: 1 },
                  { key: 'state', label: 'State', col: 1 },
                  { key: 'pincode', label: 'Pincode', col: 1 },
                ].map(f => (
                  <div key={f.key} className={f.col === 2 ? 'md:col-span-2' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                    <input
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                      className="w-full rounded-xl text-sm outline-none transition-all" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '12px 16px',padding: '12px 16px' }}
                      
                    />
                  </div>
                ))}
              </div>

              <label className="flex items-center cursor-pointer text-sm" style={{ color: 'var(--color-text)',gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
                  className="accent-amber-600 w-4 h-4"
                />
                Set as default address
              </label>

              <div className="flex" style={{ gap: '12px' }}>
                <button
                  type="submit"
                  className="text-white rounded-xl text-sm font-semibold transition-all border-none cursor-pointer" style={{ padding: '12px 24px',background: 'var(--color-primary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)' }
                  
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl text-sm font-semibold transition-all cursor-pointer" style={{  padding: '12px 24px' ,background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-alt)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {addresses.length === 0 && !showForm ? (
          <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200" style={{ padding: '64px 20px' }}>
            <div className="text-slate-300" style={{ marginBottom: '16px' }}>
              <MapPin size={48} />
            </div>
            <h3 className="text-lg font-bold text-[#C8A96E]" style={{ marginBottom: '8px' }}>
              No addresses saved yet
            </h3>
           <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Add your delivery address to make checkout faster.
            </p>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '20px' }}>
                <div className="flex" style={{ gap: '16px' }}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <MapPin size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap" style={{ gap: '8px', marginBottom: '6px' }}>
                      <p className="text-sm font-bold text-[#C8A96E]">{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full" style={{ padding: '2px 10px',background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-primary)' }}>
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{marginBottom: '4px', color: 'var(--color-muted)' }}>
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                     <p className="text-sm" style={{marginBottom: '4px', color: 'var(--color-muted)' }}>
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{addr.phone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end" style={{ gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => startEdit(addr)}
                   className="flex items-center justify-center rounded-lg transition-all border-none cursor-pointer" style={{ width: '36px', height: '36px', background: 'var(--color-bg-alt)', color: 'var(--color-muted)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-primary)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-alt)'; e.currentTarget.style.color = 'var(--color-muted)' }}
                   
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                   className="flex items-center justify-center rounded-lg transition-all border-none cursor-pointer" style={{width: '36px', height: '36px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger)'; e.currentTarget.style.color = 'var(--color-text-inverse)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-danger-bg)'; e.currentTarget.style.color = 'var(--color-danger)' }}
                    
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}