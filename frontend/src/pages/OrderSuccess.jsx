import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Package, Truck, Calendar, Receipt, Sparkles } from 'lucide-react'
import api from '../services/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}/`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col items-center text-center gap-5">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-2 animate-bounce-subtle">
          <CheckCircle size={40} className="text-[var(--color-success)]" strokeWidth={2} />
        </div>

        {/* Title */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-success)] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            Order Confirmed
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-2">
            Thank You for Your Purchase!
          </h1>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
            Your order has been successfully placed. We'll get it packed and shipped to you soon.
          </p>
        </div>

        {/* Order Card */}
        {order && (
          <div className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 lg:p-6 mt-2 text-left">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-[var(--color-primary)]" />
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Order ID</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--color-text)]">
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-4 text-xs text-[var(--color-muted)]">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Package size={12} />
                {order.items?.length || 0} items
              </span>
              <span className="flex items-center gap-1">
                <Truck size={12} />
                Standard Delivery
              </span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[var(--color-bg-alt)]/50">
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-snug text-[var(--color-text)]">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap text-[var(--color-text)]">
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)] my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span className="text-[var(--color-text)]">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-success)]">Discount</span>
                  <span className="text-[var(--color-success)]">−₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-muted)]">Delivery</span>
                <span className={parseFloat(order.delivery_fee) === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}>
                  {parseFloat(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <span className="text-sm font-bold text-[var(--color-text)]">Total Paid</span>
              <span className="text-xl font-extrabold text-[var(--color-text)]">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            to="/orders"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] text-sm font-semibold rounded-xl transition-all duration-300 py-3.5 shadow-md hover:shadow-lg"
          >
            View My Orders <ArrowRight size={16} />
          </Link>
          <Link
            to="/products"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm font-semibold rounded-xl transition-all duration-200 py-3.5"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mt-2">
          <span className="w-8 h-px bg-[var(--color-border-light)]" />
          <span>You'll receive an email confirmation shortly</span>
          <span className="w-8 h-px bg-[var(--color-border-light)]" />
        </div>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}