import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, ShoppingBag, Calendar, ChevronRight } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'var(--color-primary)' },
  confirmed:  { label: 'Confirmed',  bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info)' },
  processing: { label: 'Processing', bg: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'var(--color-primary)' },
  shipped:    { label: 'Shipped',    bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info)' },
  delivered:  { label: 'Delivered',  bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success)' },
  cancelled:  { label: 'Cancelled',  bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'var(--color-danger)' },
  refunded:   { label: 'Refunded',   bg: 'var(--color-bg-alt)', color: 'var(--color-text)', border: 'var(--color-border)' },
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/orders/my/').then(r => {
      setOrders(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-5 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <ShoppingBag size={28} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Your Orders
          </p>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">No orders yet</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Start shopping to see your orders here. Your purchase history will appear once you place your first order.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all duration-300 px-6 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-8 lg:py-10">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
              Purchase History
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              My Orders
            </h1>
          </div>
          <span className="text-sm font-medium text-[var(--color-muted)] bg-[var(--color-bg-alt)] rounded-full px-3 py-1 border border-[var(--color-border)]">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-300 p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold font-mono text-[var(--color-text)]">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <span
                        className="inline-flex items-center text-[10px] font-bold rounded-full px-2.5 py-0.5 border"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          borderColor: cfg.border,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[var(--color-text)]">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Product Thumbs */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {order.items?.slice(0, 3).map(item => (
                      item.product?.primary_image?.image ? (
                        <img
                          key={item.id}
                          src={item.product.primary_image.image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)]"
                        />
                      ) : (
                        <div
                          key={item.id}
                          className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-muted)]"
                        >
                          <Package size={14} />
                        </div>
                      )
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-muted)]">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                    <span className="text-xs font-medium">View Details</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}