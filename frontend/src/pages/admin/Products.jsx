import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../services/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: '',
    price: '', sale_price: '', stock: '', sku: '', is_active: true, is_featured: false
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.patch(`/products/admin/products/${editing}/`, form)
        toast.success('Product updated!')
      } else {
        await api.post('/products/admin/products/', form)
        toast.success('Product created!')
      }
      setShowForm(false); setEditing(null); load()
    } catch (err) {
      toast.error(JSON.stringify(err.response?.data || 'Error'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/admin/products/${id}/`)
    toast.success('Deleted'); load()
  }

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      category: p.category?.id || '', price: p.price, sale_price: p.sale_price || '',
      stock: p.stock, sku: p.sku || '', is_active: p.is_active, is_featured: p.is_featured
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              Inventory
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Products</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null) }}
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
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors cursor-pointer"
              >
                <X size={18} className="text-[var(--color-muted)]" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Product Name</label>
                  <input
                    value={form.name} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="e.g. Classic Linen Shirt"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                  />
                </div>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Price (₹)</label>
                  <input
                    type="number" value={form.price} required
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Sale Price (₹)</label>
                  <input
                    type="number" value={form.sale_price}
                    onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Stock</label>
                  <input
                    type="number" value={form.stock} required
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">SKU</label>
                  <input
                    value={form.sku}
                    onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all px-4 py-3"
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Description</label>
                  <textarea
                    value={form.description} rows={3} required
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none px-4 py-3"
                  />
                </div>
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
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center bg-[var(--color-btn)] text-[var(--color-btn-text)] rounded-xl text-sm font-semibold hover:bg-[var(--color-btn-hover)] transition-all duration-200 px-6 py-3"
                  >
                    {editing ? 'Update' : 'Create'} Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                    {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map((h, i) => (
                      <th
                        key={i}
                        className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4"
                      >
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
                            className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] flex items-center justify-center hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-all duration-200 cursor-pointer"
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