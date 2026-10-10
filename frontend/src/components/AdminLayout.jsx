import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { ADMIN_NAV_LINKS } from '@/lib/admin'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#F4F4F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase transition hover:text-neutral-900"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Store</span>
            </Link>
            <span className="hidden h-4 w-px bg-neutral-300 sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <Shield className="size-3.5 shrink-0 text-neutral-900" strokeWidth={1.75} />
              <p className="truncate text-[11px] font-semibold tracking-[0.22em] uppercase">
                Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden max-w-[160px] truncate text-[11px] tracking-[0.14em] text-neutral-500 uppercase sm:block">
              {user?.name || user?.email}
            </p>
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase shadow-[0_6px_18px_rgba(17,17,17,0.05)] ring-1 ring-black/6 transition hover:text-neutral-950"
            >
              <LogOut className="size-3.5" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:px-8">
          {ADMIN_NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/admin'}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase transition',
                  isActive
                    ? 'bg-neutral-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]'
                    : 'bg-white/80 text-neutral-500 ring-1 ring-black/5 hover:text-neutral-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}
