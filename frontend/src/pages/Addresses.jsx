import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, MapPin, Home, LocateFixed, Loader2, X, Check, Infinity } from 'lucide-react'
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
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&namedetails=1&extratags=1&zoom=18`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  const a = data.address || {}

  const houseNo = a.house_number || ''
  const road    = a.road || a.pedestrian || a.footway || a.path || a.street || ''
  const line1   = [houseNo, road].filter(Boolean).join(', ')
  const line2   = a.suburb || a.neighbourhood || a.quarter || a.residential || a.hamlet || a.locality || ''
  const rawCity = a.city || a.town || a.city_district || a.district || a.county || a.state_district || a.municipality || a.village || ''
  const city    = rawCity.includes(',') ? rawCity.split(',')[0].trim() : rawCity
  const state   = a.state || ''

  let pincode = a.postcode || ''
  if (!pincode) {
    try {
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data2 = await res2.json()
      pincode = data2.address?.postcode || ''
    } catch { /* ignore */ }
  }

  return { line1, line2, city, state, pincode, latitude: lat, longitude: lng }
}

// ─── Map Picker Modal ─────────────────────────────────────────────────────────
function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }) {
  const mapRef       = useRef(null)
  const leafletMap   = useRef(null)
  const markerRef    = useRef(null)
  const pickedLatLng = useRef({ lat: initialLat || 20.5937, lng: initialLng || 78.9629 })

  const [geocoding, setGeocoding]   = useState(false)
  const [locating,  setLocating]    = useState(false)
  const [previewAddr, setPreviewAddr] = useState(null)

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

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:40px;position:relative;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 28 12 28s12-19 12-28C28 5.37 22.63 0 16 0z" fill="#D4AF37"/>
            <circle cx="16" cy="12" r="5" fill="black"/>
          </svg>
        </div>`,
        iconSize:   [32, 40],
        iconAnchor: [16, 40],
      })

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const p = marker.getLatLng()
        pickedLatLng.current = { lat: p.lat, lng: p.lng }
        updatePreview(p.lat, p.lng)
      })

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

  const handleConfirm = () => {
    if (previewAddr) onConfirm(previewAddr)
    else {
      const { lat, lng } = pickedLatLng.current
      onConfirm({ latitude: lat, longitude: lng, line1: '', line2: '', city: '', state: '', pincode: '' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#0A0A0A] border border-gold/20 shadow-[0_8px_40px_rgba(0,0,0,0.8)] w-full overflow-hidden flex flex-col"
        style={{ maxWidth: 640, maxHeight: '92vh' }}>

        {/* Gold accent top */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gold/10 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-gold" />
            <h3 className="text-sm sm:text-base font-display tracking-wider text-white">PICK LOCATION</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 border border-gold/20 flex items-center justify-center text-muted hover:text-gold hover:border-gold/50 transition-all duration-300">
            <X size={15} />
          </button>
        </div>

        {/* Map container */}
        <div className="relative h-[300px] sm:h-[340px] md:h-[380px] min-h-[260px]">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          <button type="button" onClick={handleUseMyLocation} disabled={locating}
            className="absolute bottom-3 right-3 z-[999] flex items-center gap-1.5 bg-black border border-gold/30 text-gold text-xs font-mono tracking-wider uppercase px-3 py-2 hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 disabled:opacity-50">
            {locating ? <><Loader2 size={13} className="animate-spin" /> DETECTING…</>
              : <><LocateFixed size={13} /> USE GPS</>
            }
          </button>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-gold/60 text-[10px] font-mono tracking-wider px-3 py-1 pointer-events-none border border-gold/10">
            TAP MAP OR DRAG PIN
          </div>
        </div>

        {/* Address Preview */}
        <div className="px-4 sm:px-5 py-3 border-t border-gold/10 shrink-0" style={{ minHeight: 64 }}>
          {geocoding ? (
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <Loader2 size={13} className="animate-spin text-gold" />
              FETCHING COORDINATES…
            </div>
          ) : previewAddr ? (
            <div>
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold/60 mb-1">Detected Signal</p>
              <p className="text-xs sm:text-sm text-white font-medium leading-snug">
                {[previewAddr.line1, previewAddr.line2].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-muted font-mono">
                {[previewAddr.city, previewAddr.state, previewAddr.pincode].filter(Boolean).join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted font-mono italic">Move the pin to decode coordinates</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-gold/10 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 text-center text-xs sm:text-sm font-mono tracking-wider uppercase text-muted border border-gold/20 py-2.5 hover:bg-gold/5 hover:text-gold transition-all duration-300">
            ABORT
          </button>
          <button type="button" onClick={handleConfirm} disabled={geocoding}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gold text-black text-xs sm:text-sm font-semibold tracking-wider uppercase py-2.5 hover:bg-gold-light transition-all duration-300 disabled:opacity-50">
            <Check size={14} />
            CONFIRM LOCATION
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
        toast.success('Coordinates updated!')
      } else {
        await api.post('/auth/addresses/', form)
        toast.success('New signal locked!')
      }
      setShowForm(false); setEditing(null); setForm(EMPTY); load()
    } catch (err) {
      console.error('FULL ERROR:', err)
      const msg = err.response?.data || err.message || 'Unknown error'
      toast.error(`Transmission failed: ${JSON.stringify(msg)}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coordinate?')) return
    try {
      await api.delete(`/auth/addresses/${id}/`)
      toast.success('Signal deleted'); load()
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
    toast.success('Location locked! Verify fields below.')
  }

  const inputCls =
  "w-full bg-black/70 border border-gold/20 text-white text-sm sm:text-[15px] px-4 py-3.5 outline-none focus:border-gold/60 focus:bg-black focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all duration-300 placeholder:text-muted/40 font-mono tracking-wider"

const labelCls =
  "block text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase text-gold/70 mb-2"

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <div className="page-container py-6 sm:py-8 lg:py-12">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6 mb-7 sm:mb-9 lg:mb-12">
  <div className="max-w-2xl">
    <p className="label-gold mb-2 sm:mb-3">Saved Coordinates</p>

    <h1 className="font-display text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-[0.12em] sm:tracking-wider leading-tight mb-2">
      MY <span className="text-gradient-gold">LOCATIONS</span>
    </h1>

    <p className="text-muted text-xs sm:text-sm md:text-base font-mono tracking-wider leading-relaxed">
      Manage delivery coordinates for faster transmission.
    </p>
  </div>

  <button
    onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
    className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-fit"
  >
    <Plus size={14} strokeWidth={2.5} />
    NEW COORDINATE
  </button>
</div>

        {/* ── Form Card ── */}
        {showForm && (
         <div className="relative bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-7 sm:mb-9 lg:mb-12 animate-fadeIn shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden">
            {/* Gold accent top */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6 sm:mb-8" />

            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border border-gold/20 flex items-center justify-center">
                <Home size={18} className="sm:w-5 sm:h-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg text-white tracking-wider">
                  {editing ? 'EDIT COORDINATE' : 'NEW COORDINATE'}
                </h2>
                <p className="text-[10px] sm:text-xs font-mono tracking-wider text-muted mt-1">
                  {editing ? 'Update signal parameters' : 'Lock new delivery location'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ── Pick on Map Banner ── */}
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gold/5 border border-gold/20 p-4 sm:p-5 mb-6 sm:mb-8">
  <div className="min-w-0">
    <p className="text-xs sm:text-sm font-display tracking-wider text-gold">
      GEO-LOCATE SIGNAL
    </p>
    <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider mt-1 leading-relaxed">
      Tap map, drag pin, or use GPS coordinates.
    </p>
  </div>

  <button
    type="button"
    onClick={() => setShowMapPicker(true)}
    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-gold text-black text-xs sm:text-sm font-semibold tracking-wider uppercase px-4 py-3 hover:bg-gold-light active:scale-[0.98] transition-all duration-300"
  >
    <MapPin size={13} />
    OPEN MAP
  </button>
</div>

              {/* Show saved coords if picked */}
              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2 mb-6 p-3 sm:p-4 bg-gold/5 border border-gold/20">
                  <Check size={13} className="text-gold shrink-0" />
                  <p className="text-xs text-gold font-mono tracking-wider">
                    PINNED: {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className={labelCls}>Signal Receiver</label>
                  <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    required className={inputCls} placeholder="Enter receiver name" />
                </div>

                <div>
                  <label className={labelCls}>Transmission Channel</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    required className={inputCls} placeholder="+91 98765 43210" />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Coordinate Line 1</label>
                  <input value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                    required className={inputCls} placeholder="Street address, apartment, suite" />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>
                    Coordinate Line 2 <span className="text-muted font-normal">(Optional)</span>
                  </label>
                  <input value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))}
                    className={inputCls} placeholder="Landmark, building name" />
                </div>

                <div>
                  <label className={labelCls}>Sector</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    required className={inputCls} placeholder="City name" />
                </div>

                <div>
                  <label className={labelCls}>Zone</label>
                  <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    required className={inputCls} placeholder="State" />
                </div>

                <div>
                  <label className={labelCls}>Access Code</label>
                  <input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                    required className={inputCls} placeholder="6-digit pincode" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-white mb-6 sm:mb-8">
                <input type="checkbox" checked={form.is_default}
                  onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
                  className="w-4 h-4 border border-gold/20 bg-black text-gold accent-gold focus:ring-gold/20"
                />
                <span className="font-mono tracking-wider uppercase">Set as primary coordinate</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button type="submit"
                  className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-3.5 w-full sm:w-auto">
                  {editing ? 'UPDATE SIGNAL' : 'LOCK COORDINATE'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="btn-outline flex items-center justify-center gap-2 py-3 sm:py-3.5 w-full sm:w-auto">
                  ABORT
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0A0A0A] border border-gold/10 p-4 sm:p-5 animate-pulse">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border border-gold/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gold/5 w-1/3" />
                    <div className="h-2.5 sm:h-3 bg-gold/5 w-3/4" />
                    <div className="h-2.5 sm:h-3 bg-gold/5 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          /* Empty State */
          <div className="flex flex-col items-center text-center bg-[#0A0A0A] border border-gold/10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gold/20 flex items-center justify-center mb-6 sm:mb-8">
              <MapPin size={28} className="sm:w-8 sm:h-8 text-gold/40" />
            </div>
            <p className="label-gold mb-3 sm:mb-4">No Signals Detected</p>
            <h3 className="font-display text-lg sm:text-xl text-white tracking-wider mb-2 sm:mb-3">NO COORDINATES</h3>
            <p className="text-muted text-xs sm:text-sm max-w-sm mb-6 sm:mb-8 font-mono tracking-wider">
              Add your delivery coordinates to enable faster transmission protocols.
            </p>
            <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }}
              className="btn-primary inline-flex items-center gap-2">
              <Plus size={14} />
              LOCK FIRST COORDINATE
            </button>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {addresses.map((addr, index) => (
              <div key={addr.id}
                className="group bg-[#0A0A0A] border border-gold/10 hover:border-gold/35 transition-all duration-500 p-4 sm:p-5 lg:p-6 animate-fadeUp hover:shadow-[0_16px_50px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border border-gold/20 flex items-center justify-center shrink-0 group-hover:border-gold/40 transition-all duration-300">
                    <MapPin size={16} className="sm:w-5 sm:h-5 text-gold/60 group-hover:text-gold transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <p className="text-sm sm:text-[15px] font-display text-white tracking-wider truncate">{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase bg-gold/10 border border-gold/20 text-gold px-2 sm:px-2.5 py-0.5">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted mb-0.5 truncate font-mono tracking-wider">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                    <p className="text-xs sm:text-sm text-muted mb-0.5 truncate font-mono tracking-wider">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-xs sm:text-sm text-muted font-mono tracking-wider">{addr.phone}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gold/10">
                  <button onClick={() => startEdit(addr)}
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-gold/20 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all duration-300"
                    title="Edit"><Pencil size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)}
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-red-400/20 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-400/10 hover:border-red-400/40 transition-all duration-300"
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
    </div>
  )
}