import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, QrCode, ScanLine, Trash2, Edit3, Eye, Copy, Check, X,
  TrendingUp, Users, Download, ArrowLeft, Sparkles, Loader2, Search,
  Clock, CheckCircle2, XCircle, Percent, Package
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'

const EMPTY_FORM = {
  title: '',
  description: '',
  reveal_type: 'random',
  min_discount: 5,
  max_discount: 50,
  fixed_discount: '',
  max_scans: 100,
  valid_until: '',
  scan_expiry_minutes: 30,
}

const EMPTY_BATCH_FORM = {
  type: 'tshirt',
  order_ids: '',
  arc_slug: 'wanderer',
  discount: '',
  count: 10
}

export default function QROffers() {
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [scanLogs, setScanLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [logsLoading, setLogsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [arcs, setArcs] = useState([])

  // Batch states
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchData, setBatchData] = useState(EMPTY_BATCH_FORM)
  const [batchSaving, setBatchSaving] = useState(false)
  const [generatedResults, setGeneratedResults] = useState(null)

  useEffect(() => {
    fetchOffers()
    fetchArcs()
  }, [])

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/coupons/admin/qr-offers/')
      setOffers(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load QR offers')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchArcs = async () => {
    try {
      const { data } = await api.get('/hunt/arcs/')
      setArcs(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error('Failed to load arcs:', err)
    }
  }

  const fetchScanLogs = async () => {
    setLogsLoading(true)
    try {
      const { data } = await api.get('/coupons/admin/qr-logs/')
      setScanLogs(Array.isArray(data) ? data : data.results || [])
      setShowLogs(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load scan logs')
    } finally {
      setLogsLoading(false)
    }
  }

  const resetForm = () => setFormData(EMPTY_FORM)

  const openCreate = () => {
    resetForm()
    setEditingOffer(null)
    setShowBatchForm(false)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingOffer(null)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const endpoint = editingOffer
      ? `/coupons/admin/qr-offers/${editingOffer.qr_code_id}/`
      : '/coupons/admin/qr-offers/'
    const payload = {
      ...formData,
      fixed_discount: formData.reveal_type === 'fixed' ? formData.fixed_discount : '',
    }
    try {
      if (editingOffer) {
        await api.put(endpoint, payload)
        toast.success('QR offer updated!')
      } else {
        await api.post(endpoint, payload)
        toast.success('QR offer created!')
      }
      closeForm()
      fetchOffers()
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Failed to save QR offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (qrCodeId) => {
    if (!window.confirm('Delete this QR offer?')) return
    setDeletingId(qrCodeId)
    try {
      await api.delete(`/coupons/admin/qr-offers/${qrCodeId}/`)
      toast.success('QR offer deleted!')
      fetchOffers()
    } catch (err) {
      toast.error('Failed to delete QR offer')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (offer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      reveal_type: offer.reveal_type || 'random',
      min_discount: offer.min_discount || 5,
      max_discount: offer.max_discount || 50,
      fixed_discount: offer.fixed_discount || '',
      max_scans: offer.max_scans || 100,
      valid_until: offer.valid_until ? offer.valid_until.slice(0, 16) : '',
      scan_expiry_minutes: offer.scan_expiry_minutes || 30,
    })
    setShowForm(true)
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    setBatchSaving(true)
    setGeneratedResults(null)

    let payload = { type: batchData.type }

    if (batchData.type === 'tshirt') {
      const ids = batchData.order_ids.split(',').map(id => id.trim()).filter(Boolean)
      if (ids.length === 0) {
        toast.error('Please enter at least one Order ID')
        setBatchSaving(false)
        return
      }
      payload.order_ids = ids
    } else if (batchData.type === 'arc') {
      payload.arc_slug = batchData.arc_slug
      payload.count = parseInt(batchData.count) || 1
    } else if (batchData.type === 'coupon') {
      payload.discount = batchData.discount
      payload.count = parseInt(batchData.count) || 1
    }

    try {
      const { data } = await api.post('/hunt/admin/generate-qr/', payload)
      toast.success(`🎉 Generated ${data.total} QRs successfully!`)
      setGeneratedResults(data.generated)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate batch QRs')
    } finally {
      setBatchSaving(false)
    }
  }

  const copyQrCode = async (qrCodeId) => {
    try {
      await navigator.clipboard.writeText(qrCodeId)
      setCopiedId(qrCodeId)
      toast.success('QR code copied!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  const downloadQR = (imageUrl, title) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `qr-${String(title || 'offer').replace(/\s+/g, '-').toLowerCase()}.png`
    link.click()
  }

  const copyAllUrls = () => {
    if (!generatedResults) return
    const urls = generatedResults.map(r => r.qr_url).join('\n')
    navigator.clipboard.writeText(urls)
    toast.success('All URLs copied!')
  }

  const filteredOffers = offers.filter((offer) => {
    const search = searchTerm.toLowerCase()
    return (
      offer.title?.toLowerCase().includes(search) ||
      offer.qr_code_id?.toLowerCase().includes(search) ||
      offer.reveal_type?.toLowerCase().includes(search)
    )
  })

  const totalScans = offers.reduce((sum, offer) => sum + (offer.scan_count || 0), 0)
  const activeOffers = offers.filter((offer) => offer.is_active && offer.is_valid_now).length
  const inactiveOffers = offers.length - activeOffers

  const inputClass = 'w-full bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all'

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="mb-8">
            <div className="h-3 skeleton-dark w-32 mb-4" />
            <div className="h-9 skeleton-dark w-56" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 skeleton-dark border border-gold/10" />)}
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((item) => <div key={item} className="w-full h-20 skeleton-dark border border-gold/10" />)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7 sm:mb-9">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-[#0A0A0A] border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="label-gold mb-2">QR Campaigns & Physical Batch</p>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
                QR <span className="text-gradient-gold">STUDIO</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
                Create digital QR campaigns, generate physical mystery cards, track scans.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchScanLogs}
              disabled={logsLoading}
              className="btn-outline inline-flex items-center gap-2 disabled:opacity-50"
            >
              {logsLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
              LOGS
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setShowBatchForm(v => !v); setGeneratedResults(null) }}
              className="btn-outline inline-flex items-center gap-2 border-gold/50 text-gold hover:bg-gold/10"
            >
              <Package size={16} /> BATCH PRINT
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} /> DIGITAL OFFER
            </button>
          </div>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* ── BATCH FORM ── */}
        {showBatchForm && (
          <section className="bg-black border border-gold/30 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-[0_0_40px_rgba(212,175,55,0.1)] animate-fadeIn">
            <div className="flex justify-between mb-6">
              <div>
                <p className="label-gold mb-1">Physical Print Generator</p>
                <h2 className="font-display text-xl text-white">GENERATE BATCH QRs</h2>
              </div>
              <button type="button" onClick={() => { setShowBatchForm(false); setGeneratedResults(null) }} className="text-muted hover:text-gold">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="flex flex-col gap-5">
              {/* Type Tabs */}
              <div className="flex gap-3 bg-[#0A0A0A] p-2 border border-gold/15">
                {['tshirt', 'arc', 'coupon'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setBatchData({ ...EMPTY_BATCH_FORM, type }); setGeneratedResults(null) }}
                    className={`flex-1 py-3 text-xs font-mono uppercase tracking-widest transition-all ${
                      batchData.type === type ? 'bg-gold text-black' : 'text-muted hover:text-gold'
                    }`}
                  >
                    {type === 'tshirt' ? 'T-Shirt QRs' : type === 'arc' ? 'Arc Mystery' : 'Coupon Mystery'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {batchData.type === 'tshirt' && (
                  <Field label="Order IDs (Comma Separated)" className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. 1042, 1043, 1044"
                      className={inputClass}
                      value={batchData.order_ids}
                      onChange={e => setBatchData({ ...batchData, order_ids: e.target.value })}
                      required
                    />
                    <p className="text-[10px] text-muted font-mono">Each order ID = one unique T-shirt QR code</p>
                  </Field>
                )}

                {batchData.type === 'arc' && (
                  <>
                    <Field label="Target Arc">
                      <select
                        className={inputClass}
                        value={batchData.arc_slug}
                        onChange={e => setBatchData({ ...batchData, arc_slug: e.target.value })}
                      >
                        {arcs.length > 0
                          ? arcs.map(arc => (
                              <option key={arc.arc_key} value={arc.arc_key}>
                                {arc.name} ({String(arc.arc_number).padStart(2, '0')})
                              </option>
                            ))
                          : (
                            <>
                              <option value="wanderer">Wanderer (01)</option>
                              <option value="founderer">Founderer (02)</option>
                              <option value="phantom">Phantom (03)</option>
                            </>
                          )
                        }
                      </select>
                    </Field>
                    <Field label="Number of Cards">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        className={inputClass}
                        value={batchData.count}
                        onChange={e => setBatchData({ ...batchData, count: e.target.value })}
                      />
                    </Field>
                  </>
                )}

                {batchData.type === 'coupon' && (
                  <>
                    <Field label="Discount Percentage (%)">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        placeholder="e.g. 15"
                        className={inputClass}
                        value={batchData.discount}
                        onChange={e => setBatchData({ ...batchData, discount: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Number of Cards">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        className={inputClass}
                        value={batchData.count}
                        onChange={e => setBatchData({ ...batchData, count: e.target.value })}
                      />
                    </Field>
                  </>
                )}
              </div>

              <button type="submit" disabled={batchSaving} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {batchSaving
                  ? <><Loader2 className="animate-spin" size={16} /> GENERATING...</>
                  : <><Package size={16} /> GENERATE BATCH CODES</>
                }
              </button>
            </form>

            {/* Generated Results */}
            {generatedResults && (
              <div className="mt-6 border border-gold/20 bg-[#0A0A0A]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gold/15">
                  <p className="text-xs font-mono text-gold uppercase tracking-wider">
                    ✓ {generatedResults.length} QRs Generated
                  </p>
                  <button
                    type="button"
                    onClick={copyAllUrls}
                    className="text-[10px] font-mono text-gold/70 hover:text-gold border border-gold/20 px-3 py-1.5 hover:border-gold/50 transition-all flex items-center gap-1.5"
                  >
                    <Copy size={11} /> COPY ALL URLs
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-gold/10">
                  {generatedResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-gold/5">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-muted mr-3">#{i + 1}</span>
                        <span className="text-xs font-mono text-white truncate">{r.qr_secret}</span>
                        {r.status && r.status !== 'created' && (
                          <span className="ml-2 text-[9px] font-mono text-gold/50 uppercase">{r.status}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(r.qr_url); toast.success('URL copied!') }}
                        className="shrink-0 ml-3 text-muted hover:text-gold"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── DIGITAL OFFER FORM ── */}
        {showForm && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fadeIn shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="label-gold mb-2">{editingOffer ? 'Edit Campaign' : 'Create Digital Campaign'}</p>
                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                  {editingOffer ? 'EDIT DIGITAL OFFER' : 'CREATE DIGITAL OFFER'}
                </h2>
              </div>
              <button type="button" className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold transition-all" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <Field label="Offer Title" className="md:col-span-2">
                  <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Sale Special" required className={inputClass} />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." className={inputClass} />
                </Field>
                <Field label="Reveal Type">
                  <select value={formData.reveal_type} onChange={e => setFormData(p => ({ ...p, reveal_type: e.target.value }))} className={inputClass}>
                    <option value="random">Random Discount</option>
                    <option value="fixed">Fixed Discount</option>
                    <option value="spin">Spin Wheel</option>
                    <option value="scratch">Scratch Card</option>
                  </select>
                </Field>
                <Field label="Max Scans">
                  <input type="number" value={formData.max_scans} onChange={e => setFormData(p => ({ ...p, max_scans: parseInt(e.target.value) || 1 }))} min="1" className={inputClass} />
                </Field>
                {formData.reveal_type === 'fixed' ? (
                  <Field label="Fixed Discount">
                    <input type="number" value={formData.fixed_discount} onChange={e => setFormData(p => ({ ...p, fixed_discount: e.target.value }))} placeholder="e.g. 25" min="1" max="99" className={inputClass} />
                  </Field>
                ) : (
                  <>
                    <Field label="Min Discount">
                      <input type="number" value={formData.min_discount} onChange={e => setFormData(p => ({ ...p, min_discount: parseFloat(e.target.value) || 1 }))} min="1" max="99" className={inputClass} />
                    </Field>
                    <Field label="Max Discount">
                      <input type="number" value={formData.max_discount} onChange={e => setFormData(p => ({ ...p, max_discount: parseFloat(e.target.value) || 1 }))} min="1" max="99" className={inputClass} />
                    </Field>
                  </>
                )}
                <Field label="Valid Until">
                  <input type="datetime-local" value={formData.valid_until} onChange={e => setFormData(p => ({ ...p, valid_until: e.target.value }))} className={inputClass} />
                </Field>
                <Field label="Coupon Expiry Minutes">
                  <input type="number" value={formData.scan_expiry_minutes} onChange={e => setFormData(p => ({ ...p, scan_expiry_minutes: parseInt(e.target.value) || 5 }))} min="5" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> SAVING...</> : <><Sparkles size={16} />{editingOffer ? 'UPDATE OFFER' : 'CREATE & GENERATE QR'}</>}
                </button>
                <button type="button" onClick={closeForm} className="btn-outline inline-flex items-center justify-center">CANCEL</button>
              </div>
            </form>
          </section>
        )}

        {/* ── STATS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-9">
          <StatCard icon={QrCode} label="Total Offers" value={offers.length} />
          <StatCard icon={ScanLine} label="Total Scans" value={totalScans} />
          <StatCard icon={TrendingUp} label="Active Now" value={activeOffers} />
          <StatCard icon={Users} label="Inactive" value={inactiveOffers} danger />
        </section>

        {/* ── SEARCH ── */}
        <section className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, QR code, or reveal type..."
            className="w-full bg-[#0A0A0A] border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider pl-11 pr-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          />
        </section>

        {/* ── SCAN LOGS ── */}
        {showLogs && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fadeIn">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="label-gold mb-2">Scan Activity</p>
                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">SCAN LOGS</h2>
              </div>
              <button type="button" className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold transition-all" onClick={() => setShowLogs(false)}>
                <X size={18} />
              </button>
            </div>
            {scanLogs.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 border border-gold/10 bg-black">
                <ScanLine size={36} className="text-gold/45 mb-4" />
                <p className="text-sm text-muted font-mono tracking-wider">No scans yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto border border-gold/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/10 bg-black">
                        {['Offer', 'Discount', 'Coupon', 'Used', 'Scanned At'].map(h => <TableHead key={h}>{h}</TableHead>)}
                      </tr>
                    </thead>
                    <tbody>
                      {scanLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors">
                          <td className="text-white font-mono px-5 py-4">{log.qr_offer_title}</td>
                          <td className="font-mono text-gold px-5 py-4">{log.discount_revealed}%</td>
                          <td className="font-mono text-white px-5 py-4">{log.coupon_code}</td>
                          <td className="px-5 py-4"><UsedBadge used={log.is_used} /></td>
                          <td className="text-muted text-xs font-mono px-5 py-4">
                            {log.scanned_at ? new Date(log.scanned_at).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="lg:hidden flex flex-col gap-3">
                  {scanLogs.map((log) => (
                    <article key={log.id} className="bg-black border border-gold/10 p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted font-mono tracking-wider uppercase mb-1">Offer</p>
                          <h3 className="text-sm text-white font-mono">{log.qr_offer_title}</h3>
                        </div>
                        <UsedBadge used={log.is_used} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <MiniBox label="Discount" value={`${log.discount_revealed}%`} gold />
                        <MiniBox label="Coupon" value={log.coupon_code || '—'} />
                        <MiniBox label="Scanned" value={log.scanned_at ? new Date(log.scanned_at).toLocaleDateString('en-IN') : 'N/A'} />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── OFFERS TABLE / EMPTY STATE ── */}
        {filteredOffers.length === 0 && !showForm ? (
          <section className="bg-[#0A0A0A] border border-gold/15 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <QrCode size={38} className="text-gold/50" />
            </div>
            <p className="label-gold mb-3">No Campaign Signal</p>
            <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO QR OFFERS <span className="text-gradient-gold">FOUND</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              Create your first QR offer to start generating coupons.
            </p>
            <button type="button" className="btn-primary inline-flex items-center justify-center gap-2" onClick={openCreate}>
              <Plus size={16} /> CREATE YOUR FIRST OFFER
            </button>
          </section>
        ) : (
          <>
            {/* Desktop Table */}
            <section className="hidden lg:block bg-[#0A0A0A] border border-gold/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 bg-black">
                      {['QR Offer', 'Type', 'Discount', 'Scans', 'Status', 'Actions'].map(h => <TableHead key={h}>{h}</TableHead>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id || offer.qr_code_id} className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors duration-200">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black border border-gold/15 flex items-center justify-center overflow-hidden shrink-0">
                              {offer.qr_image_url
                                ? <img src={offer.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                                : <QrCode size={18} className="text-muted" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-display text-white tracking-wider truncate max-w-[260px]">{offer.title}</p>
                              <p className="text-[10px] text-muted font-mono mt-1 truncate max-w-[260px]">{offer.qr_code_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><TypeBadge type={offer.reveal_type} /></td>
                        <td className="font-mono text-gold px-5 py-4">
                          {offer.reveal_type === 'fixed' ? `${offer.fixed_discount}%` : `${offer.min_discount}-${offer.max_discount}%`}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted font-mono">
                            <ScanLine size={14} />
                            <span>{offer.scan_count || 0} / {offer.max_scans}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><OfferStatus active={offer.is_valid_now} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ActionButton onClick={() => handleEdit(offer)} label="Edit"><Edit3 size={14} /></ActionButton>
                            <ActionButton onClick={() => copyQrCode(offer.qr_code_id)} label="Copy QR code">
                              {copiedId === offer.qr_code_id ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                            </ActionButton>
                            {offer.qr_image_url && (
                              <ActionButton onClick={() => downloadQR(offer.qr_image_url, offer.title)} label="Download QR">
                                <Download size={14} />
                              </ActionButton>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(offer.qr_code_id)}
                              disabled={deletingId === offer.qr_code_id}
                              className="w-9 h-9 bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === offer.qr_code_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
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
              {filteredOffers.map((offer) => (
                <article key={offer.id || offer.qr_code_id} className="bg-[#0A0A0A] border border-gold/15 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-black border border-gold/15 flex items-center justify-center overflow-hidden shrink-0">
                      {offer.qr_image_url
                        ? <img src={offer.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                        : <QrCode size={24} className="text-muted" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-display text-sm text-white tracking-wider line-clamp-2">{offer.title}</h3>
                          <p className="text-[10px] text-muted font-mono mt-1 break-all">{offer.qr_code_id}</p>
                        </div>
                        <OfferStatus active={offer.is_valid_now} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <MiniBox label="Type" value={offer.reveal_type} />
                        <MiniBox label="Discount" value={offer.reveal_type === 'fixed' ? `${offer.fixed_discount}%` : `${offer.min_discount}-${offer.max_discount}%`} gold />
                        <MiniBox label="Scans" value={`${offer.scan_count || 0}/${offer.max_scans}`} />
                        <MiniBox label="Valid" value={offer.is_valid_now ? 'Active' : 'Inactive'} gold={offer.is_valid_now} />
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button type="button" onClick={() => handleEdit(offer)} className="flex-1 btn-outline !px-3 !py-2 inline-flex items-center justify-center gap-2">
                          <Edit3 size={13} /> EDIT
                        </button>
                        <button type="button" onClick={() => copyQrCode(offer.qr_code_id)} className="flex-1 btn-outline !px-3 !py-2 inline-flex items-center justify-center gap-2">
                          {copiedId === offer.qr_code_id ? <Check size={13} /> : <Copy size={13} />} COPY
                        </button>
                        {offer.qr_image_url && (
                          <button type="button" onClick={() => downloadQR(offer.qr_image_url, offer.title)} className="w-10 h-10 bg-black border border-gold/15 text-gold flex items-center justify-center">
                            <Download size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(offer.qr_code_id)}
                          disabled={deletingId === offer.qr_code_id}
                          className="w-10 h-10 border border-red-400/25 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          {deletingId === offer.qr_code_id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
      `}</style>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-gold/75">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, danger = false }) {
  return (
    <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-5 hover:border-gold/35 transition-all duration-300">
      <div className={`w-10 h-10 border flex items-center justify-center mb-4 ${danger ? 'bg-red-400/10 border-red-400/25 text-red-400' : 'bg-gold/10 border-gold/20 text-gold'}`}>
        <Icon size={18} />
      </div>
      <p className="font-display text-xl sm:text-2xl text-white">{Number(value || 0).toLocaleString('en-IN')}</p>
      <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider uppercase mt-1">{label}</p>
    </div>
  )
}

function TableHead({ children }) {
  return <th className="text-left text-[10px] font-mono text-gold/70 uppercase tracking-[0.18em] px-5 py-3">{children}</th>
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 bg-gold/10 text-gold border border-gold/25">
      <Percent size={12} />{type}
    </span>
  )
}

function OfferStatus({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border shrink-0 ${active ? 'bg-gold/10 text-gold border-gold/30' : 'bg-red-400/10 text-red-400 border-red-400/30'}`}>
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function UsedBadge({ used }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border ${used ? 'bg-gold/10 text-gold border-gold/30' : 'bg-black text-muted border-gold/20'}`}>
      {used ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {used ? 'Used' : 'Pending'}
    </span>
  )
}

function ActionButton({ children, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all" title={label} aria-label={label}>
      {children}
    </button>
  )
}

function MiniBox({ label, value, gold = false }) {
  return (
    <div className="bg-black border border-gold/10 p-2.5">
      <p className="text-[9px] text-muted font-mono tracking-wider uppercase mb-1">{label}</p>
      <p className={`text-xs font-mono truncate ${gold ? 'text-gold' : 'text-white'}`}>{value}</p>
    </div>
  )
}