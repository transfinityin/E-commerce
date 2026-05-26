import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useHuntStore } from "../store/useHuntStore";
const ARC_BG_IMAGE = '/arcs-bg3.jpg'
import { useEffect } from 'react'
// Unlock progress - in production, fetch from backend/API
const UNLOCK_PROGRESS = {
  wanderer: true,    // Arc 01 - Unlocked
  founderer: false,  // Arc 02 - LOCKED (needs Wanderer completion)
}
// const ARCS = [
//   {
//     no: '01',
//     title: 'Wanderer',
//     subtitle: 'The first threshold.',
//     status: 'unlocked',
//     href: '/arcs/wanderer',
//   },
//   {
//     no: '02',
//     title: 'Founderer',
//     subtitle: 'The first threshold.',
//     status: 'unlocked',
//     href: '/arcs/wanderer',
//   },
//   {
//     no: '02',
//     title: 'Phantom',
//     subtitle: 'Walls of obsidian glass.',
//     status: 'locked',
//     href: '/arcs/citadel',
//   },
//   {
//     no: '03',
//     title: 'Ascension',
//     subtitle: 'Disappear from the record.',
//     status: 'locked',
//     href: '/arcs/ghosting',
//   },
//   {
//     no: '04',
//     title: 'Rebirth',
//     subtitle: 'The first true crossing.',
//     status: 'locked',
//     href: '/arcs/void-gate',
//   },
//   {
//     no: '05',
//     title: 'Eclipse Sun',
//     subtitle: 'A star without warmth.',
//     status: 'locked',
//     href: '/arcs/hollow-sun',
//   },
//   {
//     no: '06',
//     title: 'Crimson',
//     subtitle: 'The ledger of broken oaths.',
//     status: 'locked',
//     href: '/arcs/crimson-index',
//   },
//   {
//     no: '07',
//     title: 'Void',
//     subtitle: 'A path made of signal.',
//     status: 'locked',
//     href: '/arcs/aetherline',
//   },
//   {
//     no: '08',
//     title: 'Zenith Court',
//     subtitle: 'Beneath the silent throne.',
//     status: 'locked',
//     href: '/arcs/sable-court',
//   },
//   {
//     no: '09',
//     title: 'Cosmic',
//     subtitle: 'The garment of stars.',
//     status: 'locked',
//     href: '/arcs/nebula-veil',
//   },
//   {
//     no: '10',
//     title: 'Shadow War',
//     subtitle: 'When all roads converge.',
//     status: 'locked',
//     href: '/arcs/final-bloom',
//   },
//   {
//     no: '11',
//     title: 'Celestial',
//     subtitle: 'A reflection of a reflection.',
//     status: 'locked',
//     href: '/arcs/mirror-sea',
//   },
//   {
//     no: '12',
//     title: 'Eternal',
//     subtitle: 'The end that returns.',
//     status: 'locked',
//     href: '/arcs/infinity',
//   },
 
// ]

export default function Arcs() {
  const { progress, fetchProgress } = useHuntStore()
  useEffect(() => {
    fetchProgress()
  }, [])

  // User-oda unlocked arcs list (illana empty array)
  const myUnlockedArcs = progress?.unlocked_arcs || []
  const ARCS = [
    { no: '01', title: 'Wanderer', subtitle: 'The first threshold.', status: myUnlockedArcs.includes('wanderer') ? 'unlocked' : 'locked', href: '/arcs/wanderer', slug: 'wanderer' },
    { no: '02', title: 'Founderer', subtitle: 'The architect of beginnings.', status: myUnlockedArcs.includes('founderer') ? 'unlocked' : 'locked', href: '/arcs/founderer', slug: 'founderer' },
    { no: '03', title: 'Phantom', subtitle: 'Walls of obsidian glass.', status: myUnlockedArcs.includes('phantom') ? 'unlocked' : 'locked', href: '/arcs/phantom', slug: 'phantom' },
    { no: '04', title: 'Ascension', subtitle: 'Disappear from the record.', status: myUnlockedArcs.includes('ascension') ? 'unlocked' : 'locked', href: '/arcs/ascension', slug: 'ascension' ,},
    { no: '05', title: 'Rebirth', subtitle: 'The first true crossing.', status: myUnlockedArcs.includes('rebirth') ? 'unlocked' : 'locked', href: '/arcs/rebirth', slug: 'rebirth' },
    { no: '06', title: 'Eclipse Sun', subtitle: 'A star without warmth.', status: myUnlockedArcs.includes('eclipse-sun') ? 'unlocked' : 'locked', href: '/arcs/eclipse-sun', slug: 'eclipse-sun' },
    { no: '07', title: 'Crimson', subtitle: 'The ledger of broken oaths.', status: myUnlockedArcs.includes('crimson') ? 'unlocked' : 'locked', href: '/arcs/crimson', slug: 'crimson' },
    { no: '08', title: 'Void', subtitle: 'A path made of signal.', status: myUnlockedArcs.includes('void') ? 'unlocked' : 'locked', href: '/arcs/void', slug: 'void' },
    { no: '09', title: 'Zenith Court', subtitle: 'Beneath the silent throne.', status: myUnlockedArcs.includes('zenith-court') ? 'unlocked' : 'locked', href: '/arcs/zenith-court', slug: 'zenith-court' },
    { no: '10', title: 'Cosmic', subtitle: 'The garment of stars.', status: myUnlockedArcs.includes('cosmic') ? 'unlocked' : 'locked', href: '/arcs/cosmic', slug: 'cosmic' },
    { no: '11', title: 'Shadow War', subtitle: 'When all roads converge.', status: myUnlockedArcs.includes('shadow-war') ? 'unlocked' : 'locked', href: '/arcs/shadow-war', slug: 'shadow-war' },
    { no: '12', title: 'Eternal', subtitle: 'The end that returns.', status: myUnlockedArcs.includes('eternal') ? 'unlocked' : 'locked', href: '/arcs/eternal', slug: 'eternal' },
]

  return (
    <>
      <style>{`
        @keyframes travelDown {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 12px rgba(212,175,55,0.4); }
          50% { box-shadow: 0 0 20px rgba(212,175,55,0.8); }
        }
        .animate-travel {
          animation: travelDown 15s linear infinite;
        }
        .animate-pulse-gold {
          animation: pulse-gold 2s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen overflow-x-hidden bg-black text-white pt-[96px] sm:pt-[110px] lg:pt-[120px] pb-20 sm:pb-24">
        <Navbar />

        {/* Background Image */}
        <div
          className="fixed inset-0 z-0 bg-no-repeat bg-top bg-[length:100%_auto] xl:bg-[length:min(100%,1800px)_auto]"
          style={{ backgroundImage: `url(${ARC_BG_IMAGE})` }}
        />

        {/* Overlay */}
        <div className="fixed inset-0 z-[1] pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.70)_0%,rgba(0,0,0,0.20)_28%,rgba(0,0,0,0.48)_65%,rgba(0,0,0,0.95)_100%),linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.22)_32%,rgba(0,0,0,0.22)_68%,rgba(0,0,0,0.88)_100%)]" />

        {/* Vignette */}
        <div className="fixed inset-0 z-[2] pointer-events-none shadow-[inset_0_0_160px_rgba(0,0,0,0.98),inset_0_90px_140px_rgba(0,0,0,0.72),inset_0_-130px_170px_rgba(0,0,0,0.96)]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          {/* Hero */}
          <section className="text-center mb-14 sm:mb-16 lg:mb-20">
            <div className="mx-auto mb-6 sm:mb-7 font-serif text-3xl sm:text-4xl text-gold/70 drop-shadow-[0_0_18px_rgba(212,175,55,0.25)]">∞</div>
            <p className="mb-4 font-mono text-[10px] sm:text-xs uppercase tracking-[0.5em] text-gold">Cosmic Map</p>
            <h1 className="font-serif text-[38px] sm:text-5xl md:text-6xl lg:text-7xl font-normal uppercase leading-none tracking-[0.03em] text-white drop-shadow-[0_0_24px_rgba(0,0,0,0.8)]">
              The <span className="normal-case italic text-gold">Twelve Arcs</span>
            </h1>
            <p className="mx-auto mt-5 sm:mt-6 max-w-xl text-sm sm:text-base font-light leading-relaxed tracking-wide text-white/60 drop-shadow-[0_0_18px_rgba(0,0,0,0.85)]">
              A pathway between worlds. Each arc reveals a chapter, a drop, a key.
            </p>

            {/* Unlock Progress Indicator */}
            <div className="mt-8 inline-flex items-center gap-3 px-5 py-2 border border-gold/20 bg-black/30">
              <div className="flex gap-1">
                {ARCS.map((arc) => (
                  <div 
                    key={arc.no}
                    className={`w-2 h-2 rounded-full ${
                      arc.status === 'unlocked' ? 'bg-gold' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gold/60">
                {ARCS.filter(a => a.status === 'unlocked').length} / {ARCS.length} Unlocked
              </span>
            </div>
          </section>

          {/* Zig-zag Timeline Map */}
          <TimelineContainer arcs={ARCS} />
        </div>
      </main>
    </>
  )
}

function TimelineContainer({ arcs }) {
  return (
    <div className="relative">
      {/* Desktop: Center vertical line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(212,175,55,0.4)_0_8px,transparent_8px_16px)]" />
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gold rounded-full animate-travel"
          style={{ boxShadow: '0 0 16px rgba(212,175,55,0.9), 0 0 32px rgba(212,175,55,0.4)' }}
        />
      </div>

      {/* Mobile: Left side line */}
      <div className="md:hidden absolute left-6 top-0 bottom-0 w-px z-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(212,175,55,0.4)_0_8px,transparent_8px_16px)]" />
      </div>

      {/* Cards */}
      <div className="relative z-10 space-y-6 sm:space-y-8 md:space-y-0">
        {arcs.map((arc, index) => (
          <TimelineItem key={arc.no} arc={arc} index={index} total={arcs.length} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ arc, index, total }) {
  const isLeft = index % 2 === 0
  const isLocked = arc.status === 'locked'
  const isLast = index === total - 1

  return (
    <div className={`
      relative flex items-center
      ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
      flex-col
      py-2 md:py-3
    `}>
      {/* Card */}
      <div className={`
        w-full md:w-[46%] lg:w-[45%]
        ${isLeft ? 'md:pr-10 lg:pr-14' : 'md:pl-10 lg:pl-14'}
        pl-14 md:pl-0
      `}>
        <ArcCard arc={arc} isLocked={isLocked} />
      </div>

      {/* Desktop Center: Node + Connector */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
        <div className={`
          absolute h-px bg-gold/60 top-1/2 -translate-y-1/2
          ${isLeft ? 'right-full mr-2 w-8 lg:w-12' : 'left-full ml-2 w-8 lg:w-12'}
        `} />

        <div className={`
          relative z-30 grid place-items-center
          w-10 h-10 rounded-full border-2
          ${isLocked 
            ? 'border-white/30 bg-black/70' 
            : 'border-gold bg-gold/20 animate-pulse-gold'
          }
        `}>
          <div className={`
            w-3 h-3 rounded-full
            ${isLocked ? 'bg-white/40' : 'bg-gold'}
          `} />
        </div>
      </div>

      <div className="hidden md:block md:w-[46%] lg:w-[45%]" />

      {/* Mobile: Left node */}
      <div className="md:hidden absolute left-6 top-1/2 -translate-y-1/2 z-20">
        <div className={`
          grid place-items-center
          w-7 h-7 rounded-full border-2 -translate-x-1/2
          ${isLocked 
            ? 'border-white/30 bg-black/70' 
            : 'border-gold bg-gold/20'
          }
        `}>
          <div className={`
            w-2 h-2 rounded-full
            ${isLocked ? 'bg-white/40' : 'bg-gold animate-pulse'}
          `} />
        </div>
      </div>
    </div>
  )
}

function ArcCard({ arc, isLocked }) {
  const statusLabel = isLocked ? 'Locked' : 'Unlocked'

  // Check if this arc has special unlock condition
  const needsWanderer = arc.slug === 'founderer' && isLocked

  const card = (
    <div className={`
      group relative w-full overflow-hidden
      border backdrop-blur-[4px]
      px-5 py-5 sm:px-6 sm:py-6
      transition-all duration-500
      ${isLocked
        ? 'border-white/10 bg-black/35 opacity-50 cursor-not-allowed'
        : 'border-gold/30 bg-black/45 shadow-[0_0_30px_rgba(212,175,55,0.06)] hover:-translate-y-1 hover:border-gold/55 hover:bg-black/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.12)]'
      }
    `}>
      {/* Lock overlay for Founderer */}
      {needsWanderer && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="grid size-12 place-items-center border border-gold/40 mb-2">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-gold">Complete Wanderer to Unlock</span>
        </div>
      )}

      <div className="
        pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100
        bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.08),transparent_50%)]
      " />

      <div className="relative z-10 flex items-start gap-4 sm:gap-5">
        <div className={`
          grid size-12 sm:size-14 shrink-0 place-items-center
          border font-serif text-lg sm:text-xl
          ${isLocked
            ? 'border-white/20 bg-black/20 text-white/50'
            : 'border-gold text-gold bg-gold/10'
          }
        `}>
          {arc.no}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="
              font-serif text-lg sm:text-xl md:text-2xl
              uppercase leading-none tracking-[0.08em]
              text-white/90
              drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]
            ">
              {arc.title}
            </h3>

            <span className={`
              font-mono text-[9px] sm:text-[10px]
              uppercase tracking-[0.3em]
              ${isLocked
                ? 'text-white/30'
                : 'text-gold drop-shadow-[0_0_12px_rgba(212,175,55,0.28)]'
              }
            `}>
              {statusLabel}
            </span>
          </div>

          <p className="mt-2 text-xs sm:text-sm italic tracking-wide text-white/50">
            {arc.subtitle}
          </p>

          {/* Unlock requirement hint */}
          {needsWanderer && (
            <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-gold/50">
              Requires: Wanderer Completion
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {isLocked ? (
        <div title={needsWanderer ? 'Complete Wanderer to unlock' : 'Locked'}>{card}</div>
      ) : (
        <Link to={arc.href} className="block no-underline">
          {card}
        </Link>
      )}
    </div>
  )
}
