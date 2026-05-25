import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending: { label: 'Pending', tone: 'text-gold border-gold/30 bg-gold/10' },
  confirmed: { label: 'Confirmed', tone: 'text-gold border-gold/30 bg-gold/10' },
  processing: { label: 'Processing', tone: 'text-gold border-gold/30 bg-gold/10' },
  shipped: { label: 'Shipped', tone: 'text-gold border-gold/30 bg-gold/10' },
  delivered: { label: 'Delivered', tone: 'text-gold border-gold/40 bg-gold/10' },
  cancelled: { label: 'Cancelled', tone: 'text-red-400 border-red-400/30 bg-red-400/10' },
  refunded: { label: 'Refunded', tone: 'text-muted border-gold/20 bg-black' },
}

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
    let mounted = true

    setLoading(true)

    api
      .get('/orders/my/')
      .then((res) => {
        if (mounted) setOrders(res.data.results || res.data || [])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center px-4 py-10 overflow-x-hidden">
        <div className="relative w-full max-w-xl bg-[#0A0A0A] border border-gold/15 p-6 sm:p-10 text-center overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-16 h-px bg-gold/60" />
          <div className="absolute top-0 left-0 w-px h-16 bg-gold/60" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gold/25 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={30} className="text-gold/70" strokeWidth={1.5} />
          </div>

          <p className="label-gold mb-3">Your Orders</p>

          <h1 className="font-display text-2xl sm:text-3xl text-white tracking-[0.13em] mb-3">
            NO ORDERS <span className="text-gradient-gold">YET</span>
          </h1>

          <p className="text-muted text-xs sm:text-sm font-mono tracking-wider leading-relaxed max-w-sm mx-auto mb-7">
            Your purchase history will appear once you place your first artifact order.
          </p>

          <Link
            to="/products"
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            SHOP NOW
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="label-gold mb-2">Purchase History</p>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white tracking-[0.12em] leading-tight">
              MY <span className="text-gradient-gold">ORDERS</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider mt-2">
              Track your artifact transmissions and payment status.
            </p>
          </div>

          <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-2 w-fit">
            {orders.length} Order{orders.length !== 1 ? 's' : ''}
          </span>
        </section>

        <div className="divider-gold mb-6 sm:mb-8" />

        {/* Orders */}
        <section className="flex flex-col gap-4 sm:gap-5">
          {orders.map((order, index) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block bg-[#0A0A0A] border border-gold/15 hover:border-gold/35 p-4 sm:p-5 lg:p-6 animate-fadeUp transition-all duration-500 hover:shadow-[0_16px_60px_rgba(212,175,55,0.08)]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <p className="text-xs sm:text-sm font-mono text-white tracking-wider truncate">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </p>

                      <span
                        className={`inline-flex items-center text-[9px] sm:text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border shrink-0 ${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted font-mono flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="price-tag text-sm sm:text-base">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>

                    <p className="text-[9px] sm:text-[10px] text-muted font-mono tracking-wider mt-1">
                      {order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {order.items?.slice(0, 3).map((item) => {
                      const imageUrl = getImageUrl(item.product?.primary_image)

                      return imageUrl ? (
                        <img
                          key={item.id}
                          src={imageUrl}
                          alt={item.product_name}
                          className="w-11 h-11 sm:w-13 sm:h-13 object-cover bg-black border border-gold/10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div
                          key={item.id}
                          className="w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center bg-black border border-gold/10 text-muted shrink-0"
                        >
                          <Package size={14} />
                        </div>
                      )
                    })}

                    {order.items?.length > 3 && (
                      <div className="w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center bg-black border border-gold/10 text-[10px] sm:text-xs font-mono text-muted shrink-0">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-1 text-muted group-hover:text-gold transition-colors">
                    <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase hidden sm:inline">
                      View Details
                    </span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}