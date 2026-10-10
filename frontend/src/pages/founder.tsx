import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const FOUNDER_IMAGE = '/founder/1.png?v=1'

const ACTS = [
  {
    act: '01',
    title: 'The Cage',
    beat: 'Cold open',
    body: 'Not a sky — a ceiling. In the Lower Ring, a boy with a nascent Scar is silenced. From the alley, Veyn watches. He does not move. He has not spoken in years.',
  },
  {
    act: '02',
    title: 'The Corpse Market',
    beat: 'Act one',
    body: 'Memories sold in glass vials. Veyn trades a gear etched ∞ for a map of living skin. Then the Hollow Men name him: Rogue Scar. To be unmade.',
  },
  {
    act: '03',
    title: 'The Scarscape',
    beat: 'Act two',
    body: 'Time freezes. The Ouroboros turns — infinite, hungry. A photograph burns. When reality resumes, Hollow Men unravel into dust. Golden blood. Scar-born.',
  },
  {
    act: '04',
    title: 'The Dead Zones',
    beat: 'Act three',
    body: 'He writes: TODAY I FORGOT HER FACE. AGAIN. Isolde Karr finds him — silver eyes, humming scalpel. She offers the boy’s trail, and a door only Scar-born can open.',
  },
  {
    act: '05',
    title: 'The Archivist',
    beat: 'Act four',
    body: 'Ozias Vane watches from a throne of screaming books. His mask mirrors Veyn’s face. Five hundred years of silence. He needs the boy to reach the door.',
  },
  {
    act: '06',
    title: 'The Gate',
    beat: 'Final',
    body: 'Scar-locks scream open. A crack remains — small, real. The false sun flickers. Ozias smiles: the Ouroboros wakes. The Cage begins to dream.',
  },
]

const FIGURES = [
  {
    name: 'Veyn Sollis',
    role: 'The Silent Man',
    line: 'Ash-eyed. Mute. Infinity wearing a stolen uniform.',
  },
  {
    name: 'Isolde Karr',
    role: 'Silver Scar',
    line: 'Clinical. Surgical. She needs his hand on the door.',
  },
  {
    name: 'Ozias Vane',
    role: 'The Archivist',
    line: 'Five centuries masked. The Cage’s echo — and Veyn’s.',
  },
]

export default function Founder() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="tf-founder-page min-h-screen overflow-hidden bg-[#EFEFEF] pb-20 text-neutral-900">
      <section className="relative mx-auto max-w-[1100px] px-4 pt-4 sm:px-6 sm:pt-5 md:px-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 sm:mb-7">
          <Link to="/" className="transition-colors hover:text-neutral-700">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-neutral-700">Founder</span>
        </nav>

        <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none"
          >
            <div className="tf-founder-glow pointer-events-none absolute -inset-6 sm:-inset-10" aria-hidden />
            <div className="tf-founder-frame relative overflow-hidden">
              <img
                src={FOUNDER_IMAGE}
                alt="Veyn Sollis — The Silent Man"
                className="aspect-square w-full object-cover object-center"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <span className="rounded-full bg-black/35 px-2.5 py-1 text-[8px] font-semibold tracking-[0.22em] text-white uppercase backdrop-blur-md ring-1 ring-white/20">
                  Ep. 01
                </span>
              </div>
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                <p className="text-[8px] font-medium tracking-[0.28em] text-white/65 uppercase">
                  Rogue Scar · Ouroboros
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[9px] font-medium tracking-[0.32em] text-neutral-500 uppercase">
              Re : Birth · Episode 1
            </p>
            <h1 className="mt-2 font-sans text-[clamp(1.55rem,3.2vw,2.15rem)] font-semibold uppercase leading-[1.1] tracking-[0.06em] text-neutral-950">
              The Silent Man
            </h1>
            <p className="mt-1.5 text-[11px] font-semibold tracking-[0.24em] text-neutral-500 uppercase">
              Veyn Sollis
            </p>

            <p className="mt-5 max-w-[34rem] text-[13px] leading-[1.7] text-neutral-600">
              He watches. He does not speak. When the Ouroboros ignites, Hollow Men
              unravel — and a crack appears in the Cage that was never meant to hold infinity.
            </p>

            <p className="mt-4 max-w-[32rem] border-l border-neutral-300 pl-3.5 text-[12px] leading-relaxed text-neutral-500 italic">
              “The boy dies in all futures but one. Show me you remember the price.”
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link to="/arcs" className="tf-join !h-9 !min-w-[7.5rem] !text-[9px]">
                <span>Enter the arcs</span>
              </Link>
              <Link to="/products" className="tf-sign-in !h-9 !min-w-[7.5rem] !text-[9px]">
                Shop the drop
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hologram whisper — not a giant quote block */}
      <section className="relative mx-auto mt-12 max-w-[720px] px-4 sm:mt-16 sm:px-6 md:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6 }}
          className="tf-hologram"
        >
          <div className="tf-hologram__scan" aria-hidden />
          <div className="tf-hologram__inner">
            <p className="text-[8px] font-semibold tracking-[0.34em] text-neutral-400 uppercase">
              Upper Ring · broadcast
            </p>
            <p className="tf-hologram__line mt-3">
              <span>The Cage is eternal.</span>
              <span className="tf-hologram__sep" aria-hidden>
                ·
              </span>
              <span>The Cage is enough.</span>
            </p>
            <p className="mt-2.5 text-[9px] tracking-[0.18em] text-neutral-400 uppercase">
              Whispered between white towers
            </p>
          </div>
        </motion.div>
      </section>

      {/* Acts */}
      <section className="mx-auto mt-14 max-w-[680px] px-4 sm:mt-18 sm:px-6 md:px-8">
        <div className="mb-6 flex items-baseline justify-between gap-3 border-b border-neutral-300/60 pb-3">
          <div>
            <p className="text-[9px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
              Story path
            </p>
            <h2 className="mt-1 font-sans text-[15px] font-semibold tracking-[0.12em] uppercase text-neutral-950 sm:text-base">
              How the silence breaks
            </h2>
          </div>
          <p className="text-[9px] tracking-[0.16em] text-neutral-400 uppercase">06</p>
        </div>

        <ol className="space-y-0">
          {ACTS.map((a, i) => (
            <motion.li
              key={a.act}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.15) }}
              className="group grid grid-cols-[2.5rem_1fr] gap-3 border-b border-neutral-200/80 py-4 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:gap-4"
            >
              <span className="pt-0.5 font-sans text-[11px] font-bold tracking-[0.14em] text-neutral-300 transition-colors group-hover:text-neutral-900">
                {a.act}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <h3 className="font-sans text-[13px] font-semibold tracking-[0.1em] text-neutral-950 uppercase">
                    {a.title}
                  </h3>
                  <span className="text-[8px] tracking-[0.2em] text-neutral-400 uppercase">
                    {a.beat}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-[1.65] text-neutral-600">
                  {a.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Figures — compact */}
      <section className="mx-auto mt-12 max-w-[900px] px-4 sm:mt-16 sm:px-6 md:px-8">
        <p className="text-center text-[9px] font-medium tracking-[0.28em] text-neutral-500 uppercase">
          Cast
        </p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-neutral-200/70 sm:grid-cols-3">
          {FIGURES.map((f) => (
            <article
              key={f.name}
              className="bg-[#EFEFEF] px-5 py-5 transition-colors hover:bg-white sm:px-6 sm:py-6"
            >
              <p className="text-[8px] font-semibold tracking-[0.24em] text-neutral-500 uppercase">
                {f.role}
              </p>
              <h3 className="mt-1.5 font-sans text-[13px] font-semibold tracking-[0.1em] text-neutral-950 uppercase">
                {f.name}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">{f.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Close */}
      <section className="relative mx-auto mt-14 max-w-[560px] px-4 text-center sm:mt-20 sm:px-6">
        <div className="tf-founder-close-glow pointer-events-none absolute inset-x-6 -top-8 h-28" aria-hidden />
        <p className="relative text-[9px] font-medium tracking-[0.3em] text-neutral-500 uppercase">
          End · Episode 1
        </p>
        <p className="relative mx-auto mt-3 max-w-sm text-[14px] leading-snug font-medium tracking-[0.02em] text-neutral-800">
          Welcome home, Veyn.
          <span className="mx-1.5 text-neutral-300">·</span>
          Welcome to the end of yourself.
        </p>
        <p className="relative mt-2 text-[9px] tracking-[0.2em] text-neutral-400 uppercase">
          Ozias Vane
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link to="/arcs" className="tf-join !h-9 !min-w-0 !px-5 !text-[9px]">
            <span>Walk the gates</span>
          </Link>
          <Link
            to="/products/ascendant"
            className="tf-sign-in !h-9 !min-w-0 !px-5 !text-[9px]"
          >
            Wear the silent man
          </Link>
        </div>
      </section>
    </div>
  )
}
