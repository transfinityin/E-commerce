import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Star,
  Trash,
  Package,
  Search,
  Loader2,
  Image as ImageIcon,
  Tag,
  Layers,
  IndianRupee,
  Boxes,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'
import api from '../../services/api'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: '',
  sale_price: '',
  stock: '',
  sku: '',
  is_active: true,
  is_featured: false,
  available_sizes: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [productImages, setProductImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setLoading(true)

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products/admin/products/'),
        api.get('/products/categories/'),
      ])

      setProducts(productsRes.data.results || productsRes.data || [])
      setCategories(categoriesRes.data.results || categoriesRes.data || [])
    } catch {
      toast.error('Failed to load products')
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const autoSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

  const openCreate = () => {
    setEditing(null)
    setProductImages([])
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setProductImages([])
    setForm(EMPTY_FORM)
  }

  const toggleSize = (size) => {
    setForm((prev) => {
      const sizes = prev.available_sizes.includes(size)
        ? prev.available_sizes.filter((item) => item !== size)
        : [...prev.available_sizes, size]

      return {
        ...prev,
        available_sizes: sizes,
      }
    })
  }

  const handleImageUpload = (files) => {
    const validFiles = Array.from(files || []).filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(
        file.type
      )
      const isValidSize = file.size <= 5 * 1024 * 1024

      if (!isValidType) toast.error(`${file.name}: Only JPG, PNG, WEBP`)
      if (!isValidSize) toast.error(`${file.name}: Max 5MB`)

      return isValidType && isValidSize
    })

    const newImages = validFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: productImages.length === 0 && index === 0,
      isNew: true,
    }))

    setProductImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    setProductImages((prev) => {
      const updated = prev.filter((_, imageIndex) => imageIndex !== index)

      if (updated.length > 0 && !updated.some((image) => image.isPrimary)) {
        updated[0] = {
          ...updated[0],
          isPrimary: true,
        }
      }

      return [...updated]
    })
  }

  const setPrimaryImage = (index) => {
    setProductImages((prev) =>
      prev.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      }))
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setUploadingImages(true)

    try {
      const payload = {
        ...form,
        available_sizes: form.available_sizes,
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

      const newImages = productImages.filter((image) => image.isNew && image.file)

      if (newImages.length > 0) {
        const imageData = new FormData()
        newImages.forEach((image) => imageData.append('images', image.file))

        await api.post(`/products/admin/products/${productId}/images/`, imageData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success(`${newImages.length} image(s) uploaded!`)
      }

      const existingImages = productImages.filter((image) => !image.isNew && image.id)

      for (const image of existingImages) {
        if (image.isPrimary && !image.wasPrimary) {
          await api.post(`/products/admin/products/${productId}/images/${image.id}/primary/`)
        }
      }

      closeForm()
      load()
    } catch (err) {
      console.error(err)

      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Error'

      toast.error(message)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return

    try {
      await api.delete(`/products/admin/products/${id}/`)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const openEdit = async (product) => {
    setEditing(product.id)

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      category: product.category?.id || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock: product.stock || '',
      sku: product.sku || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      available_sizes: Array.isArray(product.available_sizes)
        ? product.available_sizes
        : [],
    })

    try {
      const { data } = await api.get(`/products/admin/products/${product.id}/`)

      const existingImages = (data.images || []).map((image) => ({
        id: image.id,
        preview: image.image,
        isPrimary: image.is_primary,
        wasPrimary: image.is_primary,
        isNew: false,
        alt_text: image.alt_text,
      }))

      setProductImages(existingImages)
    } catch {
      setProductImages([])
      toast.error('Failed to load images')
    }

    setShowForm(true)
  }

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase()

    return (
      product.name?.toLowerCase().includes(search) ||
      product.slug?.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search) ||
      product.category?.name?.toLowerCase().includes(search)
    )
  })

  const inputClass =
    'w-full bg-black border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider px-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all'

  const labelClass =
    'text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-gold/75'

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7 sm:mb-9">
          <div>
            <p className="label-gold mb-2">Inventory Control</p>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight">
              ADMIN <span className="text-gradient-gold">PRODUCTS</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-3 max-w-2xl">
              Create, edit, manage stock, upload images, configure sizes, and control storefront visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            ADD PRODUCT
          </button>
        </section>

        <div className="divider-gold mb-7 sm:mb-9" />

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
            placeholder="Search by product, slug, SKU, or category..."
            className="w-full bg-[#0A0A0A] border border-gold/15 text-white placeholder:text-muted/50 text-sm font-mono tracking-wider pl-11 pr-4 py-3.5 outline-none focus:border-gold/60 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all"
          />
        </section>

        {/* Form */}
        {showForm && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 mb-7 sm:mb-9 animate-fadeIn shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="label-gold mb-2">
                  {editing ? 'Edit Artifact' : 'New Artifact'}
                </p>

                <h2 className="font-display text-lg sm:text-xl text-white tracking-[0.12em]">
                  {editing ? 'EDIT PRODUCT' : 'CREATE PRODUCT'}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Basic Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <Field label="Product Name" className="md:col-span-2">
                  <input
                    value={form.name}
                    required
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                        slug: autoSlug(event.target.value),
                      }))
                    }
                    className={inputClass}
                    placeholder="e.g. Classic Linen Shirt"
                  />
                </Field>

                <Field label="Slug">
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="classic-linen-shirt"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Price">
                  <input
                    type="number"
                    value={form.price}
                    required
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="0.00"
                  />
                </Field>

                <Field label="Sale Price">
                  <input
                    type="number"
                    value={form.sale_price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sale_price: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="Optional"
                  />
                </Field>

                <Field label="Stock">
                  <input
                    type="number"
                    value={form.stock}
                    required
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, stock: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>

                <Field label="SKU">
                  <input
                    value={form.sku}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sku: event.target.value }))
                    }
                    className={inputClass}
                    placeholder="Optional"
                  />
                </Field>

                <Field label="Description" className="md:col-span-2">
                  <textarea
                    value={form.description}
                    rows={4}
                    required
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className={`${inputClass} resize-none leading-relaxed`}
                    placeholder="Write product description..."
                  />
                </Field>
              </div>

              {/* Sizes */}
              <section className="border border-gold/10 bg-black p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Available Sizes</label>

                    {form.available_sizes.length > 0 && (
                      <p className="text-xs text-muted font-mono mt-1">
                        {form.available_sizes.length} selected
                      </p>
                    )}
                  </div>

                  {form.available_sizes.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, available_sizes: [] }))
                      }
                      className="text-xs text-muted hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer font-mono tracking-wider uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => {
                    const selected = form.available_sizes.includes(size)

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`min-w-[48px] h-10 px-3 text-xs sm:text-sm font-mono tracking-wider border transition-all duration-300 ${
                          selected
                            ? 'bg-gold border-gold text-black'
                            : 'bg-[#0A0A0A] border-gold/15 text-white hover:border-gold/45 hover:text-gold'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>

                {form.available_sizes.length > 0 ? (
                  <p className="text-xs text-gold font-mono tracking-wider mt-3">
                    Selected: {form.available_sizes.join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-muted font-mono tracking-wider mt-3">
                    No sizes selected — product will not show size selector.
                  </p>
                )}
              </section>

              {/* Image Upload */}
              <section className="border border-gold/10 bg-black p-4 sm:p-5">
                <label className={`${labelClass} mb-3 block`}>Product Images</label>

                <div
                  className="border border-dashed border-gold/20 p-6 sm:p-8 text-center hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 cursor-pointer group"
                  onClick={() => document.getElementById('product-image-input')?.click()}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.add('border-gold')
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.remove('border-gold')
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.remove('border-gold')
                    handleImageUpload(event.dataTransfer.files)
                  }}
                >
                  <input
                    id="product-image-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={(event) => handleImageUpload(event.target.files)}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 border border-gold/20 bg-[#0A0A0A] flex items-center justify-center group-hover:bg-gold group-hover:text-black text-gold transition-all duration-300">
                      <Upload size={24} />
                    </div>

                    <p className="text-sm text-white font-mono tracking-wider">
                      Drop images here or{' '}
                      <span className="text-gold underline">click to browse</span>
                    </p>

                    <p className="text-xs text-muted font-mono tracking-wider">
                      JPG, PNG, WEBP — Max 5MB each
                    </p>
                  </div>
                </div>

                {productImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {productImages.map((image, index) => (
                      <div
                        key={`${image.id || index}-${index}`}
                        className="relative group overflow-hidden border border-gold/15 bg-[#0A0A0A]"
                      >
                        <img
                          src={image.preview}
                          alt={form.name || 'Product image'}
                          className="w-full h-32 object-cover"
                        />

                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPrimaryImage(index)
                              }}
                              className="w-9 h-9 bg-gold text-black flex items-center justify-center hover:bg-gold-light transition-colors"
                              title="Set as primary"
                            >
                              <Star size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              removeImage(index)
                            }}
                            className="w-9 h-9 bg-red-400 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                            title="Remove image"
                          >
                            <Trash size={15} />
                          </button>
                        </div>

                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-gold text-black text-[9px] font-mono tracking-wider uppercase flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            Primary
                          </div>
                        )}

                        {image.isNew && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 border border-gold/20 text-gold text-[9px] font-mono tracking-wider uppercase">
                            New
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Active / Featured */}
              <section className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <ToggleButton
                  active={form.is_active}
                  label="Active"
                  icon={CheckCircle2}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
                  }
                />

                <ToggleButton
                  active={form.is_featured}
                  label="Featured"
                  icon={Sparkles}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, is_featured: !prev.is_featured }))
                  }
                />
              </section>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>{editing ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-outline flex-1 inline-flex items-center justify-center"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Loading / Empty / Products */}
        {loading ? (
          <section className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="w-full h-20 skeleton-dark border border-gold/10 animate-pulse"
              />
            ))}
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="bg-[#0A0A0A] border border-gold/15 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 border border-gold/20 bg-black flex items-center justify-center mx-auto mb-5">
              <Package size={34} className="text-gold/50" />
            </div>

            <p className="label-gold mb-3">No Inventory Signal</p>

            <h2 className="font-display text-xl sm:text-2xl text-white tracking-[0.12em] mb-3">
              NO PRODUCTS <span className="text-gradient-gold">FOUND</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mb-6">
              Create a new product or adjust your search query.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              ADD PRODUCT
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
                      {['Product', 'Category', 'Price', 'Stock', 'Sizes', 'Status', ''].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="text-left text-[10px] font-mono text-gold/70 uppercase tracking-[0.18em] px-5 py-3"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gold/10 last:border-b-0 hover:bg-gold/5 transition-colors duration-200"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black border border-gold/15 flex items-center justify-center overflow-hidden shrink-0">
                              {product.primary_image?.image ? (
                                <img
                                  src={product.primary_image.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={18} className="text-muted" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-display text-white tracking-wider truncate max-w-[260px]">
                                {product.name}
                              </p>

                              {product.sku && (
                                <p className="text-[10px] text-muted font-mono mt-1">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="text-muted font-mono px-5 py-4">
                          {product.category?.name || '—'}
                        </td>

                        <td className="font-mono text-gold px-5 py-4">
                          ₹{Number(product.effective_price || product.price || 0).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-mono ${
                              Number(product.stock) > 0 ? 'text-gold' : 'text-red-400'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {product.available_sizes?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.available_sizes.map((size) => (
                                <SizeBadge key={size}>{size}</SizeBadge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <ProductStatus active={product.is_active} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="w-9 h-9 bg-black border border-gold/15 text-muted flex items-center justify-center hover:text-gold hover:border-gold/40 transition-all"
                              aria-label="Edit product"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="w-9 h-9 bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center hover:bg-red-400 hover:text-white transition-all"
                              aria-label="Delete product"
                            >
                              <Trash2 size={15} />
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
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="bg-[#0A0A0A] border border-gold/15 p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-24 bg-black border border-gold/15 flex items-center justify-center overflow-hidden shrink-0">
                      {product.primary_image?.image ? (
                        <img
                          src={product.primary_image.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={22} className="text-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-sm text-white tracking-wider line-clamp-2">
                            {product.name}
                          </h3>

                          <p className="text-[10px] text-muted font-mono mt-1">
                            {product.category?.name || 'No category'}
                          </p>
                        </div>

                        <ProductStatus active={product.is_active} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <InfoBox
                          icon={IndianRupee}
                          label="Price"
                          value={`₹${Number(
                            product.effective_price || product.price || 0
                          ).toLocaleString('en-IN')}`}
                          highlight
                        />

                        <InfoBox icon={Boxes} label="Stock" value={product.stock} />
                      </div>

                      {product.available_sizes?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.available_sizes.map((size) => (
                            <SizeBadge key={size}>{size}</SizeBadge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="flex-1 btn-outline !px-3 !py-2 inline-flex items-center justify-center gap-2"
                        >
                          <Pencil size={13} />
                          EDIT
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 border border-red-400/25 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white text-xs font-mono tracking-wider uppercase px-3 py-2 transition-all inline-flex items-center justify-center gap-2"
                        >
                          <Trash2 size={13} />
                          DELETE
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

function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-gold/75">
        {label}
      </label>

      {children}
    </div>
  )
}

function ToggleButton({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 inline-flex items-center justify-between gap-4 border px-4 py-3 transition-all duration-300 ${
        active
          ? 'bg-gold/10 border-gold/40 text-gold'
          : 'bg-black border-gold/15 text-muted hover:text-gold hover:border-gold/35'
      }`}
    >
      <span className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase">
        <Icon size={14} />
        {label}
      </span>

      <span
        className={`w-4 h-4 border flex items-center justify-center ${
          active ? 'bg-gold border-gold' : 'bg-black border-gold/30'
        }`}
      >
        {active && <span className="w-1.5 h-1.5 bg-black block" />}
      </span>
    </button>
  )
}

function SizeBadge({ children }) {
  return (
    <span className="text-[10px] font-mono tracking-wider px-2 py-1 bg-gold/10 text-gold border border-gold/20">
      {children}
    </span>
  )
}

function ProductStatus({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border shrink-0 ${
        active
          ? 'bg-gold/10 text-gold border-gold/30'
          : 'bg-red-400/10 text-red-400 border-red-400/30'
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="bg-black border border-gold/10 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-gold" />
        <span className="text-[9px] text-muted font-mono tracking-wider uppercase">
          {label}
        </span>
      </div>

      <p
        className={`text-xs font-mono truncate ${
          highlight ? 'text-gold' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}