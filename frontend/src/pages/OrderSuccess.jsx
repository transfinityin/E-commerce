import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle,
  ArrowRight,
  Package,
  Truck,
  Calendar,
  Receipt,
  Sparkles,
  Loader2,
} from 'lucide-react'
import api from '../services/api'

export default function OrderSuccess() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api
      .get(`/orders/${id}/`)
      .then((res) => {
        if (mounted) setOrder(res.data)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center px-4 py-10 sm:py-14 overflow-x-hidden">
      <main className="w-full max-w-2xl text-center">
        {/* Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gold/30 bg-gold/10 flex items-center justify-center mx-auto mb-6 animate-gold-pulse">
          <CheckCircle size={44} className="text-gold" strokeWidth={1.8} />
        </div>

        {/* Title */}
        <section className="mb-7 sm:mb-8">
          <p className="label-gold mb-4 flex items-center justify-center gap-2">
            <Sparkles size={14} />
            Order Confirmed
          </p>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight mb-4">
            THANK YOU FOR
            <br />
            <span className="text-gradient-gold">YOUR PURCHASE</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed max-w-md mx-auto">
            Your order has been successfully placed. We will prepare your artifact and send
            tracking updates soon.
          </p>
        </section>

        {/* Order Card */}
        {order && (
          <section className="w-full bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 text-left shadow-[0_20px_80px_rgba(0,0,0,0.45)] mb-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gold/10">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt size={17} className="text-gold shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-muted">
                  Order ID
                </span>
              </div>

              <span className="text-xs sm:text-sm font-mono text-white tracking-wider truncate">
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-[10px] sm:text-xs text-muted font-mono tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <Package size={12} />
                {order.items?.length || 0} Items
              </span>

              <span className="flex items-center gap-1.5">
                <Truck size={12} />
                Standard Delivery
              </span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 bg-black border border-gold/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-display text-white tracking-wider leading-snug">
                      {item.product_name}
                    </p>

                    <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                      Qty: {item.quantity}
                      {item.size && ` • Size: ${item.size}`}
                    </p>
                  </div>

                  <span className="price-tag text-xs sm:text-sm whitespace-nowrap">
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider-gold my-5" />

            {/* Price Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted font-mono">Subtotal</span>
                <span className="text-white font-mono">
                  ₹{Number(order.subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gold font-mono">Discount</span>
                  <span className="text-gold font-mono">
                    −₹{Number(order.discount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted font-mono">Delivery</span>
                <span className="text-white font-mono">
                  {parseFloat(order.delivery_fee) === 0
                    ? 'FREE'
                    : `₹${Number(order.delivery_fee).toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gold/10">
              <span className="text-sm font-mono text-white uppercase tracking-wider">
                Total Paid
              </span>

              <span className="font-display text-2xl sm:text-3xl text-gradient-gold">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </span>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="w-full flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            to="/orders"
            className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
          >
            VIEW MY ORDERS
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/products"
            className="flex-1 btn-outline inline-flex items-center justify-center gap-2"
          >
            CONTINUE SHOPPING
          </Link>
        </section>

        {/* Trust */}
        <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs text-muted font-mono tracking-wider leading-relaxed">
          <span className="w-8 h-px bg-gold/20" />
          <span>Email confirmation will be sent shortly</span>
          <span className="w-8 h-px bg-gold/20" />
        </div>
      </main>
    </div>
  )
}