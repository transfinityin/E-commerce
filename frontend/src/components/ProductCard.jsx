// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
// import { toast } from 'react-hot-toast'
// import useCartStore from '../store/cartStore'
// import useWishlistStore from '../store/wishlistStore'
// import useAuthStore from '../store/authStore'


// export default function ProductCard({ product, index = 0 }) {
//   const [hovered,   setHovered]   = useState(false)
//   const [imgIndex,  setImgIndex]  = useState(0)
//   const [adding,    setAdding]    = useState(false)
//   const [wishlisting, setWishlisting] = useState(false)
  
//   const { addToCart }    = useCartStore()
//   const { toggle, isWishlisted } = useWishlistStore()
//   const { isAuthenticated } = useAuthStore()
//   const wishlisted = isWishlisted(product.id)




  
// const images = product.images?.length
//   ? product.images.map(img => img.image)
//   : product.primary_image?.image
//     ? [product.primary_image.image]
//     : []

// // ADD THIS ↓↓↓
// console.log('Product:', product.id, 'images:', product.images, 'primary:', product.primary_image)
// const currentImage = images[imgIndex]

// useEffect(() => {
//   if (images.length <= 1) return

//   const timer = setInterval(() => {
//     setImgIndex(prev => (prev + 1) % images.length)
//   }, 1000)

//   return () => clearInterval(timer)
// }, [images.length])
// const prevImg = (e) => {
//   e.preventDefault()
//   e.stopPropagation()
//   setImgIndex(i => (i - 1 + images.length) % images.length)
// }

// const nextImg = (e) => {
//   e.preventDefault()
//   e.stopPropagation()
//   setImgIndex(i => (i + 1) % images.length)
// }

//   const handleAddToCart = async (e) => {
//     e.preventDefault()
//     if (!isAuthenticated) { toast.error('Please sign in first'); return }
//     if (!product.in_stock) return
//     setAdding(true)
//     try {
//       await addToCart(product.id, 1)
//       toast.success('Added to cart!')
//     } catch {
//       toast.error('Failed to add')
//     } finally {
//       setTimeout(() => setAdding(false), 1000)
//     }
//   }

//   const handleWishlist = async (e) => {
//     e.preventDefault()
//     if (!isAuthenticated) { 
//       toast.error('Please sign in first'); 
//       return 
//     }
//     setWishlisting(true)
//     try {
//       await toggle(product.id)
//       // ADD THIS LINE ↓↓↓
//       const nowSaved = isWishlisted(product.id)
//       toast.success(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist')
//     } catch {
//       toast.error('Failed to update wishlist')
//     } finally {
//       setWishlisting(false)
//     }
//   }
  
//   return (
//     <Link
//       to={`/products/${product.slug}`}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => { setHovered(false) }}
//       style={{
//         display: 'block', textDecoration: 'none',
//         background: '#fff',
//         borderRadius: '12px',
//         overflow: 'hidden',
//         border: '1px solid #eee',
//         transition: 'box-shadow 0.2s',
//         boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
//       }}
//     >
//       {/* Image */}
//       <div style={{
//         position: 'relative',
//         aspectRatio: '3/4',
//         background: '#f5f5f5',
//         overflow: 'hidden',
//       }}>
//         {currentImage ? (
//           <img
//             src={currentImage}
//             alt={product.name}
//             style={{
//               width: '100%', height: '100%',
//               objectFit: 'cover',
//               transition: 'transform 0.4s ease',
//               transform: hovered ? 'scale(1.04)' : 'scale(1)',
//             }}
//           />
//         ) : (
//           <div style={{
//             width: '100%', height: '100%',
//             display: 'flex', alignItems: 'center',
//             justifyContent: 'center', fontSize: '48px',
//           }}>🛍️</div>
//         )}

//         {/* Image nav arrows */}
//         {images.length > 1 && hovered && (
//           <>
//             <button onClick={prevImg} style={{
//               position: 'absolute', left: '8px',
//               top: '50%', transform: 'translateY(-50%)',
//               width: '28px', height: '28px',
//               background: 'rgba(255,255,255,0.9)',
//               border: 'none', borderRadius: '50%',
//               cursor: 'pointer', display: 'flex',
//               alignItems: 'center', justifyContent: 'center',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//               zIndex: 3,
//             }}>
//               <ChevronLeft size={14} />
//             </button>
//             <button onClick={nextImg} style={{
//               position: 'absolute', right: '8px',
//               top: '50%', transform: 'translateY(-50%)',
//               width: '28px', height: '28px',
//               background: 'rgba(255,255,255,0.9)',
//               border: 'none', borderRadius: '50%',
//               cursor: 'pointer', display: 'flex',
//               alignItems: 'center', justifyContent: 'center',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//               zIndex: 3,
//             }}>
//               <ChevronRight size={14} />
//             </button>
//           </>
//         )}

//         {/* Image dots */}
//         {images.length > 1 && (
//           <div style={{
//             position: 'absolute', bottom: '8px',
//             left: '50%', transform: 'translateX(-50%)',
//             display: 'flex', gap: '4px', zIndex: 3,
//           }}>
//             {images.map((_, i) => (
//               <div key={i} style={{
//                 width: i === imgIndex ? '16px' : '5px',
//                 height: '5px',
//                 borderRadius: '99px',
//                 background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
//                 transition: 'all 0.2s',
//               }} />
//             ))}
//           </div>
//         )}

//         {/* Badges */}
//         <div style={{
//           position: 'absolute', top: '10px', left: '10px',
//           display: 'flex', flexDirection: 'column', gap: '5px',
//           zIndex: 2,
//         }}>
//           {product.discount_percent > 0 && (
//             <span style={{
//               background: '#22c55e',
//               color: 'white', fontSize: '10px',
//               fontWeight: 700, padding: '3px 8px',
//               borderRadius: '4px', letterSpacing: '0.04em',
//             }}>
//               {product.discount_percent}% OFF
//             </span>
//           )}
//           {product.is_featured && (
//             <span style={{
//               background: '#6366f1', color: 'white',
//               fontSize: '10px', fontWeight: 700,
//               padding: '3px 8px', borderRadius: '4px',
//             }}>
//               BEST SELLER
//             </span>
//           )}
//           {!product.in_stock && (
//             <span style={{
//               background: 'rgba(0,0,0,0.7)', color: 'white',
//               fontSize: '10px', fontWeight: 600,
//               padding: '3px 8px', borderRadius: '4px',
//             }}>
//               SOLD OUT
//             </span>
//           )}
//         </div>

// {/* Wishlist - Mobile Circle Fix */}
// {/* Wishlist - Complete Fix */}
// <button
//   onClick={handleWishlist}
//   className={`
//     absolute top-2 right-2
//     sm:top-3 sm:right-3
//     w-7 h-7
//     sm:w-8 sm:h-8
//     min-h-0              {/* ← OVERRIDE min-height:44px */}
//     min-w-0
//     rounded-full
//     bg-white
//     border border-neutral-200
//     flex items-center justify-center
//     cursor-pointer
//     z-30
//     transition-all duration-200
//     shadow-[0_1px_4px_rgba(0,0,0,0.15)]
//     active:scale-90
//     ${wishlisted 
//       ? 'bg-red-50 border-red-200 text-red-500' 
//       : 'text-neutral-400 hover:text-neutral-600'
//     }
//   `}
// >
//   <Heart 
//     size={13}
//     fill={wishlisted ? 'currentColor' : 'none'} 
//     strokeWidth={2}
//   />
// </button>
//         {/* Add to cart — bottom */}
//         <div style={{
//           position: 'absolute', bottom: 0,
//           left: 0, right: 0,
//           padding: '8px',
//           transform: hovered ? 'translateY(0)' : 'translateY(100%)',
//           transition: 'transform 0.25s ease',
//           zIndex: 3,
//         }}>
//           <button onClick={handleAddToCart} disabled={!product.in_stock || adding} style={{
//             width: '100%', padding: '11px',
//             background: adding ? '#16a34a' : '#111',
//             color: 'white', border: 'none',
//             borderRadius: '8px',
//             fontSize: '12px', fontWeight: 700,
//             letterSpacing: '0.08em',
//             textTransform: 'uppercase',
//             cursor: product.in_stock ? 'pointer' : 'not-allowed',
//             fontFamily: 'DM Sans, sans-serif',
//             transition: 'background 0.2s',
//             display: 'flex', alignItems: 'center',
//             justifyContent: 'center', gap: '8px',
//           }}>
//             <ShoppingBag size={14} />
//             {adding ? 'Added!' : product.in_stock ? 'Add to Cart' : 'Sold Out'}
//           </button>
//         </div>
//       </div>

//       {/* Info */}
//       <div style={{ padding: '12px 14px 14px' }}>
//         <p style={{
//           fontSize: '11px', color: '#888',
//           marginBottom: '3px', textTransform: 'uppercase',
//           letterSpacing: '0.06em',
//         }}>{product.category?.name}</p>

//         <h3 style={{
//           fontSize: '13px', fontWeight: 500,
//           color: '#111', marginBottom: '8px',
//           lineHeight: 1.4,
//           display: '-webkit-box',
//           WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
//           overflow: 'hidden',
//           fontFamily: 'DM Sans, sans-serif',
//         }}>{product.name}</h3>

//         {/* Rating */}
//         {product.rating_count > 0 && (
//           <div style={{
//             display: 'flex', alignItems: 'center',
//             gap: '4px', marginBottom: '8px',
//             background: '#f9f9f9',
//             borderRadius: '4px', padding: '3px 8px',
//             width: 'fit-content',
//           }}>
//             <span style={{ color: '#f59e0b', fontSize: '12px' }}>★</span>
//             <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>
//               {product.rating_avg?.toFixed(1)}
//             </span>
//             <span style={{ fontSize: '11px', color: '#888' }}>
//               | {product.rating_count}
//             </span>
//           </div>
//         )}

//         {/* Price */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{
//             fontSize: '16px', fontWeight: 700, color: '#111',
//             fontFamily: 'DM Sans, sans-serif',
//           }}>
//             ₹{Number(product.effective_price).toLocaleString('en-IN')}
//           </span>
//           {product.sale_price && (
//             <>
//               <span style={{
//                 fontSize: '13px', color: '#aaa',
//                 textDecoration: 'line-through',
//               }}>
//                 ₹{Number(product.price).toLocaleString('en-IN')}
//               </span>
//               <span style={{
//                 fontSize: '12px', fontWeight: 700,
//                 color: '#16a34a',
//               }}>
//                 {product.discount_percent}% OFF
//               </span>
//             </>
//           )}
//         </div>
//       </div>
//     </Link>
//   )
// }
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
      ? [product.primary_image.image]
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
    if (!isAuthenticated) { 
      toast.error('Authentication required. Cross the threshold first.') 
      return 
    }
    if (!product.in_stock) return
    setAdding(true)
    try {
      await addToCart(product.id, 1)
      toast.success('Artifact secured in cargo hold')
    } catch {
      toast.error('Transfer failed. Signal interrupted.')
    } finally {
      setTimeout(() => setAdding(false), 1000)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { 
      toast.error('Authentication required. Cross the threshold first.') 
      return 
    }
    setWishlisting(true)
    try {
      await toggle(product.id)
      const nowSaved = isWishlisted(product.id)
      toast.success(nowSaved ? 'Artifact preserved in collection' : 'Artifact removed from collection')
    } catch {
      toast.error('Collection update failed.')
    } finally {
      setWishlisting(false)
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false) }}
      className="product-card group relative overflow-hidden block no-underline animate-fadeUp"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover card-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--color-surface)] text-muted">
            ∞
          </div>
        )}

        {/* Image Navigation Arrows */}
        {images.length > 1 && hovered && (
          <>
            <button 
              onClick={prevImg}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[var(--color-bg)]/80 border border-[var(--color-border)] flex items-center justify-center text-white hover:border-gold hover:text-gold transition-all duration-200 z-10 cursor-pointer"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={nextImg}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[var(--color-bg)]/80 border border-[var(--color-border)] flex items-center justify-center text-white hover:border-gold hover:text-gold transition-all duration-200 z-10 cursor-pointer"
            >
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </>
        )}

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <div 
                key={i}
                className={`transition-all duration-200 ${
                  i === imgIndex 
                    ? 'w-4 h-1 bg-gold' 
                    : 'w-1 h-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount_percent > 0 && (
            <span className="product-tag bg-[var(--color-gold)] text-black">
              {product.discount_percent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="product-tag bg-[var(--color-gold)] text-black">
              FEATURED
            </span>
          )}
          {!product.in_stock && (
            <span className="product-tag bg-[var(--color-surface)] text-muted border border-[var(--color-border)]">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 border flex items-center justify-center z-20 transition-all duration-200 cursor-pointer ${
            wishlisted 
              ? 'bg-[var(--color-bg)] border-gold text-gold' 
              : 'bg-[var(--color-bg)]/80 border-[var(--color-border)] text-muted hover:border-gold hover:text-gold'
          }`}
        >
          <Heart 
            size={13}
            fill={wishlisted ? 'currentColor' : 'none'} 
            strokeWidth={2}
          />
        </button>

        {/* Add to Cart - Bottom */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 transition-transform duration-300 z-10 ${
            hovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <button 
            onClick={handleAddToCart} 
            disabled={!product.in_stock || adding}
            className={`w-full py-2.5 sm:py-3 text-xs font-semibold tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              adding 
                ? 'bg-gold text-black' 
                : product.in_stock 
                  ? 'bg-[var(--color-bg)] border border-gold text-gold hover:bg-gold hover:text-black' 
                  : 'bg-[var(--color-surface)] text-muted cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" />
            {adding ? 'SECURED!' : product.in_stock ? 'ADD TO CARGO' : 'SOLD OUT'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 relative z-10">
        <p className="label-gold text-[10px] mb-1">
          {product.category?.name}
        </p>

        <h3 className="text-xs sm:text-sm font-medium text-white hover:text-gold transition-colors line-clamp-2 mb-1.5 sm:mb-2 min-h-[32px] sm:min-h-[40px] tracking-wide">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mb-2 sm:mb-3 bg-[var(--color-bg-alt)] w-fit px-2 py-1">
            <span className="text-gold text-xs">★</span>
            <span className="text-xs font-medium text-white">
              {product.rating_avg?.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted">
              | {product.rating_count}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="price-tag text-sm sm:text-base">
            ₹{Number(product.effective_price).toLocaleString('en-IN')}
          </span>
          {product.sale_price && (
            <>
              <span className="text-xs sm:text-sm text-muted line-through">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-gold">
                {product.discount_percent}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}