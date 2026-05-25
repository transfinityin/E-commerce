import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode,
  Plus,
  Search,
  ChevronLeft,
  Download,
  Copy,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
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
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    setLoading(true)
    setError(null)

    try {
      await api.get('/hunt/admin/generate-qr/')
      setQrCodes([])
    } catch (err) {
      try {
        const res = await api.get('/hunt/qr-status/')
        setQrCodes(res.data?.results || res.data || [])
      } catch {
        setQrCodes([])
        setError(err.message || 'Failed to load QR codes')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (event) => {
    event.preventDefault()

    const ids = orderIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      toast.error('Enter at least one order ID')
      return
    }

    setGenerating(true)

    try {
      const res = await api.post('/hunt/admin/generate-qr/', {
        order_ids: ids,
      })

      const generated = res.data?.generated || []

      generated.forEach((item) => {
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
      fetchQRCodes()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate QR codes')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopySecret = async (secret) => {
    try {
      await navigator.clipboard.writeText(secret)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Copy failed')
    }
  }

  const mockQRCodes = [
    {
      id: '1',
      secret_hash: 'TH-ABC123XYZ',
      is_activated: true,
      activated_by: 'John Doe',
      created_at: '2024-01-15',
      order_id: 'ORD-001',
    },
    {
      id: '2',
      secret_hash: 'TH-DEF456UVW',
      is_activated: false,
      activated_by: null,
      created_at: '2024-01-16',
      order_id: 'ORD-002',
    },
    {
      id: '3',
      secret_hash: 'TH-GHI789RST',
      is_activated: true,
      activated_by: 'Jane Smith',
      created_at: '2024-01-17',
      order_id: 'ORD-003',
    },
    {
      id: '4',
      secret_hash: 'TH-JKL012MNO',
      is_activated: false,
      activated_by: null,
      created_at: '2024-01-18',
      order_id: 'ORD-004',
    },
    {
      id: '5',
      secret_hash: 'TH-MNO345PQR',
      is_activated: true,
      activated_by: 'Mike Johnson',
      created_at: '2024-01-19',
      order_id: 'ORD-005',
    },
  ]

  const displayCodes = qrCodes.length > 0 ? qrCodes : mockQRCodes

  const filteredCodes = displayCodes.filter((qr) => {
    const search = searchTerm.toLowerCase()

    return (
      qr.secret_hash?.toLowerCase().includes(search) ||
      qr.order_id?.toLowerCase().includes(search) ||
      qr.activated_by?.toLowerCase().includes(search)
    )
  })

  const totalCodes = displayCodes.length
  const claimedCodes = displayCodes.filter((qr) => qr.is_activated).length
  const availableCodes = displayCodes.filter((qr) => !qr.is_activated).length

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-red-400/25 p-6 sm:p-8 text-center">
          <AlertCircle size={42} className="text-red-400 mx-auto mb-4" />

          <p className="label-gold mb-3">QR System Error</p>

          <h1 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
            FAILED TO <span className="text-gradient-gold">LOAD</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchQRCodes}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7 sm:mb-9">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-[#0A0A0A] border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all shrink-0"
              aria-label="Back to admin"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <p className="label-gold mb-2">Treasure Hunt</p>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight">
                QR <span className="text-gradient-gold">CODES</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-2">
                Generate, track, and manage artifact QR codes for treasure hunt access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGenerate(true)}
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            GENERATE QR
          </button>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* Generate Form */}
        {showGenerate && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fadeIn shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="label-gold mb-2">Generation Protocol</p>

                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                  GENERATE QR CODES
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowGenerate(false)}
                className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
                aria-label="Close generate form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <div>
                <label className="label-gold text-[10px] sm:text-[11px] mb-2 block">
                  Order IDs
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={orderIds}
                    onChange={(event) => setOrderIds(event.target.value)}
                    placeholder="ORD-001, ORD-002, ORD-003"
                    className="flex-1 bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
                  />

                  <button
                    type="submit"
                    disabled={generating}
                    className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        GENERATING
                      </>
                    ) : (
                      'GENERATE'
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted font-mono tracking-wider leading-relaxed mt-2">
                  Enter comma-separated order IDs for T-shirt purchases. QR codes will be generated and linked.
                </p>
              </div>
            </form>
          </section>
        )}

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
            placeholder="Search by QR code, order ID, or user..."
            className="w-full bg-[#0A0A0A] border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider pl-11 pr-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          />
        </section>

        {/* QR Codes */}
        {loading ? (
          <section className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 skeleton-dark border border-gold/10 animate-pulse"
              />
            ))}
          </section>
        ) : filteredCodes.length === 0 ? (
          <section className="bg-[#0A0A0A] border border-gold/15 p-10 sm:p-12 text-center">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <QrCode size={36} className="text-gold/50" />
            </div>

            <p className="label-gold mb-3">No QR Signal</p>

            <h3 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO QR CODES <span className="text-gradient-gold">FOUND</span>
            </h3>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              Generate QR codes for T-shirt orders or adjust your search query.
            </p>

            <button
              type="button"
              onClick={() => setShowGenerate(true)}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              GENERATE FIRST QR
            </button>
          </section>
        ) : (
          <>
            {/* Desktop Table */}
            <section className="hidden lg:block bg-[#0A0A0A] border border-gold/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/10 bg-black">
                      <TableHead>QR Code</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Claimed By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead align="right">Actions</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCodes.map((qr) => (
                      <tr
                        key={qr.id}
                        className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                              <QrCode size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-mono text-white tracking-wider">
                                {qr.secret_hash}
                              </p>

                              <button
                                type="button"
                                onClick={() => handleCopySecret(qr.secret_hash)}
                                className="text-[10px] text-gold hover:text-gold-light flex items-center gap-1 mt-1 bg-transparent border-none cursor-pointer font-mono tracking-wider uppercase"
                              >
                                <Copy size={10} />
                                Copy
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-muted font-mono">
                            {qr.order_id || 'N/A'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusPill active={qr.is_activated} />
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-white font-mono">
                            {qr.activated_by || '-'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-muted font-mono">
                            {qr.created_at
                              ? new Date(qr.created_at).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <IconButton
                              onClick={() => handleCopySecret(qr.secret_hash)}
                              label="Copy secret"
                            >
                              <Copy size={14} />
                            </IconButton>

                            <IconButton label="Download QR">
                              <Download size={14} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile Cards */}
            <section className="lg:hidden flex flex-col gap-3">
              {filteredCodes.map((qr) => (
                <article
                  key={qr.id}
                  className="bg-[#0A0A0A] border border-gold/15 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                      <QrCode size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-mono text-white tracking-wider break-all">
                          {qr.secret_hash}
                        </p>

                        <StatusPill active={qr.is_activated} />
                      </div>

                      <div className="space-y-1 text-xs font-mono text-muted">
                        <p>Order: {qr.order_id || 'N/A'}</p>
                        <p>Claimed By: {qr.activated_by || '-'}</p>
                        <p>
                          Created:{' '}
                          {qr.created_at
                            ? new Date(qr.created_at).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleCopySecret(qr.secret_hash)}
                          className="flex-1 btn-outline !px-3 !py-2 inline-flex items-center justify-center gap-2"
                        >
                          <Copy size={13} />
                          COPY
                        </button>

                        <button
                          type="button"
                          className="flex-1 btn-outline !px-3 !py-2 inline-flex items-center justify-center gap-2"
                        >
                          <Download size={13} />
                          DOWNLOAD
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {/* Stats Footer */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
          <StatCard label="Total QR Codes" value={totalCodes} />
          <StatCard label="Claimed" value={claimedCodes} variant="gold" />
          <StatCard label="Available" value={availableCodes} variant="warning" />
        </section>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  )
}

function TableHead({ children, align = 'left' }) {
  return (
    <th
      className={`text-${align} text-[10px] font-mono text-gold/70 uppercase tracking-[0.18em] px-5 py-3`}
    >
      {children}
    </th>
  )
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${
        active
          ? 'bg-gold/10 text-gold border-gold/30'
          : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {active ? 'Claimed' : 'Available'}
    </span>
  )
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  )
}

function StatCard({ label, value, variant = 'default' }) {
  const valueClass =
    variant === 'gold'
      ? 'text-gold'
      : variant === 'warning'
        ? 'text-yellow-400'
        : 'text-white'

  return (
    <div className="bg-[#0A0A0A] border border-gold/15 p-3 sm:p-4 text-center">
      <p className={`font-display text-xl sm:text-2xl ${valueClass}`}>
        {Number(value || 0).toLocaleString('en-IN')}
      </p>

      <p className="text-[9px] sm:text-xs text-muted font-mono tracking-wider uppercase mt-1 leading-tight">
        {label}
      </p>
    </div>
  )
}