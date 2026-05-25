import { InfinityMark } from '../components/InfinityMark'
import Navbar from '../components/Navbar'
const KAIROS_IMAGE = '/kairos.jpg'

const TIMELINE = [
  {
    year: '2099',
    title: 'First Signal',
    body: 'Kairos transmits the first manifesto from an unknown coordinate.',
  },
  {
    year: '2101',
    title: 'Arc Zero',
    body: 'The infinity glyph is etched into a single black garment.',
  },
  {
    year: '2102',
    title: 'Wanderer Arc',
    body: 'The first ten units leave the studio.',
  },
  {
    year: '2104',
    title: 'Transfinity',
    body: 'The world opens. Twelve arcs are revealed.',
  },
]

export default function Founder() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white pt-[96px] sm:pt-[110px] lg:pt-[120px] pb-24">
      <Navbar />
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.10),transparent_28%),linear-gradient(180deg,#050505_0%,#000_100%)]" />

      <div className="fixed inset-0 z-[1] pointer-events-none shadow-[inset_0_0_160px_rgba(0,0,0,0.95)]" />

      <div className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 md:px-10 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 translate-x-3 translate-y-3 border border-gold/15 sm:-inset-6 sm:translate-x-4 sm:translate-y-4" />

            <img
              src={KAIROS_IMAGE}
              alt="Kairos, the masked founder of TRANSFINITY"
              className="relative aspect-[4/5] w-full object-cover border border-gold/10"
            />

            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 border border-gold/15 bg-black/55 p-4 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
              <div className="size-2 rounded-full bg-gold animate-pulse" />

              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold">
                Identity Withheld
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-gold">
              The Architect
            </p>

            <h1 className="mb-6 font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white">
              Kairos
            </h1>

            <p className="mb-8 font-serif text-xl italic leading-relaxed text-white/70 md:text-2xl">
              “Time is not a line. It is a loop. We are the architects of the break.”
            </p>

            <p className="mb-8 max-w-xl text-sm sm:text-base leading-relaxed tracking-wide text-white/55">
              Kairos exists between recorded moments. The masked architect of TRANSFINITY
              designs each garment as a relic — a piece of equipment for the wanderer who
              refuses to be located.
            </p>

            <div className="grid grid-cols-3 gap-5 sm:flex sm:gap-12">
              <Stat n="∞" label="Arcs Witnessed" />
              <Stat n="12" label="Arcs Designed" />
              <Stat n="2099" label="First Signal" />
            </div>
          </div>
        </section>

        {/* Evolution timeline */}
        <section className="mx-auto mt-24 max-w-5xl px-4 sm:px-6 md:px-10 lg:mt-32">
          <div className="mb-12 flex items-center gap-5 sm:mb-16 sm:gap-6">
            <InfinityMark className="size-8 text-gold" />

            <h2 className="font-serif text-2xl tracking-[0.2em] text-white md:text-3xl">
              EVOLUTION
            </h2>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="relative space-y-10 sm:space-y-12">
            <div className="absolute left-10 top-2 bottom-2 w-px bg-gradient-to-b from-gold via-gold/30 to-transparent sm:left-12" />

            {TIMELINE.map((item) => (
              <div key={item.year} className="relative flex items-start gap-5 sm:gap-8">
                <div className="grid size-20 shrink-0 place-items-center border border-gold/40 bg-black font-serif text-base text-gold sm:size-24 sm:text-lg">
                  {item.year}
                </div>

                <div className="pt-4 sm:pt-6">
                  <h3 className="mb-2 font-serif text-lg text-white sm:text-xl">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-white/55">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hidden message */}
        <section className="mx-auto mt-24 max-w-3xl px-4 text-center sm:px-6 md:px-10 lg:mt-32">
          <div className="relative border border-gold/15 bg-black/45 p-8 backdrop-blur-md sm:p-10 md:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.14),transparent_58%)]" />

            <div className="relative z-10 mb-4 font-mono text-[10px] uppercase tracking-[0.45em] text-gold">
              ◇ Encrypted Transmission ◇
            </div>

            <p className="relative z-10 font-serif text-lg italic leading-relaxed text-white/80 md:text-2xl">
              “If you can read this, you have already crossed. The next arc opens when you
              stop counting.”
            </p>

            <div className="relative z-10 mt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
              — K.
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
type StatProps = {
  n: string
  label: string
}
function Stat({ n, label }: StatProps) {
  return (
    <div>
      <div className="font-serif text-3xl text-gold">{n}</div>

      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </div>
    </div>
  )
}