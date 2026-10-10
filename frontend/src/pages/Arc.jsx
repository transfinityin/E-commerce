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

function useMotes(count = 36) {
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
        size: i % 9 === 0 ? 3.5 : i % 4 === 0 ? 2.2 : 1.1,
        delay: `${(u * 7).toFixed(2)}s`,
        dur: `${5 + v * 7}s`,
        opacity: 0.1 + u * 0.28,
        blur: i % 5 === 0,
      })
    }
    return dots
  }, [count])
}

export default function Arcs() {
  const { progress, fetchProgress } = useHuntStore()
  const motes = useMotes(40)
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
    <div className="tf-arcs-page relative min-h-screen overflow-hidden pb-24 text-neutral-900">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#F4F4F2]" />
        <div className="tf-arcs-mist absolute inset-0" />
        <div className="tf-arcs-grain absolute inset-0" />
        <div className="tf-arcs-orbit absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2" />
        <div className="tf-arcs-orbit tf-arcs-orbit--lag absolute top-[38%] -right-32 h-[320px] w-[320px]" />
        <div className="tf-arcs-orbit tf-arcs-orbit--soft absolute bottom-0 left-[-10%] h-[280px] w-[480px]" />

        {motes.map((d) => (
          <span
            key={d.id}
            className={`tf-arcs-dust absolute rounded-full ${d.blur ? 'bg-neutral-800/40' : 'bg-neutral-900'}`}
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              animationDelay: d.delay,
              animationDuration: d.dur,
              filter: d.blur ? 'blur(1px)' : undefined,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[920px] px-5 pt-6 sm:px-8 sm:pt-8 md:pt-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="tf-arcs-rule h-px w-10 bg-neutral-400/70" />
            <p className="text-[10px] font-medium tracking-[0.42em] text-neutral-500 uppercase">
              The whole story
            </p>
            <span className="tf-arcs-rule h-px w-10 bg-neutral-400/70" />
          </div>

          <h1 className="tf-rebirth-title select-none font-sans font-bold uppercase leading-[0.92] tracking-[0.08em]">
            RE&nbsp;:&nbsp;BIRTH
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[13px] leading-relaxed text-neutral-600 sm:text-sm">
            Twelve sealed gates on one inked trail. Clear a seal — the next path opens.
          </p>
        </motion.header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 md:mt-12"
        >
          <ArcsTrailMap arcs={arcs} />
        </motion.div>
      </div>
    </div>
  )
}
