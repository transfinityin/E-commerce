import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Truck, CreditCard, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'var(--color-primary-light)', text: 'var(--color-primary-dark)', border: 'var(--color-primary)', icon: Clock },
  confirmed:  { label: 'Confirmed',  bg: 'var(--color-info-bg)', text: 'var(--color-info)', border: 'var(--color-info)', icon: CheckCircle2 },
  processing: { label: 'Processing', bg: 'var(--color-primary-light)', text: 'var(--color-primary)', border: 'var(--color-primary)', icon: Package },
  shipped:    { label: 'Shipped',    bg: 'var(--color-info-bg)', text: 'var(--color-info)', border: 'var(--color-info)', icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: 'var(--color-success)', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  bg: 'var(--color-danger-bg)', text: 'var(--color-danger)', border: 'var(--color-danger)', icon: Clock },
  refunded:   { label: 'Refunded',   bg: 'var(--color-bg-alt)', text: 'var(--color-text)', border: 'var(--color-border)', icon: CreditCard },
}

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',    icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',       icon: CheckCircle2 },
  { key: 'processing', label: 'Processing',      icon: Package },
  { key: 'shipped',    label: 'Shipped',         icon: Truck },
  { key: 'delivered',  label: 'Delivered',       icon: CheckCircle2 },
]

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/orders/${id}/`)
      .then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return null

  const stepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const currentStep = stepIndex >= 0 ? stepIndex : 0
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = cfg.icon

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-12">

      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="page-container py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={18} />
            My Orders
          </button>
        </div>
      </div>

      <div className="page-container py-6 lg:py-8 space-y-5">

        {/* Order Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1">
              Order Details
            </p>
            <h1 className="text-xl lg:text-2xl font-bold text-[var(--color-text)]">
              Order <span className="font-mono text-[var(--color-muted)]">#{order.id?.slice(0, 8).toUpperCase()}</span>
            </h1>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold border w-fit bg-[var(--color-bg-alt)] text-[var(--color-text)] border-[var(--color-border)]">
            <StatusIcon size={12} />
            {cfg.label}
          </span>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 lg:p-6">
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text)] mb-5">
              Order Progress
            </h3>
            <div className="flex items-start justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-3 left-0 right-0 h-0.5 mx-4 bg-[var(--color-border)]" />
              {/* Progress Line Fill */}
              <div
                className="absolute top-3 left-0 h-0.5 mx-4 transition-all duration-500 ease-out bg-[var(--color-primary)]"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />

              {STATUS_STEPS.map((s, i) => {
                const StepIcon = s.icon
                const isDone = i <= currentStep
                const isCurrent = i === currentStep

                return (
                  <div key={s.key} className="relative flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCurrent ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-surface)]' : ''}`}
                      style={{
                        backgroundColor: isDone ? 'var(--color-primary)' : 'var(--color-surface)',
                        borderColor: isDone ? 'var(--color-primary)' : 'var(--color-border-light)',
                        color: isDone ? 'var(--color-text-inverse)' : 'var(--color-muted-light)',
                      }}
                    >
                      <StepIcon size={12} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-semibold mt-2 text-center leading-tight ${isDone ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items Ordered */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text)]">
              Items Ordered ({order.items?.length || 0})
            </h3>
          </div>
          <div>
            {order.items?.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 ${idx < (order.items?.length || 0) - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
              >
                {/* Product Image */}
                <div className="w-16 h-20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                  {item.product?.primary_image?.image ? (
                    <img
                      src={item.product.primary_image.image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={20} className="text-[var(--color-muted)]" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-[var(--color-text)]">
                    {item.product_name}
                  </p>
                  {item.size && (
                    <p className="text-xs mt-0.5 text-[var(--color-muted)]">Size: {item.size}</p>
                  )}
                  <p className="text-xs mt-1 text-[var(--color-muted)]">
                    Qty {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Line Total */}
                <span className="text-sm font-bold whitespace-nowrap text-[var(--color-text)]">
                  ₹{Number(item.line_total).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Delivery Address */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <MapPin size={16} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text)]">
                Delivery Address
              </h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[var(--color-text)]">{order.address?.full_name}</p>
              <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                {order.address?.line1}
                {order.address?.line2 && `, ${order.address?.line2}`}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {order.address?.city}, {order.address?.state} — {order.address?.pincode}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                📞 {order.address?.phone}
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <CreditCard size={16} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text)]">
                Price Summary
              </h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span className="font-medium text-[var(--color-text)]">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-success)]">Discount</span>
                  <span className="font-medium text-[var(--color-success)]">−₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-muted)]">Delivery</span>
                <span className={`font-medium ${parseFloat(order.delivery_fee) === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                  {parseFloat(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="border-t border-[var(--color-border)] my-2" />
              <div className="flex justify-between">
                <span className="text-sm font-bold text-[var(--color-text)]">Total</span>
                <span className="text-sm font-bold text-[var(--color-text)]">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-right text-[var(--color-muted)]">
                Inclusive of all taxes
              </p>
            </div>
          </div>

        </div>

        {/* Payment Method */}
        {order.payment_method && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <ShieldCheck size={16} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text)]">
                Payment Method
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                <CreditCard size={18} className="text-[var(--color-text)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)] capitalize">
                  {order.payment_method.replace('_', ' ')}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {order.payment_status === 'paid' ? 'Payment completed' : 'Payment pending'}
                </p>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}