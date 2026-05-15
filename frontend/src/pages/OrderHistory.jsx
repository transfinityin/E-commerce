import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'var(--color-primary-light)' },
  confirmed:  { label: 'Confirmed',  bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info-bg)' },
  processing: { label: 'Processing', bg: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'var(--color-primary-light)' },
  shipped:    { label: 'Shipped',    bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info-bg)' },
  delivered:  { label: 'Delivered',  bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success-bg)' },
  cancelled:  { label: 'Cancelled',  bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'var(--color-danger-bg)' },
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
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg)'}}>
      <div 
        className="rounded-full animate-spin"
        style={{ width: '32px', height: '32px', border: '2px solid var(--color-secondary)', borderTopColor: 'transparent' }}
      />
    </div>
  )

  if (orders.length === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg)'}}>
      <div className="flex flex-col items-center text-center" style={{ gap: '16px', padding: '24px' }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}>
          <Package size={32} />
        </div>
        <h2 className="text-lg font-bold" style={{color: 'var(--color-text)'}}>No orders yet</h2>
        <p className="text-sm" style={{color: 'var(--color-muted)'}}>Start shopping to see your orders here.</p>
        <Link 
          to="/products" 
          className="inline-flex items-center text-sm font-semibold rounded-lg transition-colors"
          style={{ padding: '10px 20px', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
        >
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-bg)'}}>
      <div className="mx-auto" style={{ maxWidth: '896px', padding: '24px' }}>
        
        {/* Header */}
        <div className="flex w-300 items-center justify-between" style={{ marginBottom: '24px' }}>
          <h1 className="text-xl font-bold" style={{color: 'var(--color-text)'}}>My Orders</h1>
          <span className="text-sm font-medium" style={{color: 'var(--color-muted)'}}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Orders List */}
        <div className="flex w-300 flex-col" style={{ gap: '16px' }}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            
            return (
              <Link 
                key={order.id} 
                to={`/orders/${order.id}`}
                className="block rounded-xl transition-all"
                style={{ 
                  padding: '20px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                  <div>
                    <p className="text-sm font-bold font-mono" style={{color: 'var(--color-text)'}}>
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs" style={{ marginTop: '4px', color: 'var(--color-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end" style={{ gap: '8px' }}>
                    <span 
                      className="inline-flex items-center text-xs font-bold rounded-full"
                      style={{ 
                        background: cfg.bg, 
                        color: cfg.color, 
                        border: `1px solid ${cfg.border}`,
                        padding: '4px 12px'
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-sm font-bold" style={{color: 'var(--color-text)'}}>
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Product Thumbs */}
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div className="flex items-center" style={{ gap: '8px' }}>
                    {order.items?.slice(0, 3).map(item => (
                      item.product?.primary_image?.image ? (
                        <img 
                          key={item.id} 
                          src={item.product.primary_image.image}
                          alt={item.product_name} 
                          className="object-cover rounded-lg"
                          style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-bg-alt)' }}
                        />
                      ) : (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-center rounded-lg"
                          style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}
                        >
                          <Package size={14} />
                        </div>
                      )
                    ))}
                    {order.items?.length > 3 && (
                      <div 
                        className="flex items-center justify-center rounded-lg text-xs font-bold"
                        style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-muted)' }}
                      >
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="ml-auto" style={{color: 'var(--color-muted)'}} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}