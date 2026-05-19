import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus, Edit2, Trash2, Save, X, ChevronLeft, Crosshair, MapPinned } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function HuntLocations() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [mapCoords, setMapCoords] = useState({ lat: 13.0827, lng: 80.2707 })
  const [formData, setFormData] = useState({
    level: 1,
    name: '',
    clue_text_tamil: '',
    clue_text_english: '',
    hint_image_url: '',
    geo_lat: '',
    geo_long: '',
    geo_radius_meters: 100,
    location_qr_secret: '',
    is_active: true,
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/hunt/admin/locations/')
      setLocations(res.data.results || res.data || [])
    } catch (err) {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/hunt/admin/locations/${editingId}/`, formData)
        toast.success('Location updated!')
      } else {
        await api.post('/hunt/admin/locations/', formData)
        toast.success('Location created!')
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchLocations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    try {
      await api.delete(`/hunt/admin/locations/${id}/`)
      toast.success('Location deleted!')
      fetchLocations()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleEdit = (loc) => {
    setFormData({
      level: loc.level,
      name: loc.name,
      clue_text_tamil: loc.clue_text_tamil,
      clue_text_english: loc.clue_text_english,
      hint_image_url: loc.hint_image_url || '',
      geo_lat: loc.geo_lat,
      geo_long: loc.geo_long,
      geo_radius_meters: loc.geo_radius_meters,
      location_qr_secret: loc.location_qr_secret,
      is_active: loc.is_active,
    })
    setEditingId(loc.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      level: 1,
      name: '',
      clue_text_tamil: '',
      clue_text_english: '',
      hint_image_url: '',
      geo_lat: '',
      geo_long: '',
      geo_radius_meters: 100,
      location_qr_secret: '',
      is_active: true,
    })
  }

  const generateQRSecret = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase()
    setFormData({ ...formData, location_qr_secret: `LOC-${random}` })
  }

  // 🗺️ Map Picker Functions
  const openMapPicker = () => {
    // Use current form values or default to Chennai
    const lat = parseFloat(formData.geo_lat) || 13.0827
    const lng = parseFloat(formData.geo_long) || 80.2707
    setMapCoords({ lat, lng })
    setShowMapPicker(true)
  }

  const confirmMapLocation = () => {
    setFormData({
      ...formData,
      geo_lat: mapCoords.lat.toFixed(8),
      geo_long: mapCoords.lng.toFixed(8)
    })
    setShowMapPicker(false)
    toast.success(`Location set: ${mapCoords.lat.toFixed(6)}, ${mapCoords.lng.toFixed(6)}`)
  }

  // Get user's current GPS
  const getCurrentGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    toast.loading('Getting your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss()
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setFormData({
          ...formData,
          geo_lat: lat.toFixed(8),
          geo_long: lng.toFixed(8)
        })
        toast.success(`GPS captured! ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      },
      (error) => {
        toast.dismiss()
        toast.error('Unable to get location. Enable GPS.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

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
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Manage Locations</h1>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold px-5 py-3 shadow-md transition-all"
          >
            <Plus size={16} />
            Add Location
          </button>
        </div>

        {/* 🗺️ MAP PICKER MODAL */}
        {showMapPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <MapPinned size={20} className="text-[var(--color-primary)]" />
                  <h3 className="text-lg font-bold text-[var(--color-text)]">Pick Location on Map</h3>
                </div>
                <button 
                  onClick={() => setShowMapPicker(false)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Map Container */}
              <div className="relative">
                {/* Google Maps Embed */}
                <div className="w-full h-[400px] bg-[var(--color-bg-alt)]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d100000!2d${mapCoords.lng}!3d${mapCoords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`}
                  />
                </div>

                {/* Center Pin Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-4 h-4 bg-[var(--color-primary)] rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-md whitespace-nowrap">
                      <p className="text-xs font-mono text-[var(--color-text)]">
                        {mapCoords.lat.toFixed(6)}, {mapCoords.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <button
                    onClick={() => {
                      // Pan to Chennai default
                      setMapCoords({ lat: 13.0827, lng: 80.2707 })
                    }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-alt)]"
                  >
                    Chennai
                  </button>
                  <button
                    onClick={() => {
                      // Pan to Coimbatore
                      setMapCoords({ lat: 11.0168, lng: 76.9558 })
                    }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-alt)]"
                  >
                    Coimbatore
                  </button>
                  <button
                    onClick={() => {
                      // Pan to Madurai
                      setMapCoords({ lat: 9.9252, lng: 78.1198 })
                    }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-alt)]"
                  >
                    Madurai
                  </button>
                </div>
              </div>

              {/* Manual Coords Input */}
              <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                <p className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-3">Or Enter Coordinates Manually</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[var(--color-muted)] mb-1 block">Latitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={mapCoords.lat}
                      onChange={(e) => setMapCoords({ ...mapCoords, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--color-muted)] mb-1 block">Longitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={mapCoords.lng}
                      onChange={(e) => setMapCoords({ ...mapCoords, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="p-5 border-t border-[var(--color-border)]">
                <button
                  onClick={confirmMapLocation}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[var(--shadow-gold)]"
                >
                  ✅ Confirm This Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                {editingId ? 'Edit Location' : 'New Location'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {[1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">Location Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marina Beach"
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">Clue (English)</label>
                <textarea
                  value={formData.clue_text_english}
                  onChange={(e) => setFormData({ ...formData, clue_text_english: e.target.value })}
                  placeholder="Enter the clue in English..."
                  rows={2}
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">Clue (Tamil)</label>
                <textarea
                  value={formData.clue_text_tamil}
                  onChange={(e) => setFormData({ ...formData, clue_text_tamil: e.target.value })}
                  placeholder="குறிப்பு தமிழில் உள்ளிடவும்..."
                  rows={2}
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  required
                />
              </div>

              {/* 🗺️ GPS Coordinates with Map Picker */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-2 block flex items-center gap-2">
                  <MapPin size={12} /> GPS Coordinates
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Latitude */}
                  <div>
                    <input
                      type="number"
                      step="0.00000001"
                      value={formData.geo_lat}
                      onChange={(e) => setFormData({ ...formData, geo_lat: e.target.value })}
                      placeholder="13.0827"
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                      required
                    />
                    <span className="text-[10px] text-[var(--color-muted)] mt-1 block">Latitude</span>
                  </div>

                  {/* Longitude */}
                  <div>
                    <input
                      type="number"
                      step="0.00000001"
                      value={formData.geo_long}
                      onChange={(e) => setFormData({ ...formData, geo_long: e.target.value })}
                      placeholder="80.2707"
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                      required
                    />
                    <span className="text-[10px] text-[var(--color-muted)] mt-1 block">Longitude</span>
                  </div>

                  {/* Radius */}
                  <div>
                    <input
                      type="number"
                      value={formData.geo_radius_meters}
                      onChange={(e) => setFormData({ ...formData, geo_radius_meters: parseInt(e.target.value) })}
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <span className="text-[10px] text-[var(--color-muted)] mt-1 block">Radius (meters)</span>
                  </div>
                </div>

                {/* 🎯 Map Picker Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={openMapPicker}
                    className="flex-1 bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 text-[var(--color-primary)] py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <MapPinned size={16} />
                    🗺️ Pick on Map
                  </button>
                  <button
                    type="button"
                    onClick={getCurrentGPS}
                    className="flex-1 bg-[var(--color-info-bg)] hover:bg-[var(--color-info)]/20 border border-[var(--color-info)]/30 text-[var(--color-info)] py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Crosshair size={16} />
                    📍 Use My GPS
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">QR Secret</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location_qr_secret}
                    onChange={(e) => setFormData({ ...formData, location_qr_secret: e.target.value })}
                    placeholder="LOC-XXXXXX"
                    className="flex-1 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateQRSecret}
                    className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] text-[var(--color-btn-text)] px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1 block">Hint Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.hint_image_url}
                  onChange={(e) => setFormData({ ...formData, hint_image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted-light)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="is_active" className="text-sm text-[var(--color-text)]">Active</label>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[var(--shadow-gold)]"
                >
                  <Save size={16} />
                  {editingId ? 'Update Location' : 'Create Location'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-[var(--color-surface)] rounded-xl animate-pulse border border-[var(--color-border)]" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <MapPin size={48} className="text-[var(--color-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No Locations Yet</h3>
            <p className="text-[var(--color-muted)] text-sm mb-4">Create your first hunt location to get started.</p>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[var(--shadow-gold)]"
            >
              Create First Location
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      loc.is_active 
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' 
                        : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                    }`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          L{loc.level}
                        </span>
                        <h3 className="font-bold text-[var(--color-text)]">{loc.name}</h3>
                        {!loc.is_active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-muted)] mb-1">{loc.clue_text_english}</p>
                      <p className="text-xs text-[var(--color-muted-light)] mb-2">{loc.clue_text_tamil}</p>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {loc.geo_lat}, {loc.geo_long}
                        </span>
                        <span>Radius: {loc.geo_radius_meters}m</span>
                        <span className="font-mono bg-[var(--color-bg-alt)] px-2 py-0.5 rounded">{loc.location_qr_secret}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="w-9 h-9 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="w-9 h-9 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}