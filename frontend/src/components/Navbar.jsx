import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Zap, QrCode } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [hidden,       setHidden]       = useState(false)      // ADD
  const lastScrollY = useRef(0)                                // ADD
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [profileOpen,  setProfileOpen]  = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const searchRef = useRef()
  const profileRef = useRef()

    useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 20)

      // Keezha scroll + 80px cross aana hide, mela scroll aana show
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setProfileOpen(false)
  }, [location])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ESC key to close search
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    if (searchOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const navLinks = [
    { label: 'Shop',      to: '/products' },
  ]

  const cartCount = cart?.total_items || 0

  // Calculate total navbar height for spacer
  const topStripHeight = 32 // h-8 = 32px
  const navHeight = 68 // h-[68px]

  return (
    <>
       <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
  hidden ? '-translate-y-full' : 'translate-y-0'
} ${
  scrolled 
    ? 'bg-[var(--color-bg)] border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]' 
    : 'bg-[var(--color-bg)] border-b border-transparent'
}`}>
        {/* Top strip - Responsive */}
        <div className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] text-center font-medium text-[10px] sm:text-xs tracking-widest py-1.5 sm:py-2 px-2 sm:px-4 truncate">
          <span className="hidden sm:inline">✦ Free shipping on orders above ₹999 &nbsp;|&nbsp; Easy 7-day returns ✦</span>
          <span className="sm:hidden">✦ Free shipping ₹999+ | 7-day returns ✦</span>
        </div>

        {/* Main nav */}
        <div className="flex items-center mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 h-[60px] sm:h-[64px] md:h-[68px] gap-2 sm:gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline shrink-0">
            <div className="flex flex-col gap-0.5 sm:gap-1 leading-tight">
              <img
                src="/logosign2.png"
                alt="Transfinity Sign"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain self-start"
              />
              
              <span className="text-[5px] sm:text-[6px] font-semibold text-[var(--color-muted)] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Beyond The Limits
              </span>
              
            </div>
          </Link>
          

          {/* Nav links — desktop */}
          <div className="hidden md:flex flex-1 gap-1">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`text-sm font-medium no-underline rounded-full transition-all duration-200 px-4 py-2 ${
                  location.pathname === link.to 
                    ? 'bg-[var(--color-bg-alt)] text-[var(--color-text)]' 
                    : 'bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Scan QR Link - Desktop */}
          <Link 
            to="/scan" 
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] no-underline rounded-full transition-all duration-200 px-4 py-2 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
          >
            <QrCode size={16} className="text-[var(--color-primary)]" />
            Scan QR
          </Link>

          {/* Right icons */}
          <div className="flex items-center ml-auto gap-0.5 sm:gap-1">

            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className="w-9 h-9 sm:w-10 sm:h-10 border-none bg-transparent cursor-pointer rounded-full flex items-center justify-center text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist - Hidden on very small mobile, show on sm+ */}
            <Link 
              to="/wishlist" 
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-[var(--color-muted)] rounded-full transition-all duration-200 no-underline hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <Heart size={18} className="sm:w-5 sm:h-5" />
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[var(--color-muted)] rounded-full transition-all duration-200 no-underline relative hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:top-1 sm:right-1 bg-[var(--color-primary)] text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
 <NotificationBell />
            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative hidden sm:block">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className={`flex items-center cursor-pointer rounded-full transition-all duration-200 gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 sm:py-1.5 ${
                    profileOpen 
                      ? 'bg-[var(--color-bg-alt)] border border-[var(--color-border)]' 
                      : 'bg-transparent border border-transparent hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-border)]'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-[12px] sm:text-[13px] font-medium text-[var(--color-text)] max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown 
                    size={12} 
                    className={`hidden lg:block text-[var(--color-muted)] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-lg)] min-w-[180px] sm:min-w-[200px] overflow-hidden z-[200] animate-slideDown">
                    <div className="border-b border-[var(--color-border)] p-3 sm:p-4">
                      <p className="text-xs sm:text-[13px] font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
                      <p className="text-[11px] sm:text-xs text-[var(--color-muted)] mt-0.5 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5 sm:p-2">
                      {[
                        { label: 'My Profile',   to: '/profile' },
                        { label: 'My Orders',    to: '/orders' },
                        { label: 'Addresses',    to: '/addresses' },
                        { label: 'Wishlist',     to: '/wishlist' },
                      ].map(item => (
                        <Link 
                          key={item.label} 
                          to={item.to} 
                          onClick={() => setProfileOpen(false)} 
                          className="block text-xs sm:text-[13px] text-[var(--color-muted)] no-underline rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] py-2 sm:py-2.5 px-2.5 sm:px-3"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileOpen(false)} 
                          className="block text-xs sm:text-[13px] text-[var(--color-primary)] font-semibold no-underline rounded-lg transition-all duration-150 hover:bg-[var(--color-primary-light)] py-2 sm:py-2.5 px-2.5 sm:px-3"
                        >
                          <span className="flex items-center gap-1.5">
                            <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
                            Admin Panel
                          </span>
                        </Link>
                      )}
                      <hr className="border-none border-t border-[var(--color-border)] my-1" />
                      <button 
                        onClick={() => { logout(); setProfileOpen(false) }} 
                        className="w-full text-left bg-transparent border-none text-xs sm:text-[13px] text-[var(--color-danger)] cursor-pointer rounded-lg transition-all duration-150 hover:bg-[var(--color-danger-bg)] py-2 sm:py-2.5 px-2.5 sm:px-3"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex gap-1 sm:gap-2">
                <Link 
                  to="/login" 
                  className="text-xs sm:text-[13px] font-medium text-[var(--color-text)] no-underline rounded-full transition-all duration-200 hover:bg-[var(--color-bg-alt)] px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="text-xs sm:text-[13px] font-medium text-[var(--color-text-inverse)] no-underline bg-[var(--color-secondary)] rounded-full transition-all duration-200 hover:bg-[var(--color-secondary-light)] px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 border-none bg-transparent cursor-pointer rounded-full items-center justify-center text-[var(--color-text)] flex"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-3 sm:p-4 animate-slideDown md:hidden">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className="block text-sm sm:text-[15px] font-medium text-[var(--color-text)] no-underline rounded-xl transition-colors duration-150 hover:bg-[var(--color-bg-alt)] py-3 sm:py-3.5 px-3 sm:px-4"
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to="/scan" 
              className="flex items-center gap-2 text-sm sm:text-[15px] font-medium text-[var(--color-text)] no-underline rounded-xl transition-colors duration-150 hover:bg-[var(--color-bg-alt)] py-3 sm:py-3.5 px-3 sm:px-4"
            >
              <QrCode size={16} className="text-[var(--color-primary)]" />
              Scan QR
            </Link>
            
            {/* Mobile-only auth links when not authenticated */}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)] sm:hidden">
                <Link 
                  to="/login" 
                  className="flex-1 text-center text-sm font-medium text-[var(--color-text)] no-underline rounded-full border border-[var(--color-border)] py-2.5"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="flex-1 text-center text-sm font-medium text-[var(--color-text-inverse)] no-underline bg-[var(--color-secondary)] rounded-full py-2.5"
                >
                  Join
                </Link>
              </div>
            )}
            
            {/* Mobile-only profile links when authenticated */}
            {isAuthenticated && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] sm:hidden">
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{user?.email}</p>
                  </div>
                </div>
                {[
                  { label: 'My Profile',   to: '/profile' },
                  { label: 'My Orders',    to: '/orders' },
                  { label: 'Addresses',    to: '/addresses' },
                  { label: 'Wishlist',     to: '/wishlist' },
                ].map(item => (
                  <Link 
                    key={item.label} 
                    to={item.to} 
                    className="block text-sm text-[var(--color-muted)] no-underline rounded-lg py-2.5 px-3 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
                  >
                    {item.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold no-underline rounded-lg py-2.5 px-3"
                  >
                    <Zap size={14} />
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); setMenuOpen(false) }} 
                  className="w-full text-left bg-transparent border-none text-sm text-[var(--color-danger)] cursor-pointer rounded-lg py-2.5 px-3 mt-1 hover:bg-[var(--color-danger-bg)]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-[var(--color-secondary)]/60 backdrop-blur-lg flex items-start justify-center pt-[100px] sm:pt-[120px] animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="w-full max-w-[640px] mx-3 sm:mx-4 animate-fadeUp">
            <form 
              onSubmit={handleSearch} 
              className="flex bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-[24px] sm:rounded-[28px] shadow-[var(--shadow-lg)] gap-2 sm:gap-3 py-1.5 sm:py-2 pl-3 sm:pl-5 pr-1.5 sm:pr-2"
            >
              <Search size={18} className="sm:w-5 sm:h-5 text-[var(--color-muted)] shrink-0 self-center" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="flex-1 border-none outline-none text-sm sm:text-base bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted-light)]"
              />
              <button 
                type="submit" 
                className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] border-none rounded-[16px] sm:rounded-[20px] text-xs sm:text-sm font-semibold cursor-pointer shrink-0 transition-all duration-200 hover:bg-[var(--color-secondary-light)] px-4 sm:px-6 py-2 sm:py-2.5"
              >
                Search
              </button>
            </form>
            <p className="text-white/60 text-xs sm:text-[13px] text-center mt-3 sm:mt-4">
              Press <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* Spacer - accounts for top strip + nav */}
      <div className="h-[92px] sm:h-[96px] md:h-[100px]" />
    </>
  )
}