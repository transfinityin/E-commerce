import { Link } from 'react-router-dom'

export default function Wanderer() {
  return (
    <div className="min-h-screen bg-[#F4F4F2] pb-20 text-neutral-900">
      <div className="mx-auto max-w-[1100px] px-5 pt-10 md:px-8 md:pt-14">
        <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
          Arc 01
        </p>
        <h1 className="mt-3 font-sans text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-[0.04em] uppercase">
          Wanderer
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-600">
          The first threshold. A chapter for those who leave the map behind.
        </p>

        <div className="mt-12 grid gap-4 border border-neutral-200 bg-white p-6 md:p-10">
          <p className="text-sm leading-relaxed text-neutral-700">
            Wanderer opens the Transfinity sequence — oversized silhouettes, quiet details,
            and a signal that only the curious catch.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex h-11 items-center bg-neutral-950 px-6 text-[11px] font-semibold tracking-[0.22em] text-white uppercase"
            >
              Shop the drop
            </Link>
            <Link
              to="/arcs"
              className="inline-flex h-11 items-center border border-neutral-300 px-6 text-[11px] font-semibold tracking-[0.22em] text-neutral-800 uppercase"
            >
              Back to arcs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
