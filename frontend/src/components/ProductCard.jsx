import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'


export default function ProductCard({ product, index = 0 }) {
  const [hovered,   setHovered]   = useState(false)
  const [imgIndex,  setImgIndex]  = useState(0)
  const [adding,    setAdding]    = useState(false)
  const [wishlisting, setWishlisting] = useState(false)
  
  const { addToCart }    = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const wishlisted = isWishlisted(product.id)




  
const images = product.images?.length
  ? product.images.map(img => img.image)
  : product.primary_image?.image
    ? [
        product.primary_image.image,
        product.primary_image.image,
        product.primary_image.image
      ]
    : []
const currentImage = images[imgIndex]

useEffect(() => {
  if (images.length <= 1) return

  const timer = setInterval(() => {
    setImgIndex(prev => (prev + 1) % images.length)
  }, 1000)

  return () => clearInterval(timer)
}, [images.length])
const prevImg = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setImgIndex(i => (i - 1 + images.length) % images.length)
}

const nextImg = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setImgIndex(i => (i + 1) % images.length)
}

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    if (!product.in_stock) return
    setAdding(true)
    try {
      await addToCart(product.id, 1)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add')
    } finally {
      setTimeout(() => setAdding(false), 1000)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    setWishlisting(true)
    try {
      await toggle(product.id)
    } catch {
      toast.error('Failed')
    } finally {
      setWishlisting(false)
    }
  }
  
  return (
    <Link
      to={`/products/${product.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false) }}
      style={{
        display: 'block', textDecoration: 'none',
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #eee',
        transition: 'box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        aspectRatio: '3/4',
        background: '#f5f5f5',
        overflow: 'hidden',
      }}>
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '48px',
          }}>🛍️</div>
        )}

        {/* Image nav arrows */}
        {images.length > 1 && hovered && (
          <>
            <button onClick={prevImg} style={{
              position: 'absolute', left: '8px',
              top: '50%', transform: 'translateY(-50%)',
              width: '28px', height: '28px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none', borderRadius: '50%',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 3,
            }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextImg} style={{
              position: 'absolute', right: '8px',
              top: '50%', transform: 'translateY(-50%)',
              width: '28px', height: '28px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none', borderRadius: '50%',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 3,
            }}>
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '8px',
            left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '4px', zIndex: 3,
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === imgIndex ? '16px' : '5px',
                height: '5px',
                borderRadius: '99px',
                background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        )}

        {/* Badges */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          zIndex: 2,
        }}>
          {product.discount_percent > 0 && (
            <span style={{
              background: '#22c55e',
              color: 'white', fontSize: '10px',
              fontWeight: 700, padding: '3px 8px',
              borderRadius: '4px', letterSpacing: '0.04em',
            }}>
              {product.discount_percent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span style={{
              background: '#6366f1', color: 'white',
              fontSize: '10px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '4px',
            }}>
              BEST SELLER
            </span>
          )}
          {!product.in_stock && (
            <span style={{
              background: 'rgba(0,0,0,0.7)', color: 'white',
              fontSize: '10px', fontWeight: 600,
              padding: '3px 8px', borderRadius: '4px',
            }}>
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist} style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '32px', height: '32px',
          background: wishlisted ? '#fee2e2' : 'rgba(255,255,255,0.9)',
          border: 'none', borderRadius: '50%',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 3, transition: 'all 0.2s',
          color: wishlisted ? '#ef4444' : '#666',
        }}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Add to cart — bottom */}
        <div style={{
          position: 'absolute', bottom: 0,
          left: 0, right: 0,
          padding: '8px',
          transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
          zIndex: 3,
        }}>
          <button onClick={handleAddToCart} disabled={!product.in_stock || adding} style={{
            width: '100%', padding: '11px',
            background: adding ? '#16a34a' : '#111',
            color: 'white', border: 'none',
            borderRadius: '8px',
            fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: product.in_stock ? 'pointer' : 'not-allowed',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}>
            <ShoppingBag size={14} />
            {adding ? 'Added!' : product.in_stock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          fontSize: '11px', color: '#888',
          marginBottom: '3px', textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>{product.category?.name}</p>

        <h3 style={{
          fontSize: '13px', fontWeight: 500,
          color: '#111', marginBottom: '8px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: 'DM Sans, sans-serif',
        }}>{product.name}</h3>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '4px', marginBottom: '8px',
            background: '#f9f9f9',
            borderRadius: '4px', padding: '3px 8px',
            width: 'fit-content',
          }}>
            <span style={{ color: '#f59e0b', fontSize: '12px' }}>★</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>
              {product.rating_avg?.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#888' }}>
              | {product.rating_count}
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '16px', fontWeight: 700, color: '#111',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            ₹{Number(product.effective_price).toLocaleString('en-IN')}
          </span>
          {product.sale_price && (
            <>
              <span style={{
                fontSize: '13px', color: '#aaa',
                textDecoration: 'line-through',
              }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: '#16a34a',
              }}>
                {product.discount_percent}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}