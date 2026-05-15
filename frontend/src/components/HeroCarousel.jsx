import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'

export default function HeroCarousel() {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get('/core/hero-banners/').then(r => {
      setBanners(r.data.results || r.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const banner = banners[current]

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      {/* Desktop: 21:9 aspect ratio, Mobile: 4:5 aspect ratio */}
      <div className="hidden md:block w-full" style={{ aspectRatio: '21/9', maxHeight: '600px' }}>
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: `${banner.focal_x}% ${banner.focal_y}%` }}
        />
      </div>
      <div className="md:hidden w-full" style={{ aspectRatio: '4/5', maxHeight: '600px' }}>
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: `${banner.focal_x}% ${banner.focal_y}%` }}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}>
        {banner.title && (
          <h2 className="text-2xl md:text-5xl font-bold mb-2" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {banner.title}
          </h2>
        )}
        {banner.subtitle && (
          <p className="text-sm md:text-lg mb-6 max-w-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {banner.subtitle}
          </p>
        )}
        <Link
          to={banner.cta_link}
          className="inline-flex items-center rounded-lg font-semibold transition-all"
          style={{ padding: '12px 32px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}
        >
          {banner.cta_text}
        </Link>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--color-text)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--color-text)' }}
          >
            <ChevronRight size={20} />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full transition-all border-none cursor-pointer"
                style={{
                  width: i === current ? '24px' : '8px',
                  backgroundColor: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}