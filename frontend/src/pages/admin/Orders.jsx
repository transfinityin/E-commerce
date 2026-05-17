import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const STATUS_CHOICES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_BADGE = {
  pending:    'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  confirmed:  'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20',
  processing: 'bg-violet-50 text-violet-700 border-violet-100',
  shipped:    'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20',
  delivered:  'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20',
  cancelled:  'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
  refunded:   'bg-[var(--color-bg-alt)] text-[var(--color-muted)] border-[var(--color-border-light)]',
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              Management
            </p>
            <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Orders</h1>
          </div>
          <span className="text-sm font-medium text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5">
            {orders.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Update'].map(h => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors duration-200">
                      <td className="font-mono text-[var(--color-text)] font-semibold px-5 py-4">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="text-[var(--color-muted)] px-5 py-4">
                        {order.user?.name || '—'}
                      </td>
                      <td className="text-[var(--color-muted)] px-5 py-4">
                        {order.items?.length || 0} items
                      </td>
                      <td className="font-mono font-bold text-[var(--color-text)] px-5 py-4">
                        ₹{order.total}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-bold rounded-full border px-3 py-1 ${STATUS_BADGE[order.status] || 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] border-[var(--color-border-light)]'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer px-3 py-2 transition-all"
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