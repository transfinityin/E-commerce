import { useEffect, useState } from 'react'
import {
  Plus, QrCode, ScanLine, Trash2, Edit3, Eye, Copy, Check, X,
  TrendingUp, Users, Download, Sparkles, Loader2, Search,
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

const INPUT_CLASS =
  'w-full !rounded-full bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 !border-0 ring-1 ring-black/8 outline-none transition focus:ring-2 focus:ring-neutral-950/15'

const SEARCH_CLASS =
  'w-full !rounded-full bg-white !py-3.5 !pl-11 !pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 !border-0 ring-1 ring-black/8 outline-none transition focus:ring-2 focus:ring-neutral-950/15'

const BTN_PRIMARY =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-50'

const BTN_OUTLINE =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase ring-1 ring-black/8 transition hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50'

const PANEL =
  'rounded-2xl bg-white shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5'

export default function QROffers() {
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
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (formData.reveal_type === 'fixed' && !formData.fixed_discount) {
      toast.error('Fixed discount is required for this reveal type')
      return
    }
    setSaving(true)
    const endpoint = editingOffer
      ? `/coupons/admin/qr-offers/${editingOffer.qr_code_id}/`
      : '/coupons/admin/qr-offers/'
    const payload = {
      title: formData.title,
      description: formData.description,
      reveal_type: formData.reveal_type,
      min_discount: Number(formData.min_discount) || 0,
      max_discount: Number(formData.max_discount) || 0,
      max_scans: Number(formData.max_scans) || 0,
      scan_expiry_minutes: Number(formData.scan_expiry_minutes) || 30,
      fixed_discount:
        formData.reveal_type === 'fixed' && formData.fixed_discount !== ''
          ? Number(formData.fixed_discount)
          : null,
      // Empty string breaks DRF DateTimeField — omit / null when unset
      valid_until: formData.valid_until ? formData.valid_until : null,
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
      const data = err.response?.data
      const fieldError =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join(' · ')
          : null
      toast.error(data?.detail || data?.error || fieldError || 'Failed to save QR offer')
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

  if (loading) {
    return (
      <div className="space-y-7 sm:space-y-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#F4F4F2]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-[#F4F4F2] ring-1 ring-black/5" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-[#F4F4F2] ring-1 ring-black/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7 sm:space-y-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              QR campaigns
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
              QR offers
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
              Create digital QR campaigns, generate physical mystery cards, and track scans.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={fetchScanLogs} disabled={logsLoading} className={BTN_OUTLINE}>
              {logsLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
              Logs
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setShowBatchForm(v => !v); setGeneratedResults(null) }}
              className={BTN_OUTLINE}
            >
              <Package size={16} /> Batch print
            </button>
            <button type="button" onClick={openCreate} className={BTN_PRIMARY}>
              <Plus size={16} /> Digital offer
            </button>
          </div>
        </section>

        {/* ── BATCH FORM ── */}
        {showBatchForm && (
          <section className={`${PANEL} animate-fadeIn p-4 sm:p-6 lg:p-8`}>
            <div className="mb-6 flex justify-between">
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Physical print
                </p>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                  Generate batch QRs
                </h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowBatchForm(false); setGeneratedResults(null) }}
                className="text-neutral-400 transition hover:text-neutral-950"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="flex flex-col gap-5">
              <div className="flex gap-2 rounded-xl bg-[#F4F4F2] p-1.5 ring-1 ring-black/5">
                {['tshirt', 'arc', 'coupon'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setBatchData({ ...EMPTY_BATCH_FORM, type }); setGeneratedResults(null) }}
                    className={`flex-1 rounded-lg py-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase transition ${
                      batchData.type === type
                        ? 'bg-neutral-950 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {type === 'tshirt' ? 'T-shirt QRs' : type === 'arc' ? 'Arc mystery' : 'Coupon mystery'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {batchData.type === 'tshirt' && (
                  <Field label="Order IDs (Comma Separated)" className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. 1042, 1043, 1044"
                      className={INPUT_CLASS}
                      value={batchData.order_ids}
                      onChange={e => setBatchData({ ...batchData, order_ids: e.target.value })}
                      required
                    />
                    <p className="text-[11px] text-neutral-500">Each order ID = one unique T-shirt QR code</p>
                  </Field>
                )}

                {batchData.type === 'arc' && (
                  <>
                    <Field label="Target Arc">
                      <select
                        className={INPUT_CLASS}
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
                        className={INPUT_CLASS}
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
                        className={INPUT_CLASS}
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
                        className={INPUT_CLASS}
                        value={batchData.count}
                        onChange={e => setBatchData({ ...batchData, count: e.target.value })}
                      />
                    </Field>
                  </>
                )}
              </div>

              <button type="submit" disabled={batchSaving} className={BTN_PRIMARY}>
                {batchSaving
                  ? <><Loader2 className="animate-spin" size={16} /> Generating...</>
                  : <><Package size={16} /> Generate batch codes</>
                }
              </button>
            </form>

            {generatedResults && (
              <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-black/8">
                <div className="flex items-center justify-between border-b border-black/5 bg-[#F4F4F2] px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.12em] text-neutral-800 uppercase">
                    ✓ {generatedResults.length} QRs generated
                  </p>
                  <button
                    type="button"
                    onClick={copyAllUrls}
                    className={`${BTN_OUTLINE} !h-8 !px-3 !text-[9px]`}
                  >
                    <Copy size={11} /> Copy all URLs
                  </button>
                </div>
                <div className="max-h-48 divide-y divide-black/5 overflow-y-auto bg-white">
                  {generatedResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F4F4F2]/50">
                      <div className="min-w-0">
                        <span className="mr-3 text-[10px] text-neutral-400">#{i + 1}</span>
                        <span className="truncate text-xs text-neutral-900">{r.qr_secret}</span>
                        {r.status && r.status !== 'created' && (
                          <span className="ml-2 text-[9px] font-medium text-neutral-500 uppercase">{r.status}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(r.qr_url); toast.success('URL copied!') }}
                        className="ml-3 shrink-0 text-neutral-400 hover:text-neutral-950"
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
          <section className={`${PANEL} animate-fadeIn p-4 sm:p-6 lg:p-8`}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  {editingOffer ? 'Edit campaign' : 'Create campaign'}
                </p>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 sm:text-xl">
                  {editingOffer ? 'Edit digital offer' : 'Create digital offer'}
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-500 transition hover:text-neutral-950"
                onClick={closeForm}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                <Field label="Offer Title" className="md:col-span-2">
                  <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Sale Special" required className={INPUT_CLASS} />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." className={INPUT_CLASS} />
                </Field>
                <Field label="Reveal Type">
                  <select value={formData.reveal_type} onChange={e => setFormData(p => ({ ...p, reveal_type: e.target.value }))} className={INPUT_CLASS}>
                    <option value="random">Random Discount</option>
                    <option value="fixed">Fixed Discount</option>
                    <option value="spin">Spin Wheel</option>
                    <option value="scratch">Scratch Card</option>
                  </select>
                </Field>
                <Field label="Max Scans">
                  <input type="number" value={formData.max_scans} onChange={e => setFormData(p => ({ ...p, max_scans: parseInt(e.target.value) || 1 }))} min="1" className={INPUT_CLASS} />
                </Field>
                {formData.reveal_type === 'fixed' ? (
                  <Field label="Fixed Discount">
                    <input type="number" value={formData.fixed_discount} onChange={e => setFormData(p => ({ ...p, fixed_discount: e.target.value }))} placeholder="e.g. 25" min="1" max="99" className={INPUT_CLASS} />
                  </Field>
                ) : (
                  <>
                    <Field label="Min Discount">
                      <input type="number" value={formData.min_discount} onChange={e => setFormData(p => ({ ...p, min_discount: parseFloat(e.target.value) || 1 }))} min="1" max="99" className={INPUT_CLASS} />
                    </Field>
                    <Field label="Max Discount">
                      <input type="number" value={formData.max_discount} onChange={e => setFormData(p => ({ ...p, max_discount: parseFloat(e.target.value) || 1 }))} min="1" max="99" className={INPUT_CLASS} />
                    </Field>
                  </>
                )}
                <Field label="Valid Until">
                  <input type="datetime-local" value={formData.valid_until} onChange={e => setFormData(p => ({ ...p, valid_until: e.target.value }))} className={INPUT_CLASS} />
                </Field>
                <Field label="Coupon Expiry Minutes">
                  <input type="number" value={formData.scan_expiry_minutes} onChange={e => setFormData(p => ({ ...p, scan_expiry_minutes: parseInt(e.target.value) || 5 }))} min="5" className={INPUT_CLASS} />
                </Field>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="submit" disabled={saving} className={`${BTN_PRIMARY} flex-1`}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Sparkles size={16} />{editingOffer ? 'Update offer' : 'Create & generate QR'}</>}
                </button>
                <button type="button" onClick={closeForm} className={`${BTN_OUTLINE} flex-1`}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={QrCode} label="Total Offers" value={offers.length} />
          <StatCard icon={ScanLine} label="Total Scans" value={totalScans} />
          <StatCard icon={TrendingUp} label="Active Now" value={activeOffers} />
          <StatCard icon={Users} label="Inactive" value={inactiveOffers} danger />
        </section>

        <section className="relative">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, QR code, or reveal type..."
            className={SEARCH_CLASS}
          />
        </section>

        {/* ── SCAN LOGS ── */}
        {showLogs && (
          <section className={`${PANEL} animate-fadeIn p-4 sm:p-6 lg:p-8`}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Scan activity
                </p>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 sm:text-xl">
                  Scan logs
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-500 transition hover:text-neutral-950"
                onClick={() => setShowLogs(false)}
              >
                <X size={18} />
              </button>
            </div>
            {scanLogs.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl bg-[#F4F4F2] py-12 text-center">
                <ScanLine size={36} className="mb-4 text-neutral-400" />
                <p className="text-sm text-neutral-500">No scans yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto rounded-xl ring-1 ring-black/5 lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 bg-[#F4F4F2]/80">
                        {['Offer', 'Discount', 'Coupon', 'Used', 'Scanned At'].map(h => <TableHead key={h}>{h}</TableHead>)}
                      </tr>
                    </thead>
                    <tbody>
                      {scanLogs.map((log) => (
                        <tr key={log.id} className="border-b border-black/5 transition last:border-b-0 hover:bg-[#F4F4F2]/50">
                          <td className="px-5 py-4 font-medium text-neutral-900">{log.qr_offer_title}</td>
                          <td className="px-5 py-4 font-semibold text-neutral-900">{log.discount_revealed}%</td>
                          <td className="px-5 py-4 text-neutral-800">{log.coupon_code}</td>
                          <td className="px-5 py-4"><UsedBadge used={log.is_used} /></td>
                          <td className="px-5 py-4 text-xs text-neutral-500">
                            {log.scanned_at ? new Date(log.scanned_at).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 lg:hidden">
                  {scanLogs.map((log) => (
                    <article key={log.id} className="rounded-xl bg-[#F4F4F2]/80 p-4 ring-1 ring-black/5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">Offer</p>
                          <h3 className="text-sm font-medium text-neutral-900">{log.qr_offer_title}</h3>
                        </div>
                        <UsedBadge used={log.is_used} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <MiniBox label="Discount" value={`${log.discount_revealed}%`} emphasize />
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
          <section className={`${PANEL} p-10 text-center sm:p-14`}>
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-400">
              <QrCode size={38} />
            </div>
            <h2 className="mb-2 text-xl font-semibold tracking-[-0.02em] text-neutral-950 sm:text-2xl">
              No QR offers found
            </h2>
            <p className="mb-6 text-sm text-neutral-500">
              Create your first QR offer to start generating coupons.
            </p>
            <button type="button" className={BTN_PRIMARY} onClick={openCreate}>
              <Plus size={16} /> Create your first offer
            </button>
          </section>
        ) : (
          <>
            <section className={`hidden overflow-hidden lg:block ${PANEL}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-[#F4F4F2]/80">
                      {['QR Offer', 'Type', 'Discount', 'Scans', 'Status', 'Actions'].map(h => <TableHead key={h}>{h}</TableHead>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id || offer.qr_code_id} className="border-b border-black/5 transition last:border-b-0 hover:bg-[#F4F4F2]/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4F4F2] ring-1 ring-black/5">
                              {offer.qr_image_url
                                ? <img src={offer.qr_image_url} alt="QR" className="size-full object-cover" />
                                : <QrCode size={18} className="text-neutral-400" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-medium text-neutral-900">{offer.title}</p>
                              <p className="mt-1 max-w-[260px] truncate text-[11px] text-neutral-500">{offer.qr_code_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><TypeBadge type={offer.reveal_type} /></td>
                        <td className="px-5 py-4 font-semibold text-neutral-900">
                          {offer.reveal_type === 'fixed'
                            ? `${offer.fixed_discount ?? '—'}%`
                            : `${offer.min_discount}-${offer.max_discount}%`}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                            <ScanLine size={14} />
                            <span>{offer.scan_count || 0} / {offer.max_scans}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><OfferStatus active={offer.is_valid_now} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ActionButton onClick={() => handleEdit(offer)} label="Edit"><Edit3 size={14} /></ActionButton>
                            <ActionButton onClick={() => copyQrCode(offer.qr_code_id)} label="Copy QR code">
                              {copiedId === offer.qr_code_id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
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
                              className="inline-flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
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

            <section className="flex flex-col gap-3 lg:hidden">
              {filteredOffers.map((offer) => (
                <article key={offer.id || offer.qr_code_id} className={`${PANEL} p-4`}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4F4F2] ring-1 ring-black/5">
                      {offer.qr_image_url
                        ? <img src={offer.qr_image_url} alt="QR" className="size-full object-cover" />
                        : <QrCode size={24} className="text-neutral-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{offer.title}</h3>
                          <p className="mt-1 break-all text-[11px] text-neutral-500">{offer.qr_code_id}</p>
                        </div>
                        <OfferStatus active={offer.is_valid_now} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <MiniBox label="Type" value={offer.reveal_type} />
                        <MiniBox label="Discount" value={offer.reveal_type === 'fixed' ? `${offer.fixed_discount ?? '—'}%` : `${offer.min_discount}-${offer.max_discount}%`} emphasize />
                        <MiniBox label="Scans" value={`${offer.scan_count || 0}/${offer.max_scans}`} />
                        <MiniBox label="Valid" value={offer.is_valid_now ? 'Active' : 'Inactive'} emphasize={offer.is_valid_now} />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button type="button" onClick={() => handleEdit(offer)} className={`${BTN_OUTLINE} !h-9 flex-1 !px-3 !py-2 !text-[9px]`}>
                          <Edit3 size={13} /> Edit
                        </button>
                        <button type="button" onClick={() => copyQrCode(offer.qr_code_id)} className={`${BTN_OUTLINE} !h-9 flex-1 !px-3 !py-2 !text-[9px]`}>
                          {copiedId === offer.qr_code_id ? <Check size={13} /> : <Copy size={13} />} Copy
                        </button>
                        {offer.qr_image_url && (
                          <button type="button" onClick={() => downloadQR(offer.qr_image_url, offer.title)} className="inline-flex size-10 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-black/8">
                            <Download size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(offer.qr_code_id)}
                          disabled={deletingId === offer.qr_code_id}
                          className="inline-flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 disabled:opacity-50"
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
      <label className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, danger = false }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 transition hover:ring-black/10 sm:p-5">
      <div className={`mb-4 flex size-10 items-center justify-center rounded-full ${danger ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : 'bg-[#F4F4F2] text-neutral-800'}`}>
        <Icon size={18} />
      </div>
      <p className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-2xl">{Number(value || 0).toLocaleString('en-IN')}</p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase sm:text-xs">{label}</p>
    </div>
  )
}

function TableHead({ children }) {
  return <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">{children}</th>
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F2] px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-neutral-700 uppercase ring-1 ring-black/6">
      <Percent size={12} />{type}
    </span>
  )
}

function OfferStatus({ active }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function UsedBadge({ used }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${used ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-amber-200'}`}>
      {used ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {used ? 'Used' : 'Pending'}
    </span>
  )
}

function ActionButton({ children, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex size-9 items-center justify-center rounded-full bg-white text-neutral-500 ring-1 ring-black/8 transition hover:text-neutral-950" title={label} aria-label={label}>
      {children}
    </button>
  )
}

function MiniBox({ label, value, emphasize = false }) {
  return (
    <div className="rounded-lg bg-[#F4F4F2]/80 p-2.5">
      <p className="mb-1 text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">{label}</p>
      <p className={`truncate text-xs ${emphasize ? 'font-semibold text-neutral-900' : 'text-neutral-800'}`}>{value}</p>
    </div>
  )
}