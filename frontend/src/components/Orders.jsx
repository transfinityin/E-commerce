import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const STATUS_CHOICES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const STATUS_COLORS  = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700',
  refunded:'bg-gray-100 text-gray-700',
}

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID','Customer','Items','Total','Status','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{order.id?.slice(0,8)}</td>
                  <td className="px-4 py-3">{order.user?.name || '—'}</td>
                  <td className="px-4 py-3">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 font-bold">₹{order.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            className="border rounded-lg px-2 py-1 text-xs outline-none">
                      {STATUS_CHOICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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