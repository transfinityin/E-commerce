import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Zap, QrCode } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [hidden,       setHidden]       = useState(false)
  const lastScrollY = useRef(0)
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

      // Scroll down > 80px = hide navbar, scroll up = show
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
    { label: 'HOME',      to: '/' },
    { label: 'ARCS',      to: '/arcs' },
    { label: 'SHOP',      to: '/products' },
    { label: 'FOUNDER',   to: '/founder' },
    { label: 'QR CODE',   to: '/scan' },
  ]

  const cartCount = cart?.total_items || 0

  return (
    <>
      {/* ==================== NAVBAR ==================== */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-body
          ${hidden ? '-translate-y-full' : 'translate-y-0'}
          ${scrolled 
            ? 'bg-black/95 backdrop-blur-xl border-b border-gold/20 shadow-[0_4px_30px_rgba(212,175,55,0.1)]' 
            : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        {/* Top strip - Gold accent line */}
        <div className="bg-gold/10 border-b border-gold/10 text-center py-1 px-4">
          <span className="hidden sm:inline text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-gold/70">
            ✦ Beyond the veil of the physical ✦
          </span>
          <span className="sm:hidden text-[9px] font-mono tracking-[0.2em] uppercase text-gold/60">
            ✦ Beyond the physical ✦
          </span>
        </div>

        {/* Main nav */}
        <div className="flex items-center mx-auto max-w-[1400px] px-3 sm:px-6 md:px-8 h-[56px] sm:h-[64px] md:h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center no-underline shrink-0">
            <div className="flex flex-col gap-0.5 sm:gap-1 leading-tight">
              <img
                src="/logosign1.png"
                alt="Transfinity Sign"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain self-start"
              />
              
              <span className="text-[5px] sm:text-[6px] font-semibold text-[var(--color-muted)] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Beyond The Limits
              </span>
              
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex flex-1 justify-center gap-1 lg:gap-2">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`nav-link text-[11px] lg:text-xs tracking-[0.2em] uppercase py-2 px-3 lg:px-4
                  ${location.pathname === link.to 
                    ? 'text-gold' 
                    : 'text-muted hover:text-gold'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center ml-auto gap-1 sm:gap-2">

            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className="w-9 h-9 sm:w-10 sm:h-10 border border-gold/20 bg-transparent cursor-pointer 
                flex items-center justify-center text-muted transition-all duration-300 
                hover:border-gold/50 hover:text-gold hover:bg-gold/5"
              aria-label="Search"
            >
              <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Wishlist - Hidden on very small mobile */}
            <Link 
              to="/wishlist" 
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center 
                text-muted border border-gold/20 transition-all duration-300 no-underline 
                hover:border-gold/50 hover:text-gold hover:bg-gold/5"
              aria-label="Wishlist"
            >
              <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center 
                text-muted border border-gold/20 transition-all duration-300 no-underline relative 
                hover:border-gold/50 hover:text-gold hover:bg-gold/5"
              aria-label="Cart"
            >
              <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-black text-[9px] sm:text-[10px] 
                  font-bold font-mono w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full 
                  flex items-center justify-center leading-none border border-black">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notification */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className={`flex items-center cursor-pointer transition-all duration-300 gap-2 
                    pl-1.5 pr-3 py-1.5 border
                    ${profileOpen 
                      ? 'bg-gold/10 border-gold/40 text-gold' 
                      : 'bg-transparent border-gold/20 text-muted hover:border-gold/40 hover:text-gold hover:bg-gold/5'
                    }
                  `}
                >
                  <div className="w-7 h-7 bg-gold/20 text-gold border border-gold/30 
                    flex items-center justify-center text-[10px] font-bold font-mono">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-[11px] font-medium text-white tracking-wider max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown 
                    size={12} 
                    className={`hidden lg:block text-muted transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] bg-[#0A0A0A] border border-gold/20 
                    min-w-[200px] overflow-hidden z-[200] animate-slideUp shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
                    {/* Gold accent top */}
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                    <div className="border-b border-gold/10 p-4">
                      <p className="text-[13px] font-semibold text-white tracking-wide truncate font-display">
                        {user?.name}
                      </p>
                      <p className="text-[11px] font-mono text-muted mt-1 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-2">
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
                          className="block text-[12px] text-muted tracking-wider uppercase no-underline 
                            transition-all duration-200 hover:bg-gold/5 hover:text-gold py-2.5 px-3"
                        >
                          {item.label}
                        </Link>
                      ))}

                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileOpen(false)} 
                          className="flex items-center gap-2 text-[12px] text-gold font-semibold 
                            tracking-wider uppercase no-underline transition-all duration-200 
                            hover:bg-gold/10 py-2.5 px-3"
                        >
                          <Zap size={12} />
                          Admin Panel
                        </Link>
                      )}

                      <div className="h-[1px] bg-gold/10 my-2" />

                      <button 
                        onClick={() => { logout(); setProfileOpen(false) }} 
                        className="w-full text-left bg-transparent border-none text-[12px] text-red-400 
                          tracking-wider uppercase cursor-pointer transition-all duration-200 
                          hover:bg-red-400/10 py-2.5 px-3"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link 
                  to="/login" 
                  className="text-[11px] tracking-[0.15em] uppercase font-medium text-muted 
                    no-underline border border-gold/20 transition-all duration-300 
                    hover:border-gold/50 hover:text-gold hover:bg-gold/5 px-4 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="text-[11px] tracking-[0.15em] uppercase font-medium text-black 
                    no-underline bg-gold transition-all duration-300 
                    hover:bg-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] px-4 py-2"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 border border-gold/20 bg-transparent 
                cursor-pointer flex items-center justify-center text-white 
                transition-all duration-300 hover:border-gold/50 hover:text-gold"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {menuOpen && (
          <div className="bg-black/98 border-t border-gold/10 md:hidden animate-slideUp">
            {/* Gold accent line */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="p-4 sm:p-6 space-y-1">
              {navLinks.map((link, index) => (
                <Link 
                  key={link.label} 
                  to={link.to} 
                  onClick={() => setMenuOpen(false)}
                  className={`block font-display text-sm tracking-[0.2em] uppercase no-underline 
                    transition-all duration-300 py-3 px-4 border-l-2
                    ${location.pathname === link.to 
                      ? 'text-gold border-gold bg-gold/5' 
                      : 'text-muted border-transparent hover:text-gold hover:border-gold/30 hover:bg-gold/5'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-[1px] bg-gold/10 my-3" />

              {/* Mobile auth */}
              {!isAuthenticated ? (
                <div className="flex gap-3 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-[11px] tracking-[0.15em] uppercase font-medium 
                      text-muted border border-gold/20 py-3 transition-all duration-300 
                      hover:border-gold/50 hover:text-gold no-underline"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-[11px] tracking-[0.15em] uppercase font-medium 
                      text-black bg-gold py-3 transition-all duration-300 
                      hover:bg-gold-light no-underline"
                  >
                    Join
                  </Link>
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 bg-gold/20 text-gold border border-gold/30 
                      flex items-center justify-center text-sm font-bold font-mono">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-display text-white tracking-wide">{user?.name}</p>
                      <p className="text-[11px] font-mono text-muted">{user?.email}</p>
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
                      onClick={() => setMenuOpen(false)}
                      className="block text-[12px] text-muted tracking-wider uppercase no-underline 
                        transition-all duration-200 hover:text-gold py-2.5 px-4"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-[12px] text-gold font-semibold 
                        tracking-wider uppercase no-underline py-2.5 px-4"
                    >
                      <Zap size={14} />
                      Admin Panel
                    </Link>
                  )}

                  <button 
                    onClick={() => { logout(); setMenuOpen(false) }} 
                    className="w-full text-left bg-transparent border-none text-[12px] text-red-400 
                      tracking-wider uppercase cursor-pointer py-2.5 px-4 mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ==================== SEARCH OVERLAY ==================== */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-start justify-center 
            pt-[100px] sm:pt-[140px] animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="w-full max-w-[700px] mx-4 sm:mx-6 animate-fadeUp">
            {/* Search label */}
            <p className="text-center text-gold/60 text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase mb-4">
              ✦ Search the archives ✦
            </p>

            <form 
              onSubmit={handleSearch} 
              className="flex items-center bg-[#0A0A0A] border border-gold/20 
                shadow-[0_0_40px_rgba(212,175,55,0.1)] gap-3 py-2 px-4 sm:px-6
                focus-within:border-gold/50 focus-within:shadow-[0_0_60px_rgba(212,175,55,0.15)]
                transition-all duration-300"
            >
              <Search size={18} className="text-gold/50 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search artifacts, arcs, relics..."
                className="flex-1 border-none outline-none bg-transparent text-white 
                  placeholder:text-muted/50 text-sm sm:text-base font-body"
              />
              <button 
                type="submit" 
                className="bg-gold text-black border-none text-xs sm:text-sm font-semibold 
                  tracking-wider uppercase cursor-pointer shrink-0 transition-all duration-300 
                  hover:bg-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] px-5 sm:px-6 py-2 sm:py-2.5"
              >
                Search
              </button>
            </form>

            <p className="text-center text-muted/40 text-[10px] sm:text-[11px] font-mono tracking-wider mt-4">
              Press <kbd className="bg-gold/10 text-gold/60 px-2 py-0.5 text-[10px] border border-gold/20">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* Spacer - accounts for top strip + nav */}
      <div className="h-[80px] sm:h-[88px] md:h-[96px]" />
    </>
  )
} 