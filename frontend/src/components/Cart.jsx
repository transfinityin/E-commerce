import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore()
  const navigate = useNavigate()
  const [removingItems, setRemovingItems] = useState(new Set())
  const [updatingItems, setUpdatingItems] = useState(new Set())

  useEffect(() => { fetchCart() }, [])

  const handleUpdate = async (itemId, qty) => {
    if (qty < 1) return
    setUpdatingItems(new Set([...updatingItems, itemId]))
    try {
      await updateItem(itemId, qty)
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const handleRemove = async (itemId) => {
    setRemovingItems(new Set([...removingItems, itemId]))
    try {
      await removeItem(itemId)
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingItems(prev => { const n = new Set(prev); n.delete(itemId); return n })
    }
  }

  const totalPrice  = parseFloat(cart?.subtotal || 0)
  const deliveryFee = totalPrice >= 999 ? 0 : 49
  const finalTotal  = (totalPrice + deliveryFee).toFixed(2)

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '36px', width: '200px', marginBottom: '40px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '340px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    </div>
  )

  /* ── Empty ───────────────────────────────────────────── */
  if (!cart || cart.items?.length === 0) return (
    <div style={{
      minHeight: '80vh', background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <ShoppingBag size={40} color="var(--accent-dark)" strokeWidth={1.5} />
        </div>

        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '32px', fontWeight: 700,
          color: 'var(--ink)', marginBottom: '12px',
        }}>Your cart is empty</h2>

        <p style={{
          color: 'var(--ink-muted)', fontSize: '15px',
          marginBottom: '36px', lineHeight: 1.6, maxWidth: '320px',
        }}>
          Explore our premium collection and add your favourite pieces.
        </p>

        <Link to="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--ink)', color: 'white',
          padding: '14px 32px', borderRadius: '99px',
          fontSize: '14px', fontWeight: 600,
          textDecoration: 'none', transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)' }}>
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  /* ── Cart ────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>

      {/* Page header */}
      <div style={{
        background: 'var(--ink)',
        padding: '40px clamp(20px, 5vw, 60px)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px',
              }}>Your Selection</p>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700, color: 'white',
              }}>
                Shopping Cart
                <span style={{
                  marginLeft: '14px',
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 400,
                }}>
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                </span>
              </h1>
            </div>

            {cart.items?.length > 0 && (
              <button onClick={clearCart} style={{
                background: 'rgba(214,69,69,0.12)',
                border: '1px solid rgba(214,69,69,0.25)',
                color: '#E07070',
                padding: '9px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,69,69,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(214,69,69,0.12)' }}>
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '40px clamp(20px, 5vw, 60px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: '28px',
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .cart-grid { grid-template-columns: minmax(0,1fr) 340px !important; }
          }
        `}</style>

        <div className="cart-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
          gap: '28px',
        }}>

          {/* ── Left: Items ────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cart.items?.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--paper-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.3s ease',
                  opacity: removingItems.has(item.id) ? 0 : 1,
                  transform: removingItems.has(item.id) ? 'translateX(-20px)' : 'translateX(0)',
                  animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
                }}
              >
                {/* Product image */}
                <div style={{
                  width: '88px', height: '88px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', flexShrink: 0,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--border)',
                }}>
                  <img
                    src={item.product.primary_image?.image || item.product.image || ''}
                    alt={item.product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Name + price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/products/${item.product.slug}`} style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600, fontSize: '15px',
                    color: 'var(--ink)', textDecoration: 'none',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-dark)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink)' }}>
                    {item.product.name}
                  </Link>

                  <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '16px', fontWeight: 700,
                    color: 'var(--accent-dark)', marginTop: '6px',
                  }}>
                    ₹{Number(item.product.effective_price).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Qty controls */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    disabled={updatingItems.has(item.id) || item.quantity <= 1}
                    style={{
                      width: '36px', height: '36px',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                      opacity: item.quantity <= 1 ? 0.3 : 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-warm)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <Minus size={14} />
                  </button>

                  <span style={{
                    width: '36px', textAlign: 'center',
                    fontSize: '14px', fontWeight: 700,
                    color: 'var(--ink)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    lineHeight: '36px',
                  }}>
                    {updatingItems.has(item.id) ? (
                      <span style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>…</span>
                    ) : item.quantity}
                  </span>

                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    disabled={updatingItems.has(item.id)}
                    style={{
                      width: '36px', height: '36px',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-warm)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Line total */}
                <div style={{
                  textAlign: 'right', flexShrink: 0,
                  minWidth: '80px',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>Total</p>
                  <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '17px', fontWeight: 700,
                    color: 'var(--ink)',
                  }}>
                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removingItems.has(item.id)}
                  style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', color: 'var(--ink-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(214,69,69,0.08)'
                    e.currentTarget.style.borderColor = 'rgba(214,69,69,0.3)'
                    e.currentTarget.style.color = 'var(--danger)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--ink-muted)'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--ink-muted)', textDecoration: 'none',
              marginTop: '4px', transition: 'color 0.2s',
              width: 'fit-content',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)' }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Right: Order Summary ────────────────────── */}
          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}>
              {/* Summary header */}
              <div style={{
                background: 'var(--ink)',
                padding: '24px 28px',
              }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '20px', fontWeight: 700,
                  color: 'white',
                }}>Order Summary</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>

              {/* Summary body */}
              <div style={{ padding: '24px 28px' }}>

                {/* Free delivery banner */}
                {deliveryFee > 0 && (
                  <div style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid rgba(200,169,110,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <Tag size={14} color="var(--accent-dark)" />
                    <p style={{ fontSize: '12px', color: 'var(--accent-dark)', fontWeight: 500 }}>
                      Add ₹{(999 - totalPrice).toFixed(0)} more for FREE delivery!
                    </p>
                  </div>
                )}

                {/* Line items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Subtotal</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                      ₹{Number(totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span style={{
                        fontSize: '12px', fontWeight: 700,
                        color: 'var(--success)',
                        background: '#D6F0E4',
                        padding: '3px 10px', borderRadius: '99px',
                      }}>FREE</span>
                    ) : (
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>₹{deliveryFee}</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '24px',
                }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                  <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '26px', fontWeight: 700,
                    color: 'var(--ink)',
                  }}>
                    ₹{Number(finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', height: '52px',
                    background: 'var(--ink)', color: 'white',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: '15px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', transition: 'all 0.25s',
                    marginBottom: '16px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--ink)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                {/* Trust badges */}
                <div style={{
                  display: 'flex', gap: '12px',
                  padding: '14px',
                  background: 'var(--paper-warm)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    flex: 1,
                  }}>
                    <Shield size={14} color="var(--ink-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Secure checkout</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    flex: 1,
                  }}>
                    <Truck size={14} color="var(--ink-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Fast delivery</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}