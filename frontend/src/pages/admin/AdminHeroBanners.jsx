import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ArrowLeft,
  Smartphone,
  Monitor,
  Loader2,
  Eye,
} from 'lucide-react'
import api from '../../services/api'

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  image_url: '',
  mobile_image_url: '',
  cta_text: 'Shop Now',
  cta_link: '/products',
  is_active: true,
  display_order: 0,
}

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadTarget, setUploadTarget] = useState('desktop')
  const [form, setForm] = useState(EMPTY_FORM)

  const fileInputRef = useRef(null)
  const mobileFileInputRef = useRef(null)

  const fetchBanners = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/core/hero-banners/')
      setBanners(data || [])
    } catch {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const resetForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        image_url_direct: form.image_url,
        mobile_image_url_direct: form.mobile_image_url || '',
        cta_text: form.cta_text,
        cta_link: form.cta_link,
        is_active: form.is_active,
        display_order: form.display_order,
      }

      if (editing) {
        await api.patch(`/core/hero-banners/${editing}/`, payload)
        toast.success('Banner updated!')
      } else {
        await api.post('/core/hero-banners/', payload)
        toast.success('Banner created!')
      }

      closeForm()
      fetchBanners()
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to save banner'

      toast.error(message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return

    try {
      await api.delete(`/core/hero-banners/${id}/`)
      toast.success('Banner deleted!')
      fetchBanners()
    } catch (err) {
      const status = err.response?.status

      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (status === 403
          ? 'Permission denied — admin access required'
          : status === 404
            ? 'Banner not found'
            : status === 401
              ? 'Please login again'
              : `Delete failed (${status})`)

      toast.error(message)
    }
  }

  const handleImageUpload = async (event, target) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP allowed')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    setUploadTarget(target)

    try {
      const { data } = await api.post('/core/upload-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const field = target === 'mobile' ? 'mobile_image_url' : 'image_url'

      setForm((prev) => ({
        ...prev,
        [field]: data.url,
      }))

      toast.success(`${target === 'mobile' ? 'Mobile' : 'Desktop'} image uploaded!`)
    } catch (err) {
      const errorData = err.response?.data?.error
      const status = err.response?.status

      const message = errorData
        ? errorData
        : status === 401
          ? 'Unauthorized — please login again'
          : status === 403
            ? 'Permission denied'
            : 'Upload failed — check Cloudinary settings'

      toast.error(message)
    } finally {
      setUploading(false)
      setUploadTarget('desktop')

      if (target === 'mobile' && mobileFileInputRef.current) {
        mobileFileInputRef.current.value = ''
      }

      if (target === 'desktop' && fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleReorder = async (id, direction) => {
    const index = banners.findIndex((banner) => banner.id === id)

    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === banners.length - 1) return

    const newOrder = [...banners]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    ;[newOrder[index].display_order, newOrder[swapIndex].display_order] = [
      newOrder[swapIndex].display_order,
      newOrder[index].display_order,
    ]

    setBanners([...newOrder])

    try {
      await api.patch(`/core/hero-banners/${id}/`, {
        display_order: newOrder[index].display_order,
      })

      await api.patch(`/core/hero-banners/${newOrder[swapIndex].id}/`, {
        display_order: newOrder[swapIndex].display_order,
      })
    } catch {
      toast.error('Reorder failed')
      fetchBanners()
    }
  }

  const startEdit = (banner) => {
    setEditing(banner.id)

    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      mobile_image_url: banner.mobile_image_url || '',
      cta_text: banner.cta_text || 'Shop Now',
      cta_link: banner.cta_link || '/products',
      is_active: banner.is_active ?? true,
      display_order: banner.display_order || 0,
    })

    setShowForm(true)
  }

  const inputClass =
    'w-full bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all'

  const labelClass =
    'text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-gold/75 flex items-center gap-2'

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7 sm:mb-9">
          <div className="flex items-start gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center w-10 h-10 bg-[#0A0A0A] border border-gold/15 text-muted hover:text-gold hover:border-gold/40 transition-all duration-300 shrink-0"
              aria-label="Back to admin"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="label-gold mb-2">Content Management</p>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight">
                HERO <span className="text-gradient-gold">BANNERS</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-2">
                Manage desktop and mobile hero banners for the storefront.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            ADD BANNER
          </button>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

        {/* Form */}
        {showForm && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-7 sm:mb-9 animate-fadeIn shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="label-gold mb-2">
                  {editing ? 'Edit Protocol' : 'Create Protocol'}
                </p>

                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                  {editing ? 'EDIT BANNER' : 'CREATE BANNER'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Title</label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    required
                    className={inputClass}
                    placeholder="e.g., Wanderer Arc"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, subtitle: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="e.g., Phase 01 · New Drop"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>CTA Text</label>
                  <input
                    value={form.cta_text}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, cta_text: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>CTA Link</label>
                  <input
                    value={form.cta_link}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, cta_link: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="/products"
                  />
                </div>
              </div>

              {/* Desktop Image */}
              <ImageUploadField
                title="Desktop Image"
                icon={Monitor}
                value={form.image_url}
                placeholder="https://... or upload below"
                previewClass="w-44 h-28"
                previewLabel="Landscape recommended: 16:9"
                uploading={uploading && uploadTarget === 'desktop'}
                inputRef={fileInputRef}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, image_url: value }))
                }
                onUpload={(event) => handleImageUpload(event, 'desktop')}
              />

              {/* Mobile Image */}
              <ImageUploadField
                title="Mobile Image"
                icon={Smartphone}
                optional
                value={form.mobile_image_url}
                placeholder="https://... or upload below"
                previewClass="w-24 h-40"
                previewLabel="Portrait recommended: 9:16"
                emptyText="If empty, desktop image will be used on mobile too."
                uploading={uploading && uploadTarget === 'mobile'}
                inputRef={mobileFileInputRef}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, mobile_image_url: value }))
                }
                onUpload={(event) => handleImageUpload(event, 'mobile')}
              />

              {/* Status + Order */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
                  }
                  className={`inline-flex items-center justify-between gap-4 border px-4 py-3 transition-all duration-300 ${
                    form.is_active
                      ? 'bg-gold/10 border-gold/40 text-gold'
                      : 'bg-black border-gold/15 text-muted hover:text-gold hover:border-gold/35'
                  }`}
                >
                  <span className="text-xs font-mono tracking-wider uppercase">
                    Active
                  </span>

                  <span
                    className={`w-4 h-4 border flex items-center justify-center ${
                      form.is_active ? 'bg-gold border-gold' : 'bg-black border-gold/30'
                    }`}
                  >
                    {form.is_active && <span className="w-1.5 h-1.5 bg-black block" />}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono tracking-wider uppercase text-muted">
                    Order:
                  </label>

                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        display_order: parseInt(event.target.value, 10) || 0,
                      }))
                    }
                    className="w-24 bg-black border border-gold/15 text-white text-sm font-mono px-3 py-3 outline-none focus:border-gold/60 transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {editing ? 'UPDATE BANNER' : 'CREATE BANNER'}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Content */}
        {loading ? (
          <section className="flex flex-col gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 sm:h-40 skeleton-dark border border-gold/10 animate-pulse"
              />
            ))}
          </section>
        ) : banners.length === 0 ? (
          <section className="bg-[#0A0A0A] border border-gold/15 text-center py-14 sm:py-16 px-4">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <ImageIcon size={34} className="text-gold/55" />
            </div>

            <p className="label-gold mb-3">No Content</p>

            <h3 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO BANNERS <span className="text-gradient-gold">YET</span>
            </h3>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              Create your first hero banner to start the storefront transmission.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              ADD BANNER
            </button>
          </section>
        ) : (
          <section className="flex flex-col gap-4 sm:gap-5">
            {banners.map((banner, index) => (
              <article
                key={banner.id}
                className="bg-[#0A0A0A] border border-gold/15 hover:border-gold/35 overflow-hidden transition-all duration-500 animate-fadeUp hover:shadow-[0_16px_60px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-56 lg:w-64 h-40 md:h-auto shrink-0 bg-black border-b md:border-b-0 md:border-r border-gold/10 relative overflow-hidden">
                    {banner.image_url || banner.mobile_image_url ? (
                      <img
                        src={banner.image_url || banner.mobile_image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <ImageIcon size={34} />
                      </div>
                    )}

                    <div
                      className={`absolute top-3 left-3 text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 border ${
                        banner.is_active
                          ? 'bg-gold/10 text-gold border-gold/25'
                          : 'bg-black/80 text-muted border-gold/15'
                      }`}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </div>

                    {banner.mobile_image_url && (
                      <div className="absolute top-3 right-3 bg-black/80 border border-gold/20 text-gold text-[9px] font-mono uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                        <Smartphone size={10} />
                        Mobile
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4 sm:p-5 lg:p-6 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="min-w-0">
                        <p className="label-gold mb-2">
                          Banner #{String(index + 1).padStart(2, '0')}
                        </p>

                        <h3 className="font-display text-base sm:text-lg lg:text-xl text-white tracking-[0.12em] leading-snug truncate">
                          {banner.title}
                        </h3>

                        {banner.subtitle && (
                          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider mt-2 line-clamp-2">
                            {banner.subtitle}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <Badge>CTA: {banner.cta_text || 'N/A'}</Badge>
                          <Badge>Order: {banner.display_order}</Badge>

                          {banner.mobile_image_url && (
                            <Badge icon={Smartphone}>Mobile Ready</Badge>
                          )}

                          {banner.cta_link && <Badge>Link: {banner.cta_link}</Badge>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <ActionButton
                          onClick={() => handleReorder(banner.id, 'up')}
                          disabled={index === 0}
                          label="Move up"
                        >
                          <ArrowUp size={15} />
                        </ActionButton>

                        <ActionButton
                          onClick={() => handleReorder(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                          label="Move down"
                        >
                          <ArrowDown size={15} />
                        </ActionButton>

                        {(banner.image_url || banner.mobile_image_url) && (
                          <a
                            href={banner.image_url || banner.mobile_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all"
                            aria-label="Preview image"
                          >
                            <Eye size={15} />
                          </a>
                        )}

                        <ActionButton onClick={() => startEdit(banner)} label="Edit">
                          <Pencil size={15} />
                        </ActionButton>

                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="w-9 h-9 bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all"
                          aria-label="Delete banner"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }

        .animate-fadeUp {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

function ImageUploadField({
  title,
  icon: Icon,
  optional = false,
  value,
  placeholder,
  previewClass,
  previewLabel,
  emptyText,
  uploading,
  inputRef,
  onChange,
  onUpload,
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-gold/75 flex items-center gap-2">
        <Icon size={14} />
        {title}

        {optional && (
          <span className="text-[9px] font-normal text-muted bg-black border border-gold/10 px-2 py-0.5">
            Optional
          </span>
        )}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 bg-black border border-gold/15 text-gold hover:border-gold/40 hover:bg-gold/10 text-xs sm:text-sm font-mono tracking-wider uppercase px-4 py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload size={15} />
              Upload
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={onUpload}
          className="hidden"
        />
      </div>

      {value ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
          <img
            src={value}
            alt={`${title} preview`}
            className={`${previewClass} object-cover border border-gold/15 bg-black`}
          />

          <span className="text-xs text-muted font-mono tracking-wider">
            {previewLabel}
          </span>
        </div>
      ) : (
        emptyText && (
          <p className="text-xs text-muted font-mono tracking-wider">
            {emptyText}
          </p>
        )
      )}
    </div>
  )
}

function Badge({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-black border border-gold/10 text-muted text-[10px] sm:text-xs font-mono tracking-wider px-2.5 py-1">
      {Icon && <Icon size={11} className="text-gold" />}
      {children}
    </span>
  )
}

function ActionButton({ children, onClick, disabled = false, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 bg-black border border-gold/15 flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      aria-label={label}
    >
      {children}
    </button>
  )
}