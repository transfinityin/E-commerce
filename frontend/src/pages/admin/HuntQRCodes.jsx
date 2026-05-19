// Top of HuntQRCodes.jsx - REPLACE imports:

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  QrCode, Plus, Trash2, Search, ChevronLeft, Download, Copy, X 
} from 'lucide-react'  // ← X ADDED!
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function HuntQRCodes() {
  const navigate = useNavigate()
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerate, setShowGenerate] = useState(false)
  const [orderIds, setOrderIds] = useState('')
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    setLoading(true)
    try {
      // Try to get from admin endpoint or fallback to list
      const res = await api.get('/hunt/admin/generate-qr/')
      // If GET not supported, we'll show empty state
      setQrCodes([])
    } catch (err) {
      // Fallback: fetch all QR codes via other means
      try {
        const res = await api.get('/hunt/qr-status/')
        setQrCodes(res.data?.results || [])
      } catch {
        setQrCodes([])
        console.error('API Error:', err)
  setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      const ids = orderIds.split(',').map(id => id.trim()).filter(Boolean)
      if (ids.length === 0) {
        toast.error('Enter at least one order ID')
        return
      }

      const res = await api.post('/hunt/admin/generate-qr/', { order_ids: ids })
      const generated = res.data?.generated || []

      generated.forEach(item => {
        if (item.status === 'created') {
          toast.success(`QR created: ${item.qr_secret}`)
        } else if (item.status === 'already_exists') {
          toast(`QR already exists: ${item.qr_secret}`, { icon: '⚠️' })
        } else {
          toast.error(`Failed: ${item.order_id}`)
        }
      })

      setOrderIds('')
      setShowGenerate(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate QR codes')
    }
  }

  const handleCopySecret = (secret) => {
    navigator.clipboard.writeText(secret)
    toast.success('Copied to clipboard!')
  }

  // Mock data for display (replace with real API data)
  const mockQRCodes = [
    { id: '1', secret_hash: 'TH-ABC123XYZ', is_activated: true, activated_by: 'John Doe', created_at: '2024-01-15', order_id: 'ORD-001' },
    { id: '2', secret_hash: 'TH-DEF456UVW', is_activated: false, activated_by: null, created_at: '2024-01-16', order_id: 'ORD-002' },
    { id: '3', secret_hash: 'TH-GHI789RST', is_activated: true, activated_by: 'Jane Smith', created_at: '2024-01-17', order_id: 'ORD-003' },
    { id: '4', secret_hash: 'TH-JKL012MNO', is_activated: false, activated_by: null, created_at: '2024-01-18', order_id: 'ORD-004' },
    { id: '5', secret_hash: 'TH-MNO345PQR', is_activated: true, activated_by: 'Mike Johnson', created_at: '2024-01-19', order_id: 'ORD-005' },
  ]

  const displayCodes = qrCodes.length > 0 ? qrCodes : mockQRCodes
  const filteredCodes = displayCodes.filter(qr => 
    qr.secret_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.activated_by?.toLowerCase().includes(searchTerm.toLowerCase())
  )
if (error) return (
  <div className="p-8 text-center">
    <p className="text-red-500">Error: {error}</p>
    <button onClick={() => window.location.reload()}>Reload</button>
  </div>
)
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Treasure Hunt
              </p>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">QR Codes</h1>
            </div>
          </div>
          <button
            onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold px-5 py-3 shadow-md transition-all"
          >
            <Plus size={16} />
            Generate QR
          </button>
        </div>

        {/* Generate Form */}
        {showGenerate && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--color-text)]">Generate QR Codes</h3>
              <button onClick={() => setShowGenerate(false)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGenerate}>
              <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-2 block">
                Order IDs (comma separated)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={orderIds}
                  onChange={(e) => setOrderIds(e.target.value)}
                  placeholder="ORD-001, ORD-002, ORD-003"
                  className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[var(--shadow-gold)]"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Enter order IDs for T-shirt purchases. QR codes will be auto-generated and linked.
              </p>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by QR code, order ID, or user..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] shadow-sm"
          />
        </div>

        {/* QR Codes Table */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[var(--color-surface)] rounded-xl animate-pulse border border-[var(--color-border)]" />
            ))}
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <QrCode size={48} className="text-[var(--color-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No QR Codes</h3>
            <p className="text-[var(--color-muted)] text-sm mb-4">Generate QR codes for T-shirt orders.</p>
            <button
              onClick={() => setShowGenerate(true)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[var(--shadow-gold)]"
            >
              Generate First QR
            </button>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                    <th className="text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">QR Code</th>
                    <th className="text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">Order</th>
                    <th className="text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">Claimed By</th>
                    <th className="text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">Created</th>
                    <th className="text-right text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((qr) => (
                    <tr key={qr.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center">
                            <QrCode size={18} className="text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-mono font-bold text-[var(--color-text)]">{qr.secret_hash}</p>
                            <button
                              onClick={() => handleCopySecret(qr.secret_hash)}
                              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center gap-1"
                            >
                              <Copy size={10} /> Copy
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[var(--color-muted)] font-mono">{qr.order_id || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          qr.is_activated
                            ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                            : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                        }`}>
                          {qr.is_activated ? 'CLAIMED' : 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[var(--color-text)]">
                          {qr.activated_by || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[var(--color-muted)]">
                          {qr.created_at ? new Date(qr.created_at).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopySecret(qr.secret_hash)}
                            className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-all"
                            title="Copy secret"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-all"
                            title="Download QR"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{displayCodes.length}</p>
            <p className="text-xs text-[var(--color-muted)]">Total QR Codes</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-success)]">{displayCodes.filter(q => q.is_activated).length}</p>
            <p className="text-xs text-[var(--color-muted)]">Claimed</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-warning)]">{displayCodes.filter(q => !q.is_activated).length}</p>
            <p className="text-xs text-[var(--color-muted)]">Available</p>
          </div>
        </div>
      </div>
    </div>
  )
}