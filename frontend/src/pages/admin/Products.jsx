import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Upload, Star, Trash } from 'lucide-react'
import api from '../../services/api'

// ─── Available size options ───
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: '',
    price: '', sale_price: '', stock: '', sku: '',
    is_active: true, is_featured: false,
    available_sizes: [],   // ← NEW
  })
  const [productImages, setProductImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const load = () => {
    Promise.all([
      api.get('/products/admin/products/'),
      api.get('/products/categories/'),
    ]).then(([p, c]) => {
      setProducts(p.data.results || p.data)
      setCategories(c.data.results || c.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ─── Toggle size selection ───
  const toggleSize = (size) => {
    setForm(prev => {
      const sizes = prev.available_sizes.includes(size)
        ? prev.available_sizes.filter(s => s !== size)
        : [...prev.available_sizes, size]
      return { ...prev, available_sizes: sizes }
    })
  }

  // ─── Image handlers ───
  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024
      if (!isValidType) toast.error(`${file.name}: Only JPG, PNG, WEBP`)
      if (!isValidSize) toast.error(`${file.name}: Max 5MB`)
      return isValidType && isValidSize
    })

    const newImages = validFiles.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: productImages.length === 0 && idx === 0,
      isNew: true
    }))

    setProductImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    setProductImages(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true }
      }
      return [...updated]
    })
  }

  const setPrimaryImage = (index) => {
    setProductImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })))
  }

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Serialize available_sizes as JSON array for backend
      const payload = {
        ...form,
        available_sizes: form.available_sizes,  // array → DRF JSONField handles it
      }

      let productId = editing
      if (editing) {
        await api.patch(`/products/admin/products/${editing}/`, payload)
        toast.success('Product updated!')
      } else {
        const res = await api.post('/products/admin/products/', payload)
        productId = res.data.id
        toast.success('Product created!')
      }

      const newImages = productImages.filter(img => img.isNew && img.file)
      if (newImages.length > 0) {
        const data = new FormData()
        newImages.forEach(img => data.append('images', img.file))
        await api.post(`/products/admin/products/${productId}/images/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(`${newImages.length} image(s) uploaded!`)
      }

      const existingImages = productImages.filter(img => !img.isNew && img.id)
      for (const img of existingImages) {
        if (img.isPrimary && !img.wasPrimary) {
          await api.post(`/products/admin/products/${productId}/images/${img.id}/primary/`)
        }
      }

      closeForm()
      load()
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error'
      toast.error(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/admin/products/${id}/`)
    toast.success('Deleted')
    load()
  }

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const openEdit = async (p) => {
  setEditing(p.id)
  setForm({
    name: p.name, slug: p.slug, description: p.description,
    category: p.category?.id || '', price: p.price, sale_price: p.sale_price || '',
    stock: p.stock, sku: p.sku || '', is_active: p.is_active, is_featured: p.is_featured,
    available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes : [],
  })

  // ✅ FIX: detail API call பண்ணி images fetch பண்றோம்
  try {
    const { data } = await api.get(`/products/admin/products/${p.id}/`)
    const existingImages = (data.images || []).map(img => ({
      id: img.id,
      preview: img.image,
      isPrimary: img.is_primary,
      wasPrimary: img.is_primary,
      isNew: false,
      alt_text: img.alt_text
    }))
    setProductImages(existingImages)
  } catch {
    setProductImages([])
    toast.error('Failed to load images')
  }

  setShowForm(true)
}
  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setProductImages([])
    setForm({
      name: '', slug: '', description: '', category: '',
      price: '', sale_price: '', stock: '', sku: '',
      is_active: true, is_featured: false, available_sizes: [],
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Inventory</p>
            <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Products</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setProductImages([]) }}
            className="flex items-center gap-2 bg-[var(--color-btn)] text-[var(--color-btn-text)] rounded-xl text-sm font-semibold hover:bg-[var(--color-btn-hover)] transition-all duration-200 px-5 py-3"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-md)] mb-8 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--color-text)]">{editing ? 'Edit' : 'New'} Product</h2>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors cursor-pointer"
              >
                <X size={18} className="text-[var(--color-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                {/* Product Name */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Product Name</label>
                  <input
                    value={form.name} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="e.g. Classic Linen Shirt"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                  >
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Price (₹)</label>
                  <input
                    type="number" value={form.price} required
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="0.00"
                  />
                </div>

                {/* Sale Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Sale Price (₹)</label>
                  <input
                    type="number" value={form.sale_price}
                    onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="Optional"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Stock</label>
                  <input
                    type="number" value={form.stock} required
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                  />
                </div>

                {/* SKU */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">SKU</label>
                  <input
                    value={form.sku}
                    onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="Optional"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Description</label>
                  <textarea
                    value={form.description} rows={3} required
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none px-4 py-3"
                  />
                </div>

                {/* ══════════════════════════════════════════
                    AVAILABLE SIZES — Checkbox Selector
                    ══════════════════════════════════════════ */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[var(--color-text)]">
                      Available Sizes
                      {form.available_sizes.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
                          ({form.available_sizes.length} selected)
                        </span>
                      )}
                    </label>
                    {form.available_sizes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, available_sizes: [] }))}
                        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map(size => {
                      const selected = form.available_sizes.includes(size)
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`min-w-[48px] h-10 px-3 rounded-lg text-sm font-semibold tracking-wide border-2 transition-all duration-150 cursor-pointer ${
                            selected
                              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                              : 'bg-[var(--color-bg-alt)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>

                  {/* Selected sizes preview */}
                  {form.available_sizes.length > 0 ? (
                    <p className="text-xs text-[var(--color-success)] font-medium">
                      ✓ Selected: {form.available_sizes.join(', ')}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-muted)]">
                      No sizes selected — product will not show size selector
                    </p>
                  )}
                </div>
                {/* ══════════════════════════════════════════ */}

                {/* Product Images */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Product Images</label>
                  <div
                    className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 cursor-pointer group"
                    onClick={() => document.getElementById('product-image-input').click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[var(--color-primary)]') }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[var(--color-primary)]') }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[var(--color-primary)]'); handleImageUpload(e.dataTransfer.files) }}
                  >
                    <input
                      id="product-image-input" type="file" multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                        <Upload size={24} className="text-[var(--color-primary)]" />
                      </div>
                      <p className="text-sm text-[var(--color-text)] font-medium">
                        Drop images here or <span className="text-[var(--color-primary)] underline">click to browse</span>
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">JPG, PNG, WEBP — Max 5MB each</p>
                    </div>
                  </div>

                  {productImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {productImages.map((img, index) => (
                        <div key={`${img.id || index}-${index}`} className="relative group rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                          <img src={img.preview} alt={form.name || 'Product image'} className="w-full h-28 object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!img.isPrimary && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPrimaryImage(index) }}
                                className="p-1.5 rounded bg-white/90 hover:bg-white text-[var(--color-text)] transition-colors"
                                title="Set as primary"
                              >
                                <Star size={14} className="text-[var(--color-primary)]" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                              className="p-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                              title="Remove image"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> PRIMARY
                            </div>
                          )}
                          {img.isNew && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[var(--color-success)] text-white text-[10px] font-bold rounded-md">
                              NEW
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active / Featured */}
                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox" checked={form.is_active}
                      onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                      className="accent-[var(--color-primary)] w-4 h-4"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox" checked={form.is_featured}
                      onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                      className="accent-[var(--color-primary)] w-4 h-4"
                    />
                    <span>Featured</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="flex-1 flex items-center justify-center bg-[var(--color-btn)] text-[var(--color-btn-text)] rounded-xl text-sm font-semibold hover:bg-[var(--color-btn-hover)] transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImages ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      <>{editing ? 'Update' : 'Create'} Product</>
                    )}
                  </button>
                  <button
                    type="button" onClick={closeForm}
                    className="flex-1 flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all duration-200 px-6 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                    {['Product', 'Category', 'Price', 'Stock', 'Sizes', 'Status', ''].map((h, i) => (
                      <th key={i} className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors duration-200">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--color-border-light)]">
                            {p.primary_image?.image
                              ? <img src={p.primary_image.image} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="text-[var(--color-muted-light)] text-lg">□</span>}
                          </div>
                          <span className="font-semibold text-[var(--color-text)] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-[var(--color-muted)] px-5 py-4">{p.category?.name || '—'}</td>
                      <td className="font-mono font-semibold text-[var(--color-text)] px-5 py-4">₹{p.effective_price}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold ${p.stock > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      {/* Sizes column */}
                      <td className="px-5 py-4">
                        {p.available_sizes?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.available_sizes.map(s => (
                              <span key={s} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-bold rounded-full px-3 py-1 border ${p.is_active ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] border-[var(--color-border-light)]'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] flex items-center justify-center hover:bg-[var(--color-danger)]/10 transition-all duration-200 cursor-pointer"
                          >
                            <Trash2 size={14} />
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
      </div>
    </div>
  )
}