import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon, Crosshair } from 'lucide-react'
import api from '../../services/api'

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)
  const imgRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image: null,
    focal_x: 50,
    focal_y: 50,
    cta_text: 'Shop Now',
    cta_link: '/products',
    display_order: 0,
    is_active: true,
  })

  const load = () => {
    setLoading(true)
    api.get('/core/hero-banners/')      .then(r => setBanners(r.data.results || r.data))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Focal point click handler
  const handleImageClick = useCallback((e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setForm(p => ({ ...p, focal_x: Math.round(x), focal_y: Math.round(y) }))
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm(p => ({ ...p, image: file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setForm({
      title: '', subtitle: '', image: null,
      focal_x: 50, focal_y: 50,
      cta_text: 'Shop Now', cta_link: '/products',
      display_order: 0, is_active: true,
    })
    setPreview(null)
    setEditing(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('title', form.title)
    data.append('subtitle', form.subtitle)
    data.append('cta_text', form.cta_text)
    data.append('cta_link', form.cta_link)
    data.append('display_order', form.display_order)
    data.append('focal_x', form.focal_x)
    data.append('focal_y', form.focal_y)
    data.append('is_active', form.is_active)
    if (form.image) data.append('image', form.image)

    try {
      if (editing) {
        await api.patch(`/hero-banners/${editing}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner updated!')
      } else {
        await api.post('/core/hero-banners/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner created!')
      }
      setShowForm(false)
      resetForm()
      load()
    } catch (err) {
      toast.error(JSON.stringify(err.response?.data || 'Upload failed'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return
    try {
      await api.delete(`/core/hero-banners/${id}/`)
      toast.success('Banner deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleActive = async (banner) => {
    try {
      await api.patch(`/core/hero-banners/${banner.id}/`, { is_active: !banner.is_active })
      toast.success(banner.is_active ? 'Banner hidden' : 'Banner activated')
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  const moveOrder = async (id, direction) => {
    const idx = banners.findIndex(b => b.id === id)
    if (idx === -1) return
    const newOrder = banners[idx].display_order + direction
    if (newOrder < 0) return
    try {
      await api.patch(`/core/hero-banners/${id}/`, { display_order: newOrder })
      load()
    } catch {
      toast.error('Failed to reorder')
    }
  }

  const openEdit = (banner) => {
    setEditing(banner.id)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: null,
      focal_x: banner.focal_x || 50,
      focal_y: banner.focal_y || 50,
      cta_text: banner.cta_text || 'Shop Now',
      cta_link: banner.cta_link || '/products',
      display_order: banner.display_order || 0,
      is_active: banner.is_active !== false,
    })
    setPreview(banner.image_url || null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="page-box">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>
              Content Management
            </p>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Hero Banners
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(true); resetForm() }}
            className="flex items-center rounded-xl text-sm font-semibold transition-all border-none cursor-pointer"
            style={{ padding: '12px 20px', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
          >
            <Plus size={16} /> Add Banner
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl shadow-sm" style={{ marginBottom: '32px', padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{editing ? 'Edit' : 'New'} Banner</h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-alt)' }}
              >
                <X size={18} style={{ color: 'var(--color-muted)' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>

                {/* Title */}
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="e.g. Summer Collection"
                  />
                </div>

                {/* Subtitle */}
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="e.g. Flat 50% off on all items"
                  />
                </div>

                {/* Image Upload + Focal Point Picker */}
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Banner Image <span style={{color: 'var(--color-muted)', fontWeight: 'normal'}}>(Click on image to set focus point)</span>
                  </label>
                  
                  {!preview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div
                        className="w-full rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                        style={{
                          padding: '40px',
                          gap: '8px',
                          backgroundColor: 'var(--color-bg-alt)',
                          border: '2px dashed var(--color-border)',
                          color: 'var(--color-muted)',
                          minHeight: '200px'
                        }}
                      >
                        <Upload size={32} />
                        <span className="text-sm font-medium">Click to upload banner image</span>
                        <span className="text-xs" style={{color: 'var(--color-muted)'}}>Recommended: 1920x800 or higher</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden cursor-crosshair" style={{ border: '2px solid var(--color-border)' }}>
                      <img
                        ref={imgRef}
                        src={preview}
                        alt="Preview"
                        className="w-full block"
                        style={{ maxHeight: '300px', objectFit: 'contain', backgroundColor: 'var(--color-bg-alt)' }}
                        onClick={handleImageClick}
                      />
                      {/* Focal point marker */}
                      <div
                        className="absolute pointer-events-none flex items-center justify-center"
                        style={{
                          left: `${form.focal_x}%`,
                          top: `${form.focal_y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '32px',
                          height: '32px',
                        }}
                      >
                        <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-danger)', opacity: 0.3 }} />
                        <Crosshair size={24} style={{ color: 'var(--color-danger)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                      </div>
                      <div className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
                        Focus: {form.focal_x}%, {form.focal_y}%
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setForm(p => ({ ...p, image: null })) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer"
                        style={{ backgroundColor: 'var(--color-danger)', color: 'var(--color-text-inverse)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* CTA Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>CTA Button Text</label>
                  <input
                    value={form.cta_text}
                    onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Shop Now"
                  />
                </div>

                {/* CTA Link */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>CTA Link</label>
                  <input
                    value={form.cta_link}
                    onChange={e => setForm(p => ({ ...p, cta_link: e.target.value }))}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="/products"
                  />
                </div>

                {/* Display Order */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center" style={{ gap: '10px', paddingTop: '28px' }}>
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <label htmlFor="banner-active" className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--color-text)' }}>
                    Active (visible on site)
                  </label>
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex" style={{ gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center rounded-xl text-sm font-semibold transition-all border-none cursor-pointer"
                    style={{ padding: '12px 24px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
                  >
                    {editing ? 'Update' : 'Create'} Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer"
                    style={{ padding: '12px 24px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full rounded-xl animate-pulse" style={{ height: '160px', backgroundColor: 'var(--color-muted-light)' }} />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center rounded-2xl" style={{ padding: '48px', gap: '16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}>
              <ImageIcon size={32} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>No banners yet</h2>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Add your first hero banner to display on the homepage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '20px' }}>
            {banners.map((banner, idx) => (
              <div key={banner.id} className="rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                
                {/* Image Area */}
                <div className="relative" style={{ height: '180px', backgroundColor: 'var(--color-bg-alt)' }}>
                  {banner.image_url ? (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title} 
                      className="w-full h-full"
                      style={{ 
                        objectFit: 'cover',
                        objectPosition: `${banner.focal_x}% ${banner.focal_y}%`
                      }} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-muted)' }}>
                      <ImageIcon size={48} />
                    </div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center" style={{ gap: '8px' }}>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{
                      backgroundColor: banner.is_active ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                      color: banner.is_active ? 'var(--color-success)' : 'var(--color-danger)',
                      border: `1px solid ${banner.is_active ? 'var(--color-success)' : 'var(--color-danger)'}`
                    }}>
                      {banner.is_active ? '● Active' : '● Hidden'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)'
                    }}>
                      Order: {banner.display_order}
                    </span>
                  </div>

                  {/* Action Bar Overlay */}
                  <div className="absolute top-3 right-3 flex items-center" style={{ gap: '6px' }}>
                    <button
                      onClick={() => moveOrder(banner.id, -1)}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', opacity: idx === 0 ? 0.4 : 1 }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveOrder(banner.id, 1)}
                      disabled={idx === banners.length - 1}
                      className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', opacity: idx === banners.length - 1 ? 0.4 : 1 }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--color-text)', marginBottom: '4px' }}>
                    {banner.title || 'Untitled'}
                  </h3>
                  <p className="text-xs truncate" style={{ color: 'var(--color-muted)', marginBottom: '12px' }}>
                    {banner.subtitle || 'No subtitle'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}>
                        {banner.cta_text}
                      </span>
                      <span className="text-[10px] truncate max-w-[120px]" style={{ color: 'var(--color-muted)' }}>
                        Focus: {banner.focal_x}%, {banner.focal_y}%
                      </span>
                    </div>
                    
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <button
                        onClick={() => toggleActive(banner)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--color-bg-alt)', color: banner.is_active ? 'var(--color-success)' : 'var(--color-muted)' }}
                        title={banner.is_active ? 'Hide banner' : 'Show banner'}
                      >
                        {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(banner)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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