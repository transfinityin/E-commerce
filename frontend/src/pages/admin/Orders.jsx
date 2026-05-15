import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const STATUS_CHOICES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
  processing: 'bg-violet-50 text-violet-700 border-violet-100',
  shipped: 'bg-blue-50 text-blue-700 border-blue-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
  refunded: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/orders/admin/').then(r => setOrders(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/admin/${id}/status/`, { status })
      toast.success('Status updated!'); load()
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-box">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              Management
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          </div>
          <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-full" style={{ padding: '6px 16px' }}>
            {orders.length} total
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Update'].map(h => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                        style={{ padding: '16px 20px' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="font-mono text-slate-900 font-semibold" style={{ padding: '16px 20px' }}>
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="text-slate-500" style={{ padding: '16px 20px' }}>
                        {order.user?.name || '—'}
                      </td>
                      <td className="text-slate-500" style={{ padding: '16px 20px' }}>
                        {order.items?.length || 0} items
                      </td>
                      <td className="font-mono font-bold text-slate-900" style={{ padding: '16px 20px' }}>
                        ₹{order.total}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`inline-block text-xs font-bold rounded-full border ${STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`} style={{ padding: '4px 12px' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
                          style={{ padding: '8px 12px' }}
                        >
                          {STATUS_CHOICES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
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