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

  const setPrimaryImage = (index) => {
    setProductImages((prev) =>
      prev.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      }))
    )
  }

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || autoSlug(form.name)).trim(),
      description: form.description.trim(),
      price: form.price === '' ? null : form.price,
      stock: form.stock === '' ? 0 : Number(form.stock),
      is_active: Boolean(form.is_active),
      is_featured: Boolean(form.is_featured),
      available_sizes: form.available_sizes,
      sale_price: form.sale_price === '' ? null : form.sale_price,
      category: form.category === '' ? null : form.category,
    }
    const sku = (form.sku || '').trim()
    if (sku) payload.sku = sku
    return payload
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setUploadingImages(true)

    try {
      const payload = buildPayload()
      if (!payload.name || !payload.price) {
        toast.error('Name and price are required')
        return
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
        // Upload one-by-one so the chosen primary is first
        const ordered = [
          ...newImages.filter((image) => image.isPrimary),
          ...newImages.filter((image) => !image.isPrimary),
        ]
        const imageData = new FormData()
        ordered.forEach((image) => imageData.append('images', image.file))

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
    if (!window.confirm('Delete this product? (Ordered items are archived/hidden instead.)')) return

    try {
      const { data, status } = await api.delete(`/products/admin/products/${id}/`)
      if (status === 200 && data?.archived) {
        toast.success('Archived (has orders) — hidden from shop/home')
      } else {
        toast.success('Deleted')
      }
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleDeleteAll = async () => {
    if (!products.length) {
      toast.error('No products to delete')
      return
    }
    if (
      !window.confirm(
        `Remove ALL ${products.length} products from the store? Items with order history are archived (hidden), not hard-deleted.`,
      )
    ) {
      return
    }

    try {
      let archived = 0
      let deleted = 0
      for (const product of products) {
        try {
          await api.patch(`/products/admin/products/${product.id}/`, {
            is_active: false,
            is_featured: false,
          })
          const { data, status } = await api.delete(`/products/admin/products/${product.id}/`)
          if (status === 200 && data?.archived) archived += 1
          else deleted += 1
        } catch {
          /* continue */
        }
      }
      toast.success(`Cleared catalog — deleted ${deleted}, archived ${archived}`)
      load()
    } catch {
      toast.error('Some deletes failed — refresh and retry')
      load()
    }
  }

  const removeImage = async (index) => {
    const target = productImages[index]
    if (!target) return

    if (!target.isNew && target.id && editing) {
      try {
        await api.delete(`/products/admin/products/${editing}/images/`, {
          data: { image_id: target.id },
        })
      } catch {
        toast.error('Could not delete image')
        return
      }
    }

    setProductImages((prev) => {
      const updated = prev.filter((_, imageIndex) => imageIndex !== index)
      if (updated.length > 0 && !updated.some((image) => image.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true }
      }
      return [...updated]
    })
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
    'w-full !rounded-full bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 !border-0 ring-1 ring-black/8 outline-none transition focus:ring-2 focus:ring-neutral-950/15'

  const labelClass =
    'text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500'

  return (
    <div className="space-y-7 sm:space-y-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              Inventory
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
              Products
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
              Create, edit, manage stock, upload images, configure sizes, and control storefront visibility.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={handleDeleteAll}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 text-[10px] font-semibold tracking-[0.16em] text-red-700 uppercase ring-1 ring-red-200 transition hover:bg-red-100 sm:w-auto"
            >
              <Trash2 size={16} />
              Delete all
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.16)] sm:w-auto"
            >
              <Plus size={16} />
              Add product
            </button>
          </div>
        </section>

        <section className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product, slug, SKU, or category..."
            className="w-full !rounded-full bg-white !py-3.5 !pl-11 !pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 !border-0 ring-1 ring-black/8 outline-none transition focus:ring-2 focus:ring-neutral-950/15"
          />
        </section>

        {/* Form */}
        {showForm && (
          <section className="animate-fadeIn rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  {editing ? 'Edit product' : 'New product'}
                </p>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 sm:text-xl">
                  {editing ? 'Edit product' : 'Create product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-500 transition hover:text-neutral-950"
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
                    className={`${inputClass} !rounded-2xl resize-none leading-relaxed`}
                    placeholder="Write product description..."
                  />
                </Field>
              </div>

              {/* Sizes */}
              <section className="rounded-xl bg-[#F4F4F2]/80 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <label className={labelClass}>Available sizes</label>
                    {form.available_sizes.length > 0 && (
                      <p className="mt-1 text-xs text-neutral-500">
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
                      className="cursor-pointer border-none bg-transparent text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase transition hover:text-red-600"
                    >
                      Clear all
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
                        className={`h-10 min-w-[48px] rounded-full px-3 text-xs transition sm:text-sm ${
                          selected
                            ? 'bg-neutral-950 font-semibold text-white'
                            : 'bg-white text-neutral-700 ring-1 ring-black/8 hover:ring-black/15'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {form.available_sizes.length > 0 ? (
                  <p className="mt-3 text-xs font-medium text-neutral-700">
                    Selected: {form.available_sizes.join(', ')}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-neutral-500">
                    No sizes selected — product will not show size selector.
                  </p>
                )}
              </section>

              {/* Image Upload */}
              <section className="rounded-xl bg-[#F4F4F2]/80 p-4 sm:p-5">
                <label className={`${labelClass} mb-3 block`}>Product images</label>

                <div
                  className="group cursor-pointer rounded-xl border border-dashed border-black/15 bg-white p-6 text-center transition hover:bg-[#F4F4F2]/50 sm:p-8"
                  onClick={() => document.getElementById('product-image-input')?.click()}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.add('ring-2', 'ring-neutral-950/20')
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.remove('ring-2', 'ring-neutral-950/20')
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    event.currentTarget.classList.remove('ring-2', 'ring-neutral-950/20')
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
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800 transition group-hover:bg-neutral-950 group-hover:text-white">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm text-neutral-800">
                      Drop images here or{' '}
                      <span className="font-medium text-neutral-950 underline">click to browse</span>
                    </p>
                    <p className="text-xs text-neutral-500">JPG, PNG, WEBP — max 5MB each</p>
                  </div>
                </div>

                {productImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {productImages.map((image, index) => (
                      <div
                        key={`${image.id || index}-${index}`}
                        className="group relative overflow-hidden rounded-xl ring-1 ring-black/8"
                      >
                        <img
                          src={image.preview}
                          alt={form.name || 'Product image'}
                          className="w-full h-32 object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-neutral-950/60 opacity-0 transition-opacity group-hover:opacity-100">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPrimaryImage(index)
                              }}
                              className="flex size-9 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:bg-[#F4F4F2]"
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
                            className="flex size-9 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
                            title="Remove image"
                          >
                            <Trash size={15} />
                          </button>
                        </div>

                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-neutral-950 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-white uppercase">
                            <Star size={10} fill="currentColor" />
                            Primary
                          </div>
                        )}

                        {image.isNew && (
                          <div className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-neutral-700 uppercase ring-1 ring-black/10">
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editing ? 'Update product' : 'Create product'}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white px-4 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase ring-1 ring-black/8 transition hover:text-neutral-950"
                >
                  Cancel
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
                className="h-20 animate-pulse rounded-2xl bg-[#F4F4F2] ring-1 ring-black/5"
              />
            ))}
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-14">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-400">
              <Package size={34} />
            </div>
            <h2 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              No products found
            </h2>
            <p className="mb-6 text-sm text-neutral-500">
              Create a new product or adjust your search query.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[10px] font-semibold tracking-[0.16em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
            >
              <Plus size={16} />
              Add product
            </button>
          </section>
        ) : (
          <>
            <section className="hidden overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-[#F4F4F2]/80">
                      {['Product', 'Category', 'Price', 'Stock', 'Sizes', 'Status', ''].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-left text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase"
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
                        className="border-b border-black/5 transition last:border-b-0 hover:bg-[#F4F4F2]/50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4F4F2] ring-1 ring-black/5">
                              {product.primary_image?.image ? (
                                <img
                                  src={product.primary_image.image}
                                  alt={product.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={18} className="text-neutral-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-medium text-neutral-900">
                                {product.name}
                              </p>
                              {product.sku && (
                                <p className="mt-1 text-[11px] text-neutral-500">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-600">
                          {product.category?.name || '—'}
                        </td>
                        <td className="px-5 py-4 font-semibold text-neutral-900">
                          ₹{Number(product.effective_price || product.price || 0).toLocaleString(
                            'en-IN'
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium ${
                              Number(product.stock) > 0 ? 'text-neutral-800' : 'text-red-600'
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
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <ProductStatus active={product.is_active} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="inline-flex size-9 items-center justify-center rounded-full bg-white text-neutral-500 ring-1 ring-black/8 transition hover:text-neutral-950"
                              aria-label="Edit product"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 transition hover:bg-red-100"
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

            <section className="flex flex-col gap-3 lg:hidden">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5"
                >
                  <div className="flex gap-3">
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4F4F2] ring-1 ring-black/5">
                      {product.primary_image?.image ? (
                        <img
                          src={product.primary_image.image}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={22} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-[11px] text-neutral-500">
                            {product.category?.name || 'No category'}
                          </p>
                        </div>
                        <ProductStatus active={product.is_active} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
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
                        <div className="mt-3 flex flex-wrap gap-1">
                          {product.available_sizes.map((size) => (
                            <SizeBadge key={size}>{size}</SizeBadge>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-neutral-700 uppercase ring-1 ring-black/8"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase ring-1 ring-red-200"
                        >
                          <Trash2 size={13} />
                          Delete
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
      <label className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
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
      className={`inline-flex flex-1 items-center justify-between gap-4 rounded-xl px-4 py-3 transition ${
        active
          ? 'bg-neutral-950 text-white ring-1 ring-neutral-950'
          : 'bg-white text-neutral-600 ring-1 ring-black/8 hover:text-neutral-950'
      }`}
    >
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase">
        <Icon size={14} />
        {label}
      </span>
      <span
        className={`flex size-4 items-center justify-center rounded-full ring-1 ${
          active ? 'bg-white ring-white' : 'bg-[#F4F4F2] ring-black/15'
        }`}
      >
        {active && <span className="block size-1.5 rounded-full bg-neutral-950" />}
      </span>
    </button>
  )
}

function SizeBadge({ children }) {
  return (
    <span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-[10px] font-medium text-neutral-700 ring-1 ring-black/6">
      {children}
    </span>
  )
}

function ProductStatus({ active }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase ring-1 ${
        active
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-red-200'
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function InfoBox({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#F4F4F2]/80 p-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon size={12} className="text-neutral-500" />
        <span className="text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
          {label}
        </span>
      </div>
      <p
        className={`truncate text-xs ${
          highlight ? 'font-semibold text-neutral-900' : 'text-neutral-800'
        }`}
      >
        {value}
      </p>
    </div>
  )
}