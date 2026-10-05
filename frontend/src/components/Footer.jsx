import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-[#EFEFEF]">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Link
          to="/"
          className="font-sans text-[13px] font-semibold tracking-[0.28em] text-neutral-900 uppercase"
        >
          Transfinity
        </Link>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-medium tracking-[0.28em] text-neutral-600 uppercase">
          <Link to="/" className="hover:text-neutral-950">Home</Link>
          <Link to="/arcs" className="hover:text-neutral-950">Arcs</Link>
          <Link to="/products" className="hover:text-neutral-950">Shop</Link>
          <Link to="/founder" className="hover:text-neutral-950">Founder</Link>
          <Link to="/scan" className="hover:text-neutral-950">QR Code</Link>
        </nav>
        <p className="text-[9px] tracking-[0.18em] text-neutral-400 uppercase">
          © 2026 Transfinity. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
