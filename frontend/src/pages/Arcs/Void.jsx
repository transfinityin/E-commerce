import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const ARC_BG_IMAGE = '/arcs-bg3.jpg'

const VOID_PRODUCTS = [
  { id: 'void1', name: 'Void Tee', price: 1299, image: '/products/void-tee.jpg', description: 'Arc 08 exclusive. Limited edition.' },
  { id: 'void2', name: 'Void Hoodie', price: 2499, image: '/products/void-hoodie.jpg', description: 'Premium streetwear for the journey.' },
  { id: 'void3', name: 'Void Cap', price: 899, image: '/products/void-cap.jpg', description: 'Mark your path beyond limits.' },
  { id: 'void4', name: 'Void Poster', price: 599, image: '/products/void-poster.jpg', description: 'Visual reminder of the threshold.' },
]

export default function Void() {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3); }
          50% { box-shadow: 0 0 40px rgba(212,175,55,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .text-shimmer {
          background: linear-gradient(90deg, #d4af37 0%, #fff 50%, #d4af37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
        <Navbar />
        <VideoHeader />
        <StorySection />
        <ShopSection />

        <div className="fixed inset-0 z-[-1] bg-no-repeat bg-top bg-[length:100%_auto] xl:bg-[length:min(100%,1800px)_auto] opacity-30" style={{ backgroundImage: `url(${ARC_BG_IMAGE})` }} />
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.60)_30%,rgba(0,0,0,0.80)_70%,rgba(0,0,0,0.98)_100%)]" />
      </main>
    </>
  )
}

function VideoHeader() {
  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/videos/void-poster.jpg">
          <source src="/videos/void-header.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.20)_40%,rgba(0,0,0,0.70)_80%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <AudioControls />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <Link to="/arcs" className="absolute top-24 sm:top-28 left-4 sm:left-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold/70 hover:text-gold transition-colors duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Map
        </Link>

        <div className="mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-5 py-2 border border-gold/40 bg-black/40 backdrop-blur-sm">
            <div className="grid size-8 place-items-center border border-gold text-gold bg-gold/10 font-serif text-sm">08</div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Arc Eight</span>
          </div>
        </div>

        <h1 className="animate-fade-in-up font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none tracking-[0.02em] text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]" style={{ animationDelay: '0.2s' }}>
          The <span className="normal-case italic text-gold text-shimmer">Void</span>
        </h1>

        <p className="animate-fade-in-up mt-4 sm:mt-6 font-mono text-xs sm:text-sm uppercase tracking-[0.5em] text-gold/80" style={{ animationDelay: '0.4s' }}>
          The Peak Of Evolution
        </p>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <div className="w-px h-8 bg-[repeating-linear-gradient(to_bottom,rgba(212,175,55,0.6)_0_4px,transparent_4px_8px)]" />
        </div>
      </div>
    </section>
  )
}

function AudioControls() {
  const [isMuted, setIsMuted] = React.useState(true)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef(null)

  React.useEffect(() => {
    audioRef.current = new Audio('/audio/void-ambient.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.4
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null } }
  }, [])

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isMuted) { audioRef.current.play().catch(() => {}); setIsPlaying(true); setIsMuted(false) }
    else { audioRef.current.pause(); setIsPlaying(false); setIsMuted(true) }
  }

  return (
    <div className="absolute top-24 sm:top-28 right-4 sm:right-8 z-30">
      <button onClick={toggleAudio} className={`flex items-center gap-2 px-4 py-2 rounded-none border backdrop-blur-sm transition-all duration-300 ${isMuted ? 'border-white/20 bg-black/40 text-white/50 hover:text-white/80 hover:border-white/40' : 'border-gold/50 bg-gold/10 text-gold hover:bg-gold/20 animate-pulse-glow'}`}>
        <div className="flex items-end gap-[2px] h-4">
          {[1,2,3,4].map(bar => (
            <div key={bar} className={`w-[3px] bg-current rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{height: isPlaying ? `${Math.random()*12+4}px` : '4px', animationDelay: `${bar*0.1}s`}} />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{isMuted ? 'Sound Off' : 'Sound On'}</span>
      </button>
    </div>
  )
}

function StorySection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-gold/40" />
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-gold">The Lore</span>
            <div className="h-px w-12 bg-gold/40" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.08em] text-white/90">
            The Peak Of <span className="italic text-gold">Evolution</span>
          </h2>
        </div>

        <div className="space-y-8">
          <div className="animate-fade-in-up border-l-2 border-gold/30 pl-6 sm:pl-8" style={{ animationDelay: '0.0s' }}>
            <p className="text-sm sm:text-base leading-[1.9] text-white/70 font-light">After returning from the Void, Kairos was no longer seen as merely the Founder of TRANSFINITY — he had become something far greater. His presence alone carried an overwhelming aura that inspired both fear and admiration across the world. Entire cities began embracing the infinity symbol openly, and the underground movement evolved into a global phenomenon connected through one belief: limitless evolution. This era became known as the Zenith Arc — "The Peak of Evolution." During this period, TRANSFINITY reached its highest level of influence, blending luxury, power, and philosophy into a culture that reshaped society itself. The Founders who once hid in shadows were now viewed as elite beings who had transcended ordinary human limitations.</p>
          </div>
          <div className="animate-fade-in-up border-l-2 border-white/10 pl-6 sm:pl-8" style={{ animationDelay: '0.15s' }}>
            <p className="text-sm sm:text-base leading-[1.9] text-white/70 font-light">But reaching the peak came with consequences. As TRANSFINITY's influence spread worldwide, humanity became divided between those who embraced evolution and those terrified by it. Massive towers marked with glowing infinity symbols rose across major cities, while hidden factions inside "The Frame" secretly prepared for war against Kairos and the Founders. Meanwhile, Kairos himself became increasingly distant, spending more time in silence as though he could see something approaching beyond human understanding. The Founders soon realized the terrifying truth: the Void had not only changed Kairos — it had awakened something ancient beyond reality, something watching the world from the darkness between dimensions. And as strange cosmic fractures began appearing across the skies, the Zenith Arc marked the beginning of humanity's transition from a civilization… into a legend.</p>
          </div>
          
          <div className="animate-fade-in-up my-10 sm:my-12 py-8 px-6 sm:px-8 border border-gold/20 bg-gold/[0.03] text-center" style={{ animationDelay: '0.3s' }}>
            <div className="font-serif text-xl sm:text-2xl md:text-3xl italic text-gold/80 leading-relaxed">
              At the peak, one sees not the end, but the infinite horizon.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-16 sm:mt-20">
          <div className="h-px w-16 bg-gold/30" />
          <div className="grid size-8 place-items-center border border-gold/30 rotate-45"><div className="w-2 h-2 bg-gold/50" /></div>
          <div className="h-px w-16 bg-gold/30" />
        </div>
      </div>
    </section>
  )
}

function ShopSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24 pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-gold/40" />
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-gold">The Collection</span>
            <div className="h-px w-12 bg-gold/40" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.08em] text-white/90">
            Void <span className="italic text-gold">Essentials</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-lg mx-auto">
            At the summit. Only the elite wear the zenith mark.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {VOID_PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4">
          <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-3 border border-gold/40 text-gold font-mono text-xs uppercase tracking-[0.3em] hover:bg-gold/10 hover:border-gold/60 transition-all duration-300">
            Visit Full Shop
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <Link to="/arcs/crimson" className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/50 font-mono text-[10px] uppercase tracking-[0.3em] hover:border-gold/40 hover:text-gold transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Previous Arc
          </Link>
          <Link to="/arcs/zenith-court" className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 text-gold font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold/10 transition-all duration-300">
            Next Arc
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
          
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, index }) {
  return (
    <div className="group relative border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-gold/40 hover:bg-black/60 hover:-translate-y-2" style={{ animationDelay: `${index*0.1}s` }}>
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
        <div className="absolute inset-0 hidden items-center justify-center bg-black/60">
          <div className="text-center">
            <div className="font-serif text-4xl text-gold/30 mb-2">∞</div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">{product.name}</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.8)_100%)] opacity-60 group-hover:opacity-80 transition-opacity" />
        <button className="absolute bottom-4 left-4 right-4 py-3 bg-gold/90 text-black font-mono text-xs uppercase tracking-[0.2em] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold">
          Add to Cart — ₹{product.price}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-sm sm:text-base uppercase tracking-[0.08em] text-white/90 mb-1">{product.name}</h3>
        <p className="text-xs text-white/40 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-gold">₹{product.price}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">Arc 08</span>
        </div>
      </div>
    </div>
  )
}
