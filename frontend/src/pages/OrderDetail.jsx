import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    tone: 'text-gold border-gold/30 bg-gold/10',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    tone: 'text-gold border-gold/30 bg-gold/10',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    tone: 'text-gold border-gold/30 bg-gold/10',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    tone: 'text-gold border-gold/30 bg-gold/10',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    tone: 'text-gold border-gold/40 bg-gold/10',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'text-red-400 border-red-400/30 bg-red-400/10',
    icon: Clock,
  },
  refunded: {
    label: 'Refunded',
    tone: 'text-muted border-gold/20 bg-black',
    icon: CreditCard,
  },
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

const getImageUrl = (imageData) => {
  if (!imageData) return null

  const imagePath = typeof imageData === 'object' ? imageData.image : imageData
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath

  return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    setLoading(true)

    api
      .get(`/orders/${id}/`)
      .then((res) => {
        if (mounted) setOrder(res.data)
      })
      .catch(() => navigate('/orders'))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] flex items-center justify-center">
        <Loader2 size={28} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const stepIndex = STATUS_STEPS.findIndex((step) => step.key === order.status)
  const currentStep = stepIndex >= 0 ? stepIndex : 0
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] pb-10 sm:pb-14 overflow-x-hidden">
      {/* Top Bar */}
      <section className="border-b border-gold/10 bg-[#050505]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={16} />
            My Orders
          </button>
        </div>
      </section>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <p className="label-gold mb-2">Order Details</p>

            <h1 className="font-display text-xl sm:text-2xl lg:text-4xl text-white tracking-[0.12em] leading-tight">
              ORDER{' '}
              <span className="text-gradient-gold">
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted font-mono tracking-wider mt-2">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-2 w-fit text-[10px] sm:text-xs font-mono tracking-wider uppercase border px-3 py-2 ${status.tone}`}
          >
            <StatusIcon size={14} />
            {status.label}
          </span>
        </section>

        <div className="divider-gold mb-6 sm:mb-8" />

        {/* Progress */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-7 mb-5 sm:mb-6">
            <h2 className="font-display text-sm sm:text-base text-white tracking-[0.12em] mb-5">
              ORDER PROGRESS
            </h2>

            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-px bg-gold/15" />

              <div
                className="absolute top-4 left-0 h-px bg-gold transition-all duration-700"
                style={{
                  width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              <div className="relative z-10 flex items-start justify-between">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon
                  const isDone = index <= currentStep
                  const isCurrent = index === currentStep

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border transition-all duration-300 ${
                          isDone
                            ? 'bg-gold text-black border-gold'
                            : 'bg-black text-muted border-gold/20'
                        } ${isCurrent ? 'shadow-[0_0_28px_rgba(212,175,55,0.3)]' : ''}`}
                      >
                        <StepIcon size={15} />
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-center leading-tight mt-2 ${
                          isDone ? 'text-gold' : 'text-muted'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Items */}
        <section className="bg-[#0A0A0A] border border-gold/15 overflow-hidden mb-5 sm:mb-6">
          <div className="px-4 sm:px-5 py-4 border-b border-gold/10">
            <h2 className="font-display text-sm sm:text-base text-white tracking-[0.12em]">
              ITEMS ORDERED ({order.items?.length || 0})
            </h2>
          </div>

          <div>
            {order.items?.map((item, index) => {
              const imageUrl = getImageUrl(item.product?.primary_image)

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 ${
                    index < (order.items?.length || 0) - 1
                      ? 'border-b border-gold/10'
                      : ''
                  }`}
                >
                  <div className="w-14 h-16 sm:w-16 sm:h-20 bg-black border border-gold/10 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Package size={18} className="text-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-display text-white tracking-wider truncate">
                      {item.product_name}
                    </p>

                    {item.size && (
                      <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                        Size: {item.size}
                      </p>
                    )}

                    <p className="text-[10px] sm:text-xs text-muted font-mono mt-1">
                      Qty {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <span className="price-tag text-xs sm:text-sm whitespace-nowrap">
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Address + Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
          <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-gold" />
              </div>

              <h3 className="font-display text-sm text-white tracking-[0.12em]">
                DELIVERY ADDRESS
              </h3>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-mono text-white tracking-wider">
                {order.address?.full_name}
              </p>

              <p className="text-xs sm:text-sm text-muted font-mono leading-relaxed break-words">
                {order.address?.line1}
                {order.address?.line2 && `, ${order.address.line2}`}
              </p>

              <p className="text-xs sm:text-sm text-muted font-mono leading-relaxed break-words">
                {order.address?.city}, {order.address?.state} — {order.address?.pincode}
              </p>

              <p className="text-xs text-muted font-mono mt-2">
                {order.address?.phone}
              </p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-gold" />
              </div>

              <h3 className="font-display text-sm text-white tracking-[0.12em]">
                PRICE SUMMARY
              </h3>
            </div>

            <div className="space-y-3">
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

              <div className="divider-gold my-3" />

              <div className="flex justify-between items-end">
                <span className="text-sm font-mono text-white uppercase tracking-wider">
                  Total
                </span>
                <span className="font-display text-2xl text-gradient-gold">
                  ₹{Number(order.total).toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-[10px] text-right text-muted font-mono">
                Inclusive of all taxes
              </p>
            </div>
          </div>
        </section>

        {/* Payment */}
        {order.payment_method && (
          <section className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border border-gold/20 bg-gold/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-gold" />
              </div>

              <h3 className="font-display text-sm text-white tracking-[0.12em]">
                PAYMENT METHOD
              </h3>
            </div>

            <div className="flex items-center gap-3 bg-black border border-gold/10 p-3">
              <div className="w-10 h-10 border border-gold/10 flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-gold" />
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-mono text-white capitalize truncate">
                  {order.payment_method.replace('_', ' ')}
                </p>
                <p className="text-[10px] sm:text-xs text-muted font-mono mt-0.5">
                  {order.payment_status === 'paid'
                    ? 'Payment completed'
                    : 'Payment pending'}
                </p>
              </div>

              <span className="ml-auto text-[9px] sm:text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border border-gold/20 text-gold bg-gold/10">
                {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}