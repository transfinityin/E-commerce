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

// Helper for image URL
const getImageUrl = (imageData) => {
  if (!imageData) return null
  const imagePath = typeof imageData === 'object' ? imageData.image : imageData
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
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
      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-4 sm:gap-5 max-w-sm px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <ShoppingBag size={24} className="sm:w-7 sm:h-7 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
            Your Orders
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">No orders yet</h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-5 sm:mb-6">
            Start shopping to see your orders here. Your purchase history will appear once you place your first order.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Shop Now <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
              Purchase History
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              My Orders
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-medium text-[var(--color-muted)] bg-[var(--color-bg-alt)] rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 border border-[var(--color-border)]">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {orders.map((order, index) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-300 p-4 sm:p-5 animate-fadeUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <p className="text-xs sm:text-sm font-bold font-mono text-[var(--color-text)] truncate">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <span
                        className="inline-flex items-center text-[9px] sm:text-[10px] font-bold rounded-full px-2 sm:px-2.5 py-0.5 border shrink-0"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          borderColor: cfg.border,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted)] flex items-center gap-1">
                      <Calendar size={10} className="sm:w-3 sm:h-3" />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-sm sm:text-base font-bold text-[var(--color-text)]">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-[var(--color-muted)] mt-0.5">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Product Thumbs */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {order.items?.slice(0, 3).map(item => (
                      getImageUrl(item.product?.primary_image) ? (
                        <img
                          key={item.id}
                          src={getImageUrl(item.product?.primary_image)}
                          alt={item.product_name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)]"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div
                          key={item.id}
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-muted)]"
                        >
                          <Package size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                      )
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[10px] sm:text-xs font-bold text-[var(--color-muted)]">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                    <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">View Details</span>
                    <ChevronRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
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