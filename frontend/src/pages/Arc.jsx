import { useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useHuntStore } from '../store/useHuntStore'
import { ArcsTrailMap } from '../components/arcs/ArcsTrailMap'

const ARC_DEFS = [
  { no: '01', title: 'Wanderer', subtitle: 'The first threshold.', slug: 'wanderer', href: '/arcs/wanderer' },
  { no: '02', title: 'Founderer', subtitle: 'The architect of beginnings.', slug: 'founderer', href: '/arcs/founderer' },
  { no: '03', title: 'Phantom', subtitle: 'Walls of obsidian glass.', slug: 'phantom', href: '/arcs/phantom' },
  { no: '04', title: 'Ascension', subtitle: 'Disappear from the record.', slug: 'ascension', href: '/arcs/ascension' },
  { no: '05', title: 'Rebirth', subtitle: 'The first true crossing.', slug: 'rebirth', href: '/arcs/rebirth' },
  { no: '06', title: 'Eclipse Sun', subtitle: 'A star without warmth.', slug: 'eclipse-sun', href: '/arcs/eclipse-sun' },
  { no: '07', title: 'Crimson', subtitle: 'The ledger of broken oaths.', slug: 'crimson', href: '/arcs/crimson' },
  { no: '08', title: 'Void', subtitle: 'A path made of signal.', slug: 'void', href: '/arcs/void' },
  { no: '09', title: 'Zenith Court', subtitle: 'Beneath the silent throne.', slug: 'zenith-court', href: '/arcs/zenith-court' },
  { no: '10', title: 'Cosmic', subtitle: 'The garment of stars.', slug: 'cosmic', href: '/arcs/cosmic' },
  { no: '11', title: 'Shadow War', subtitle: 'When all roads converge.', slug: 'shadow-war', href: '/arcs/shadow-war' },
  { no: '12', title: 'Eternal', subtitle: 'The end that returns.', slug: 'eternal', href: '/arcs/eternal' },
]

function useDust(count = 28) {
  return useMemo(() => {
    const dots = []
    for (let i = 0; i < count; i++) {
      const s = Math.sin(i * 12.9898) * 43758.5453
      const t = Math.sin(i * 78.233) * 12345.6789
      const u = s - Math.floor(s)
      const v = t - Math.floor(t)
      dots.push({
        id: i,
        left: `${(u * 100).toFixed(2)}%`,
        top: `${(v * 100).toFixed(2)}%`,
        size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.2,
        delay: `${(u * 5).toFixed(2)}s`,
        dur: `${4 + v * 5}s`,
        opacity: 0.15 + u * 0.35,
      })
    }
    return dots
  }, [count])
}

export default function Arcs() {
  const { progress, fetchProgress } = useHuntStore()
  const dust = useDust(32)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const unlocked = progress?.unlocked_arcs || []
  const arcs = ARC_DEFS.map((arc) => ({
    ...arc,
    unlocked: unlocked.includes(arc.slug) || arc.slug === 'wanderer',
  }))

  return (
    <div className="tf-arcs-page relative min-h-screen overflow-hidden pb-20 text-neutral-900">
      {/* Soft light atmosphere — matches home / shop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#EFEFEF]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 45% at 50% -5%, rgba(255,255,255,0.95), transparent 55%),
              radial-gradient(ellipse 50% 40% at 100% 20%, rgba(180,160,200,0.12), transparent 50%),
              radial-gradient(ellipse 45% 35% at 0% 60%, rgba(160,180,210,0.1), transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 100%, rgba(220,210,190,0.35), transparent 55%),
              linear-gradient(180deg, #F4F4F2 0%, #EFEFEF 40%, #EAE6DF 100%)
            `,
          }}
        />
        {dust.map((d) => (
          <span
            key={d.id}
            className="tf-arcs-dust absolute rounded-full bg-neutral-900"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              animationDelay: d.delay,
              animationDuration: d.dur,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[980px] px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center md:text-left"
        >
          <p className="text-[10px] font-medium tracking-[0.4em] text-neutral-500 uppercase">
            The whole story
          </p>

          <h1 className="tf-rebirth-title mt-3 select-none font-sans font-semibold uppercase leading-[0.95] tracking-[0.06em]">
            RE&nbsp;:&nbsp;BIRTH
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 md:mx-0 md:text-[15px]">
            Twelve gates. One trail. Follow the map — each seal opens only when the last is
            cleared.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 md:mt-10"
        >
          <ArcsTrailMap arcs={arcs} />
        </motion.div>
      </div>
    </div>
  )
}
