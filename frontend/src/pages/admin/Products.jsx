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
    <div className="min-h-screen bg-slate-50">
      <div className="page-box">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              Inventory
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null) }}
            className="flex items-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
            style={{ padding: '12px 20px', gap: '8px' }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ marginBottom: '32px', padding: '24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit' : 'New'} Product</h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border-none cursor-pointer"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Product Name</label>
                  <input
                    value={form.name} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                    placeholder="e.g. Classic Linen Shirt"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Price (₹)</label>
                  <input
                    type="number" value={form.price} required
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Sale Price (₹)</label>
                  <input
                    type="number" value={form.sale_price}
                    onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                    placeholder="Optional"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Stock</label>
                  <input
                    type="number" value={form.stock} required
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">SKU</label>
                  <input
                    value={form.sku}
                    onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    value={form.description} rows={3} required
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    style={{ padding: '12px 16px' }}
                  />
                </div>
                <div className="md:col-span-2 flex items-center" style={{ gap: '24px' }}>
                  <label className="flex items-center cursor-pointer text-sm text-slate-700" style={{ gap: '10px' }}>
                    <input
                      type="checkbox" checked={form.is_active}
                      onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                      className="accent-amber-600 w-4 h-4"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm text-slate-700" style={{ gap: '10px' }}>
                    <input
                      type="checkbox" checked={form.is_featured}
                      onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                      className="accent-amber-600 w-4 h-4"
                    />
                    <span>Featured</span>
                  </label>
                </div>
                <div className="md:col-span-2 flex" style={{ gap: '12px' }}>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
                    style={{ padding: '12px 24px' }}
                  >
                    {editing ? 'Update' : 'Create'} Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 flex items-center justify-center bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                    style={{ padding: '12px 24px' }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map((h, i) => (
                      <th
                        key={i}
                        className="text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                        style={{ padding: '16px 20px' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td style={{ padding: '16px 20px' }}>
                        <div className="flex items-center" style={{ gap: '12px' }}>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {p.primary_image?.image
                              ? <img src={p.primary_image.image} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="text-slate-400 text-lg">□</span>}
                          </div>
                          <span className="font-semibold text-slate-900 truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-500" style={{ padding: '16px 20px' }}>{p.category?.name || '—'}</td>
                      <td className="font-mono font-semibold text-slate-900" style={{ padding: '16px 20px' }}>₹{p.effective_price}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`text-xs font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`inline-block text-xs font-bold rounded-full ${p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`} style={{ padding: '4px 12px' }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          <button
                            onClick={() => openEdit(p)}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all border-none cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all border-none cursor-pointer"
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