import { Link } from 'react-router-dom'

const INTRO_BG_IMAGE = '/hero-city.jpg'
// public folder la unga background image name enna irukko adha change pannunga
// example: /transfinity-city.png, /home-bg.jpg

export default function Intro() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${INTRO_BG_IMAGE})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.92)_100%),linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.2)_45%,rgba(0,0,0,0.88)_100%)]" />

      {/* Soft Grid / Luxury Fade */}
      <div className="absolute inset-0 z-[2] pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.95)]" />

      {/* Content */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-24 pb-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 font-mono text-[10px] sm:text-xs uppercase tracking-[0.55em] text-gold">
            Phase 01 · Wanderer Arc
          </p>

          <h1 className="font-serif text-[54px] sm:text-[82px] md:text-[110px] lg:text-[140px] font-normal uppercase leading-none tracking-[0.04em] text-white">
            Trans<span className="text-gold">finity</span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed tracking-[0.12em] text-white/60">
            Beyond the veil of the physical, the Wanderer Arc begins. Luxury
            technical garments for the multi-dimensional soul.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/home"
              className="inline-flex h-14 min-w-[220px] items-center justify-center border border-gold bg-gold px-8 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gold/90 hover:shadow-[0_0_35px_rgba(212,175,55,0.28)]"
            >
              Enter The Arc
            </Link>

            <Link
              to="/arcs"
              className="inline-flex h-14 min-w-[220px] items-center justify-center border border-white/15 bg-black/25 px-8 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:text-gold"
            >
              View Archives
            </Link>
          </div>

          <div className="mt-20 hidden flex-col items-center gap-3 sm:flex">
            <div className="h-12 w-px bg-gold/30" />
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-gold/70">
              Scroll
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}