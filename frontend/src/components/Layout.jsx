import { Outlet, useLocation } from 'react-router-dom'
import { SiteNav } from './home/SiteNav'
import Footer from './Footer'

/** Shared chrome for all shop pages — same nav language as the home hero. */
export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F2] text-neutral-900">
      {!isHome && <SiteNav tone="light" overlay={false} />}
      <main className={isHome ? 'flex-1 w-full' : 'flex-1 w-full pt-[72px] md:pt-[80px]'}>
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </div>
  )
}
