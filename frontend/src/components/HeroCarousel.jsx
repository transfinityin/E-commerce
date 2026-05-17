import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'

export default function HeroCarousel() {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  // Fetch banners
  useEffect(() => {
    api.get('/core/hero-banners/').then(r => {
      setBanners(r.data.results || r.data)
    }).catch(() => {})
  }, [])

  // Auto-slide timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused || isDragging) return
    
    timerRef.current = setInterval(() => {
      goToNext()
    }, 5000)
    
    return () => clearInterval(timerRef.current)
  }, [banners.length, isPaused, isDragging, current])

  const goToSlide = useCallback((index) => {
    setCurrent(index)
    setTranslateX(0)
  }, [])

  const goToNext = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length)
    setTranslateX(0)
  }, [banners.length])

  const goToPrev = useCallback(() => {
    setCurrent(c => (c - 1 + banners.length) % banners.length)
    setTranslateX(0)
  }, [banners.length])

  // Mouse/Touch drag handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true)
    setStartX(clientX)
    setIsPaused(true)
  }

  const handleDragMove = (clientX) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 100 // minimum drag distance to trigger slide change
    
    if (translateX > threshold) {
      // Dragged right → go to previous
      goToPrev()
    } else if (translateX < -threshold) {
      // Dragged left → go to next
      goToNext()
    } else {
      // Not enough drag → snap back
      setTranslateX(0)
    }
    
    setTimeout(() => setIsPaused(false), 1000)
  }

  // Mouse events
  const onMouseDown = (e) => handleDragStart(e.clientX)
  const onMouseMove = (e) => handleDragMove(e.clientX)
  const onMouseUp = () => handleDragEnd()
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd()
    setIsPaused(false)
  }

  // Touch events (mobile)
  const onTouchStart = (e) => handleDragStart(e.touches[0].clientX)
  const onTouchMove = (e) => handleDragMove(e.touches[0].clientX)
  const onTouchEnd = () => handleDragEnd()

  if (banners.length === 0) return null

  const banner = banners[current]

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ 
        backgroundColor: 'var(--color-bg-alt)',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseEnter={() => !isDragging && setIsPaused(true)}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Desktop: 21:9 aspect ratio, Mobile: 4:5 aspect ratio */}
      <div className="hidden md:block w-full" style={{ aspectRatio: '21/9', maxHeight: '600px' }}>
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full"
          style={{ 
            objectFit: 'cover', 
            objectPosition: `${banner.focal_x}% ${banner.focal_y}%`,
            transition: isDragging ? 'none' : 'transform 0.5s ease, opacity 0.5s ease',
            transform: `translateX(${translateX}px)`,
            opacity: isDragging ? 0.9 : 1,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          draggable={false}
        />
      </div>
      <div className="md:hidden w-full" style={{ aspectRatio: '4/5', maxHeight: '600px' }}>
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full"
          style={{ 
            objectFit: 'cover', 
            objectPosition: `${banner.focal_x}% ${banner.focal_y}%`,
            transition: isDragging ? 'none' : 'transform 0.5s ease, opacity 0.5s ease',
            transform: `translateX(${translateX}px)`,
            opacity: isDragging ? 0.9 : 1,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          draggable={false}
        />
      </div>

      {/* Content Overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          transition: 'opacity 0.5s ease',
          opacity: isDragging ? 0.7 : 1
        }}
      >
        {banner.title && (
          <h2 
            className="text-2xl md:text-5xl font-bold"
            style={{ 
              marginBottom: '8px',
              color: '#fff', 
              textShadow: '0 2px 10px rgba(0,0,0,0.3)' 
            }}
          >
            {banner.title}
          </h2>
        )}
        {banner.subtitle && (
          <p 
            className="text-sm md:text-lg"
            style={{ 
              marginBottom: '24px',
              maxWidth: '512px',
              color: 'rgba(255,255,255,0.9)' 
            }}
          >
            {banner.subtitle}
          </p>
        )}
        <Link
          to={banner.cta_link}
          className="inline-flex items-center font-semibold transition-all pointer-events-auto"
          style={{ 
            padding: '12px 32px', 
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)', 
            color: 'var(--color-text-inverse)',
            gap: '8px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {banner.cta_text}
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Navigation Arrows - LEFT */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all z-10"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              color: 'var(--color-text)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-text-inverse)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Navigation Arrows - RIGHT */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all z-10"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              color: 'var(--color-text)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-text-inverse)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
          >
            <ChevronRight size={20} />
          </button>
          
          {/* Dots Indicator */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 flex z-10"
            style={{ bottom: '24px', gap: '8px' }}
          >
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  goToSlide(i)
                }}
                className="h-2 rounded-full transition-all border-none cursor-pointer"
                style={{
                  width: i === current ? '32px' : '8px',
                  backgroundColor: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
                  transition: 'width 0.3s ease, background-color 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div 
            className="absolute z-10 text-xs font-mono"
            style={{ 
              top: '16px', 
              right: '16px', 
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            {String(current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
          </div>

          {/* Drag hint */}
          <div 
            className="absolute z-10 text-xs"
            style={{ 
              bottom: '48px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.4)',
              opacity: isDragging ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            ← Drag to navigate →
          </div>
        </>
      )}
    </div>
  )
}