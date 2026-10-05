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

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-sans text-2xl font-semibold tracking-wide text-neutral-900">{n}</p>
      <p className="mt-1 text-[10px] tracking-[0.22em] text-neutral-500 uppercase">{label}</p>
    </div>
  )
}

export default function Founder() {
  return (
    <div className="min-h-screen bg-[#F4F4F2] pb-24 text-neutral-900">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 pt-10 md:px-8 md:pt-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div className="absolute -inset-3 translate-x-2 translate-y-2 border border-neutral-300 sm:-inset-4 sm:translate-x-3 sm:translate-y-3" />
          <img
            src={KAIROS_IMAGE}
            alt="Kairos, the masked founder of TRANSFINITY"
            className="relative aspect-[4/5] w-full border border-neutral-200 object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 border border-neutral-200 bg-white/90 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
            <div className="size-2 animate-pulse rounded-full bg-neutral-900" />
            <span className="text-[10px] tracking-[0.35em] text-neutral-700 uppercase">
              Identity withheld
            </span>
          </div>
        </div>

        <div>
          <p className="mb-4 text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
            The Architect
          </p>
          <h1 className="mb-6 font-sans text-5xl font-semibold tracking-[0.04em] text-neutral-900 uppercase sm:text-6xl">
            Kairos
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-neutral-600 italic md:text-2xl">
            “Time is not a line. It is a loop. We are the architects of the break.”
          </p>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Kairos exists between recorded moments. The masked architect of TRANSFINITY
            designs each garment as a relic — equipment for the wanderer who refuses to be
            located.
          </p>
          <div className="grid grid-cols-3 gap-5 sm:flex sm:gap-12">
            <Stat n="∞" label="Arcs witnessed" />
            <Stat n="12" label="Stories sealed" />
            <Stat n="1" label="Signal" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1200px] px-5 md:px-8">
        <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
          Timeline
        </p>
        <h2 className="mt-3 font-sans text-2xl font-semibold tracking-[0.04em] text-neutral-900 uppercase">
          From signal to drop
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {TIMELINE.map((item) => (
            <article
              key={item.year}
              className="border border-neutral-200 bg-white p-6"
            >
              <p className="text-[10px] tracking-[0.28em] text-neutral-500 uppercase">
                {item.year}
              </p>
              <h3 className="mt-2 font-sans text-lg font-semibold tracking-wide text-neutral-900 uppercase">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
