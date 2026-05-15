import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../../services/api'

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form, setForm] = useState({
    name:'', slug:'', description:'', category:'',
    price:'', sale_price:'', stock:'', sku:'', is_active:true, is_featured:false
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={() => { setShowForm(true); setEditing(null) }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-bold mb-4">{editing ? 'Edit' : 'Add'} Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Product Name</label>
              <input value={form.name} required
                     onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Slug</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Price (₹)</label>
              <input type="number" value={form.price} required
                     onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Sale Price (₹)</label>
              <input type="number" value={form.sale_price}
                     onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Stock</label>
              <input type="number" value={form.stock} required
                     onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">SKU</label>
              <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                     className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Description</label>
              <textarea value={form.description} rows={3} required
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none resize-none" />
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active}
                       onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured}
                       onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
                Featured
              </label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">
                {editing ? 'Update' : 'Create'} Product
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product','Category','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        {p.primary_image?.image && (
                          <img src={p.primary_image.image} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                  <td className="px-4 py-3 font-bold">₹{p.effective_price}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                                      ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditing(p.id)
                        setForm({ name:p.name, slug:p.slug, description:p.description,
                                  category:p.category?.id||'', price:p.price, sale_price:p.sale_price||'',
                                  stock:p.stock, sku:p.sku||'', is_active:p.is_active, is_featured:p.is_featured })
                        setShowForm(true)
                      }} className="p-1.5 text-gray-400 hover:text-indigo-600 border rounded-lg">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 border rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}