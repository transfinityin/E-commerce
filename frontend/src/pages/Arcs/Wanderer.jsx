import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const ARC_BG_IMAGE = '/arcs-bg3.jpg'

const WANDERER_PRODUCTS = [
  { id: 'wanderer1', name: 'Wanderer Tee', price: 1299, image: '/products/wanderer-tee.jpg', description: 'Arc 01 exclusive. Limited edition.' },
  { id: 'wanderer2', name: 'Wanderer Hoodie', price: 2499, image: '/products/wanderer-hoodie.jpg', description: 'Premium streetwear for the journey.' },
  { id: 'wanderer3', name: 'Wanderer Cap', price: 899, image: '/products/wanderer-cap.jpg', description: 'Mark your path beyond limits.' },
  { id: 'wanderer4', name: 'Wanderer Poster', price: 599, image: '/products/wanderer-poster.jpg', description: 'Visual reminder of the threshold.' },
]

export default function Wanderer() {
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
        <CompleteArcSection />
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
        <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/videos/wanderer-poster.jpg">
          <source src="/videos/wanderer-header.mp4" type="video/mp4" />
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
            <div className="grid size-8 place-items-center border border-gold text-gold bg-gold/10 font-serif text-sm">01</div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Arc One</span>
          </div>
        </div>

        <h1 className="animate-fade-in-up font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none tracking-[0.02em] text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]" style={{ animationDelay: '0.2s' }}>
          The <span className="normal-case italic text-gold text-shimmer">Wanderer</span>
        </h1>

        <p className="animate-fade-in-up mt-4 sm:mt-6 font-mono text-xs sm:text-sm uppercase tracking-[0.5em] text-gold/80" style={{ animationDelay: '0.4s' }}>
          The World Before Awakening
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
    audioRef.current = new Audio('/audio/wanderer-ambient.mp3')
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
            The World Before <span className="italic text-gold">Awakening</span>
          </h2>
        </div>

        <div className="space-y-8">
          <div className="animate-fade-in-up border-l-2 border-gold/30 pl-6 sm:pl-8" style={{ animationDelay: '0.0s' }}>
            <p className="text-sm sm:text-base leading-[1.9] text-white/70 font-light">In a world where ambition was suppressed and creativity was treated like rebellion, most people lived trapped inside a system known as "The Frame." Society taught them to follow rules, fear risk, and never dream beyond their limits. But somewhere within the darkness of the city, one silent creator refused to accept that reality. While the world slept, he spent countless nights sketching symbols, writing visions, and searching for something powerful enough to awaken people from the ordinary. Then, during one storm-filled night, he created the symbol that would change everything — ♾. It was not just a logo, but a mark of infinite evolution.</p>
          </div>
          <div className="animate-fade-in-up border-l-2 border-white/10 pl-6 sm:pl-8" style={{ animationDelay: '0.15s' }}>
            <p className="text-sm sm:text-base leading-[1.9] text-white/70 font-light">The appearance of the infinity symbol became known as "The Awakening." A small number of people began noticing it appearing in hidden places across the city — on walls, screens, abandoned tunnels, and eventually on clothing worn by mysterious figures called "The Founders." Nobody knew who started it, but the movement slowly began spreading through whispers and rumors. TRANSFINITY was no longer just an idea; it had become a rebellion against limits themselves. And just as the world started searching for the creator behind the symbol, he vanished without a trace, leaving behind only one message:</p>
          </div>
          <div className="animate-fade-in-up border-l-2 border-gold/30 pl-6 sm:pl-8" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm sm:text-base leading-[1.9] text-white/70 font-light">Humans were never meant to live with limits.</p>
          </div>
          
          <div className="animate-fade-in-up my-10 sm:my-12 py-8 px-6 sm:px-8 border border-gold/20 bg-gold/[0.03] text-center" style={{ animationDelay: '0.3s' }}>
            <div className="font-serif text-xl sm:text-2xl md:text-3xl italic text-gold/80 leading-relaxed">
              Humans were never meant to live with limits.
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

function CompleteArcSection() {
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [showConfetti, setShowConfetti] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const completed = localStorage.getItem('arc01_wanderer_completed')
    if (completed === 'true') setIsCompleted(true)
  }, [])

  const handleComplete = () => {
    localStorage.setItem('arc01_wanderer_completed', 'true')
    localStorage.setItem('arc02_founderer_unlocked', 'true')
    setIsCompleted(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleContinue = () => { navigate('/arcs') }

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <div className="border border-gold/20 bg-gold/[0.03] p-8 sm:p-10">
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 border ${isCompleted ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-gold/40 bg-gold/10 text-gold'}`}>
              <div className={`size-2 rounded-full ${isCompleted ? 'bg-green-400 animate-pulse' : 'bg-gold'}`} />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{isCompleted ? 'Arc Completed' : 'Arc In Progress'}</span>
            </div>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl uppercase tracking-[0.08em] text-white/90 mb-4">{isCompleted ? 'Threshold Crossed' : 'Complete the Threshold'}</h3>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">{isCompleted ? 'You have transcended. The next arc awaits.' : 'Read the lore, explore the collection, and claim your passage.'}</p>
          {!isCompleted ? (
            <button onClick={handleComplete} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold text-black font-mono text-xs uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 animate-pulse-glow">
              <span>Complete Arc 01</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="font-mono text-xs uppercase tracking-wider">Next Arc Unlocked</span>
              </div>
              <button onClick={handleContinue} className="inline-flex items-center gap-3 px-8 py-3 border border-gold/40 text-gold font-mono text-xs uppercase tracking-[0.3em] hover:bg-gold/10 hover:border-gold/60 transition-all duration-300">
                <span>Return to Map</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          )}
          {showConfetti && <ConfettiEffect />}
        </div>
      </div>
    </section>
  )
}

function ConfettiEffect() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 2}s`,
    duration: `${Math.random() * 3 + 2}s`,
    color: ['#d4af37', '#ffffff', '#ffd700', '#c5a028'][Math.floor(Math.random() * 4)],
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(piece => (
        <div key={piece.id} className="absolute top-0 w-2 h-2 rounded-full" style={{
          left: piece.left, backgroundColor: piece.color,
          animation: `confetti-fall ${piece.duration} ease-out ${piece.delay} forwards`,
        }} />
      ))}
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
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
            Wanderer <span className="italic text-gold">Essentials</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-lg mx-auto">
            Carry the spirit of the first threshold. Each piece marks the beginning of the journey beyond The Frame.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {WANDERER_PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4">
          <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-3 border border-gold/40 text-gold font-mono text-xs uppercase tracking-[0.3em] hover:bg-gold/10 hover:border-gold/60 transition-all duration-300">
            Visit Full Shop
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <Link to="/arcs/founderer" className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 text-gold font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold/10 transition-all duration-300">
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
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">Arc 01</span>
        </div>
      </div>
    </div>
  )
}
