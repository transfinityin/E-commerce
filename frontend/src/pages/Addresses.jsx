import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, MapPin, Home, LocateFixed, Loader2, X, Check } from 'lucide-react'
import api from '../services/api'

// ─── Leaflet loader (CDN, no npm install needed) ──────────────────────────────
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L)
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.querySelector('#leaflet-js')) {
      const script    = document.createElement('script')
      script.id       = 'leaflet-js'
      script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload   = () => resolve(window.L)
      script.onerror  = () => reject(new Error('Leaflet failed to load'))
      document.head.appendChild(script)
    } else {
      const poll = setInterval(() => {
        if (window.L) { clearInterval(poll); resolve(window.L) }
      }, 50)
    }
  })
}

// ─── Reverse geocode (Nominatim) ──────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  const res  = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  const a    = data.address || {}

  // India: city_district / state_district better than county (county often has "Tirupur, Tamil Nadu" combined)
  const rawCity = a.city || a.city_district || a.town || a.village || a.state_district || a.municipality || ''
  // Split "Tirupur, Tamil Nadu" → take only "Tirupur"
  const city = rawCity.includes(',') ? rawCity.split(',')[0].trim() : rawCity

  // State: Nominatim returns "Tamil Nadu" correctly in a.state for India
  const state = a.state || ''

  return {
    line1:     [a.house_number, a.road].filter(Boolean).join(', '),
    line2:     a.suburb || a.neighbourhood || a.quarter || '',
    city,
    state,
    pincode:   a.postcode || '',
    latitude:  lat,
    longitude: lng,
  }
}

// ─── Map Picker Modal ─────────────────────────────────────────────────────────
function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }) {
  const mapRef       = useRef(null)   // div element
  const leafletMap   = useRef(null)   // L.Map instance
  const markerRef    = useRef(null)   // L.Marker instance
  const pickedLatLng = useRef({ lat: initialLat || 20.5937, lng: initialLng || 78.9629 })

  const [geocoding, setGeocoding]   = useState(false)
  const [locating,  setLocating]    = useState(false)
  const [previewAddr, setPreviewAddr] = useState(null)

  // Reverse geocode + show preview
  const updatePreview = async (lat, lng) => {
    setGeocoding(true)
    setPreviewAddr(null)
    try {
      const addr = await reverseGeocode(lat, lng)
      setPreviewAddr(addr)
    } catch {
      setPreviewAddr(null)
    } finally {
      setGeocoding(false)
    }
  }

  // Init map after mount
  useEffect(() => {
    let destroyed = false
    loadLeaflet().then(L => {
      if (destroyed || !mapRef.current || leafletMap.current) return

      const { lat, lng } = pickedLatLng.current
      const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Custom red pin icon
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:40px;position:relative;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 28 12 28s12-19 12-28C28 5.37 22.63 0 16 0z" fill="#e53e3e"/>
            <circle cx="16" cy="12" r="5" fill="white"/>
          </svg>
        </div>`,
        iconSize:   [32, 40],
        iconAnchor: [16, 40],
      })

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map)
      markerRef.current = marker

      // Drag end → update preview
      marker.on('dragend', () => {
        const p = marker.getLatLng()
        pickedLatLng.current = { lat: p.lat, lng: p.lng }
        updatePreview(p.lat, p.lng)
      })

      // Click on map → move marker + update preview
      map.on('click', e => {
        const { lat: clat, lng: clng } = e.latlng
        marker.setLatLng([clat, clng])
        pickedLatLng.current = { lat: clat, lng: clng }
        updatePreview(clat, clng)
      })

      leafletMap.current = map
      updatePreview(lat, lng)
    }).catch(() => toast.error('Map failed to load. Check your internet.'))

    return () => {
      destroyed = true
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Use current GPS location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocating(false)
        if (!leafletMap.current || !markerRef.current) return
        leafletMap.current.setView([latitude, longitude], 17)
        markerRef.current.setLatLng([latitude, longitude])
        pickedLatLng.current = { lat: latitude, lng: longitude }
        updatePreview(latitude, longitude)
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) toast.error('Location permission denied.')
        else toast.error('Could not get location.')
      },
      { timeout: 10000, maximumAge: 0 }
    )
  }

  // Confirm → send address up
  const handleConfirm = () => {
    if (previewAddr) onConfirm(previewAddr)
    else {
      const { lat, lng } = pickedLatLng.current
      onConfirm({ latitude: lat, longitude: lng, line1: '', line2: '', city: '', state: '', pincode: '' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: 640, maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[var(--color-primary)]" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)]">Pick Delivery Location</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] text-[var(--color-muted)] flex items-center justify-center transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Map container */}
        <div className="relative" style={{ height: 340, minHeight: 260 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Use My Location button — floats over map */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="absolute bottom-3 right-3 z-[999] flex items-center gap-1.5 bg-white text-[var(--color-primary)] border border-[var(--color-primary)] rounded-xl text-xs font-semibold px-3 py-2 shadow-lg hover:bg-[var(--color-primary)] hover:text-white transition-all disabled:opacity-60"
            style={{ zIndex: 999 }}
          >
            {locating
              ? <><Loader2 size={13} className="animate-spin" /> Detecting…</>
              : <><LocateFixed size={13} /> Use My Location</>
            }
          </button>

          {/* Crosshair hint */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full pointer-events-none"
            style={{ zIndex: 998 }}
          >
            Tap map or drag pin to adjust
          </div>
        </div>

        {/* Address Preview */}
        <div className="px-4 sm:px-5 py-3 border-t border-[var(--color-border)] shrink-0" style={{ minHeight: 64 }}>
          {geocoding ? (
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <Loader2 size={13} className="animate-spin text-[var(--color-primary)]" />
              Fetching address…
            </div>
          ) : previewAddr ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-0.5">Detected Address</p>
              <p className="text-xs sm:text-sm text-[var(--color-text)] font-medium leading-snug">
                {[previewAddr.line1, previewAddr.line2].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {[previewAddr.city, previewAddr.state, previewAddr.pincode].filter(Boolean).join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-muted)] italic">Move the pin to see address details</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] text-xs sm:text-sm font-semibold py-2.5 hover:bg-[var(--color-bg-alt)] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={geocoding}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold py-2.5 shadow-md transition-all disabled:opacity-60"
          >
            <Check size={14} />
            Use This Location
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY = {
  full_name: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', is_default: false,
  latitude: null, longitude: null,
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Addresses() {
  const [addresses,   setAddresses]   = useState([])
  const [showForm,    setShowForm]    = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [loading,     setLoading]     = useState(true)
  const [showMapPicker, setShowMapPicker] = useState(false)

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
      setShowForm(false); setEditing(null); setForm(EMPTY); load()
    } catch {
      toast.error('Failed to save address')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await api.delete(`/auth/addresses/${id}/`)
      toast.success('Deleted'); load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const startEdit = (addr) => {
    setEditing(addr.id)
    setForm({
      full_name:  addr.full_name,  phone:      addr.phone,
      line1:      addr.line1,      line2:      addr.line2,
      city:       addr.city,       state:      addr.state,
      pincode:    addr.pincode,    is_default: addr.is_default,
      latitude:   addr.latitude  || null,
      longitude:  addr.longitude || null,
    })
    setShowForm(true)
  }

  // Called when user confirms map selection
  const handleMapConfirm = (addr) => {
    setForm(p => ({
      ...p,
      line1:     addr.line1     || p.line1,
      line2:     addr.line2     || p.line2,
      city:      addr.city      || p.city,
      state:     addr.state     || p.state,
      pincode:   addr.pincode   || p.pincode,
      latitude:  addr.latitude,
      longitude: addr.longitude,
    }))
    setShowMapPicker(false)
    toast.success('Location applied! Please verify the fields below.')
  }

  const inputCls = "w-full rounded-xl text-xs sm:text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
  const labelCls = "block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1 sm:mb-1.5"

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

        {/* ── Form Card ── */}
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
              {/* ── Pick on Map Banner ── */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-light)] px-4 py-3 mb-5">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-primary-dark)]">
                    Pick location on map
                  </p>
                  <p className="text-[10px] sm:text-xs text-[var(--color-muted)] mt-0.5">
                    Tap the map, drag the pin, or use your current location.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex items-center gap-1.5 shrink-0 bg-[var(--color-primary)] text-white rounded-lg text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 transition-all hover:bg-[var(--color-primary-dark)] shadow-sm"
                >
                  <MapPin size={13} />
                  Open Map
                </button>
              </div>

              {/* Show saved coords if picked */}
              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
                  <Check size={13} className="shrink-0" />
                  Location pinned: {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">

                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name</label>
                  <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    required className={inputCls} placeholder="Enter your full name" />
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    required className={inputCls} placeholder="+91 98765 43210" />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Address Line 1</label>
                  <input value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                    required className={inputCls} placeholder="Street address, apartment, suite, etc." />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>
                    Address Line 2 <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                  </label>
                  <input value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))}
                    className={inputCls} placeholder="Landmark, building name, etc." />
                </div>

                <div>
                  <label className={labelCls}>City</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    required className={inputCls} placeholder="City name" />
                </div>

                <div>
                  <label className={labelCls}>State</label>
                  <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    required className={inputCls} placeholder="State" />
                </div>

                <div>
                  <label className={labelCls}>Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                    required className={inputCls} placeholder="6-digit pincode" />
                </div>
              </div>

              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer text-xs sm:text-sm text-[var(--color-text)] mb-4 sm:mb-6">
                <input type="checkbox" checked={form.is_default}
                  onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                />
                <span className="font-medium">Set as default address</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button type="submit"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg w-full sm:w-auto">
                  {editing ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Loading ── */}
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
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">No addresses saved yet</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] max-w-sm mb-5 sm:mb-6">
              Add your delivery address to make checkout faster and more convenient.
            </p>
            <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg">
              <Plus size={14} className="sm:w-4 sm:h-4" />
              Add Your First Address
            </button>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {addresses.map((addr, index) => (
              <div key={addr.id}
                className="group bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={16} className="sm:w-5 sm:h-5 text-[var(--color-primary)]" />
                  </div>
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
                <div className="flex justify-end gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
                  <button onClick={() => startEdit(addr)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center justify-center transition-all duration-200"
                    title="Edit"><Pencil size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger)] text-[var(--color-danger)] hover:text-white flex items-center justify-center transition-all duration-200"
                    title="Delete"><Trash2 size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Map Picker Modal ── */}
      {showMapPicker && (
        <MapPickerModal
          initialLat={form.latitude  || 20.5937}
          initialLng={form.longitude || 78.9629}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(-8px) }  to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px) }  to { opacity:1; transform:translateY(0) } }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-fadeUp { animation: fadeUp 0.5s ease forwards; opacity:0; }
      `}</style>
    </div>
  )
}