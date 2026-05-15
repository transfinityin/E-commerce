import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Truck, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'var(--color-primary-light)', text: 'var(--color-primary-dark)', border: 'var(--color-primary-light)' },
  confirmed:  { label: 'Confirmed',  bg: 'var(--color-info-bg)', text: 'var(--color-info)', border: 'var(--color-info-bg)' },
  processing: { label: 'Processing', bg: 'var(--color-primary-light)', text: 'var(--color-primary)', border: 'var(--color-primary-light)' },
  shipped:    { label: 'Shipped',    bg: 'var(--color-info-bg)', text: 'var(--color-info)', border: 'var(--color-info-bg)' },
  delivered:  { label: 'Delivered',  bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: 'var(--color-success-bg)' },
  cancelled:  { label: 'Cancelled',  bg: 'var(--color-danger-bg)', text: 'var(--color-danger)', border: 'var(--color-danger-bg)' },
  refunded:   { label: 'Refunded',   bg: 'var(--color-bg-alt)', text: 'var(--color-text)', border: 'var(--color-border)' },
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
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg)'}}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{
        borderColor: 'var(--color-secondary)',
        borderTopColor: 'transparent'
      }} />
    </div>
  )

  if (!order) return null

  const stepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const currentStep = stepIndex >= 0 ? stepIndex : 0
  const cfg = STATUS_CONFIG[order.status] || { label: order.status, bg: 'var(--color-bg-alt)', text: 'var(--color-text)', border: 'var(--color-border)' }

  return (
    <div style={{padding:'30px', backgroundColor: 'var(--color-bg)'}} className="min-h-screen pb-12">

      {/* Header Bar */}
      <div style={{
        margin:'5px ',
        padding:'1rem',
        marginBottom:"10px",
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }} className="rounded-3xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate('/orders')} 
            className="flex items-center gap-2 text-sm font-semibold transition-colors bg-transparent border-none cursor-pointer hover:opacity-80"
            style={{color: 'var(--color-text)'}}
          >
            <ArrowLeft size={18} />
            My Orders
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Order Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div >
            <h1 style={{marginBottom:"15px" , padding:"10px", color: 'var(--color-text)'}}  className="text-lg font-bold">
              Order <span className="font-mono" style={{color: 'var(--color-muted)'}}>#{order.id?.slice(0, 8).toUpperCase()}</span>
            </h1>
            <p style={{marginBottom:"30px" , padding:"10px", color: 'var(--color-muted)'}} className="text-xs mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <span style={{
            padding:"5px",
            backgroundColor: cfg.bg,
            color: cfg.text,
            borderColor: cfg.border
          }} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full font-bold border w-fit">
            {cfg.label}
          </span>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div style={{
            marginBottom:"20px" ,
            padding:"5px",
            backgroundColor: 'var(--color-primary-light)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }} className="w-300 rounded-xl p-2">
            <h3 style={{marginBottom:"30px" , padding:"10px", color: 'var(--color-text)'}}  className="text-xs font-bold tracking-wide uppercase mb-5">
              Order Progress
            </h3>
            <div className="flex items-start justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-3 left-0 right-0 h-0.5 mx-4" style={{backgroundColor: 'var(--color-border)'}} />
              {/* Progress Line Fill */}
              <div  
                className="absolute top-3 left-0 h-0.5 mx-4 transition-all duration-500"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, backgroundColor: 'var(--color-secondary)' }}
              />
              
              {STATUS_STEPS.map((s, i) => {
                const StepIcon = s.icon
                const isDone = i <= currentStep
                const isCurrent = i === currentStep
                
                return (
                  <div  key={s.key} className="relative flex flex-col items-center z-10 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCurrent ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      backgroundColor: isDone ? 'var(--color-secondary)' : 'var(--color-surface)',
                      borderColor: isDone ? 'var(--color-secondary)' : 'var(--color-muted-light)',
                      color: isDone ? 'var(--color-text-inverse)' : 'var(--color-muted-light)',
                      ...(isCurrent && {
                        '--tw-ring-color': 'var(--color-secondary)',
                        '--tw-ring-offset-color': 'var(--color-primary-light)'
                      })
                    }}>
                      <StepIcon size={12} strokeWidth={2.5} />
                    </div>
                    <span style={{
                      padding:"10px",
                      color: isDone ? 'var(--color-text)' : 'var(--color-muted)'
                    }} className="text-[10px] font-semibold mt-2 text-center leading-tight">
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items Ordered */}
        <div className="w-300 rounded-xl overflow-hidden" style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}>
          <div style={{
            padding:"10px",
            borderBottomColor: 'var(--color-border)',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid'
          }} className="px-5 py-4">
            <h3 style={{
              padding:"10px",
              color: 'var(--color-text)'
            }}  className="text-xs font-bold tracking-wide uppercase">
              Items Ordered ({order.items?.length || 0})
            </h3>
          </div>
          <div style={{
            padding:"10px",
            marginBottom:"10px"
          }}>
            {order.items?.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4" style={{
                padding:"10px",
                marginBottom:"10px",
                borderBottom: idx < (order.items?.length || 0) - 1 ? '1px solid var(--color-border)' : undefined
              }}>
                {/* Product Image */}
                <div className="w-16 h-20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{backgroundColor: 'var(--color-bg-alt)'}}>
                  {item.product?.primary_image?.image ? (
                    <img 
                      src={item.product.primary_image.image} 
                      alt={item.product_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={20} style={{color: 'var(--color-muted)'}} />
                  )}
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{color: 'var(--color-text)'}}>
                    {item.product_name}
                  </p>
                  {item.size && (
                    <p className="text-xs mt-0.5" style={{color: 'var(--color-muted)'}}>Size: {item.size}</p>
                  )}
                  <p className="text-xs mt-1" style={{color: 'var(--color-muted)'}}>
                    Qty {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                  </p>
                </div>
                
                {/* Line Total */}
                <span className="text-sm font-bold whitespace-nowrap" style={{color: 'var(--color-text)'}}>
                  ₹{Number(item.line_total).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Summary Grid */}
        <div className="grid grid-cols-4  md:grid-cols-2 ">

          {/* Delivery Address */}
          <div style={{
            padding:"10px",
            backgroundColor: 'var(--color-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }} className="rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} style={{color: 'var(--color-text)'}} />
              <h3 style={{
                paddingTop:"10px",
                color: 'var(--color-text)'
              }}  className="text-xs font-bold tracking-wide uppercase">
                Delivery Address
              </h3>
            </div>
            <div className="space-y-1">
              <p style={{
                paddingTop:"10px",
                color: 'var(--color-text)'
              }} className="text-sm font-bold">{order.address?.full_name}</p>
              <p style={{
                paddingTop:"10px",
                color: 'var(--color-muted)'
              }} className="text-xs leading-relaxed">
                {order.address?.line1}
                {order.address?.line2 && `, ${order.address?.line2}`}
              </p>
              <p style={{
                paddingTop:"10px",
                color: 'var(--color-muted)'
              }}  className="text-xs">
                {order.address?.city}, {order.address?.state} — {order.address?.pincode}
              </p>
              <p  style={{
                paddingTop:"10px",
                color: 'var(--color-muted)'
              }}  className="text-xs mt-2">
                📞 {order.address?.phone}
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div style={{
            paddingTop:"10px",
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }} className="rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard style={{
                paddingTop:"10px",
                color: 'var(--color-text)'
              }}  size={22} />
              <h3  style={{
                paddingTop:"10px",
                color: 'var(--color-text)'
              }} className="text-xs font-bold tracking-wide uppercase">
                Price Summary
              </h3>
            </div>
            <div style={{
              paddingTop:"10px",
              paddingLeft:"30px",
              paddingRight:"30px"
            }} className="space-y-2.5">
              <div style={{
                paddingTop:"10px"
              }} className="flex justify-between text-xs">
                <span style={{color: 'var(--color-muted)'}}>Subtotal</span>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span style={{color: 'var(--color-success)'}}>Discount</span>
                  <span className="font-medium" style={{color: 'var(--color-success)'}}>−₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span style={{color: 'var(--color-muted)'}}>Delivery</span>
                <span className="font-medium" style={{color: parseFloat(order.delivery_fee) === 0 ? 'var(--color-success)' : 'var(--color-text)'}}>
                  {parseFloat(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toLocaleString('en-IN')}`}
                </span>
              </div>
              <hr style={{borderColor: 'var(--color-border)'}} />
              <div className="flex justify-between">
                <span className="text-sm font-bold" style={{color: 'var(--color-text)'}}>Total</span>
                <span className="text-sm font-bold" style={{color: 'var(--color-text)'}}>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-right" style={{color: 'var(--color-muted)'}}>
                Inclusive of all taxes
              </p>
            </div>
          </div>

        </div>

        {/* Payment Method */}
        {order.payment_method && (
          <div className="rounded-xl p-5" style={{
            backgroundColor: 'var(--color-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}>
            <h3 className="text-xs font-bold tracking-wide uppercase mb-3" style={{color: 'var(--color-text)'}}>
              Payment Method
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--color-bg-alt)'}}>
                <CreditCard size={18} style={{color: 'var(--color-text)'}} />
              </div>
              <div>
                <p style={{
                  padding:"10px",
                  color: 'var(--color-text)'
                }} className="text-sm font-semibold capitalize">
                  {order.payment_method.replace('_', ' ')}
                </p>
                <p className="text-xs" style={{color: 'var(--color-muted)'}}>
                  {order.payment_status === 'paid' ? 'Payment completed' : 'Payment pending'}
                </p>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full" style={{
                backgroundColor: order.payment_status === 'paid' ? 'var(--color-success-bg)' : 'var(--color-primary-light)',
                color: order.payment_status === 'paid' ? 'var(--color-success)' : 'var(--color-primary-dark)'
              }}>
                {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}