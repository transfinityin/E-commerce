import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Zap, QrCode } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--color-bg)]/96 backdrop-blur-xl border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]' 
          : 'bg-[var(--color-bg)] border-b border-transparent'
      }`}>
        {/* Top strip */}
        <div className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] text-center font-medium text-xs tracking-widest py-2 px-4">
          ✦ Free shipping on orders above ₹999 &nbsp;|&nbsp; Easy 7-day returns ✦
        </div>

        {/* Main nav */}
        <div className="flex items-center mx-auto max-w-[1400px] px-6 h-[68px] gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline shrink-0">
            <div className="flex flex-col gap-1 leading-tight">
              <img
                src="/logosign1.png"
                alt="Transfinity Sign"
                className="h-12 w-auto object-contain self-start"
              />
              <span className="text-[6px] font-semibold text-[var(--color-muted)] tracking-[0.2em] uppercase">
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

          {/* Scan QR Link */}
          <Link 
            to="/scan" 
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] no-underline rounded-full transition-all duration-200 px-4 py-2 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
          >
            <QrCode size={16} className="text-[var(--color-primary)]" />
            Scan QR
          </Link>

          {/* Right icons */}
          <div className="flex items-center ml-auto gap-1">

            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-full flex items-center justify-center text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="w-10 h-10 flex items-center justify-center text-[var(--color-muted)] rounded-full transition-all duration-200 no-underline hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="w-10 h-10 flex items-center justify-center text-[var(--color-muted)] rounded-full transition-all duration-200 no-underline relative hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className={`flex items-center cursor-pointer rounded-full transition-all duration-200 gap-2 pl-1.5 pr-3 py-1.5 ${
                    profileOpen 
                      ? 'bg-[var(--color-bg-alt)] border border-[var(--color-border)]' 
                      : 'bg-transparent border border-transparent hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-border)]'
                  }`}
                >
                  <div className="w-7 h-7 bg-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-text)]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[var(--color-muted)] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-lg)] min-w-[200px] overflow-hidden z-[200] animate-slideDown">
                    <div className="border-b border-[var(--color-border)] p-4">
                      <p className="text-[13px] font-semibold text-[var(--color-text)]">{user?.name}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{user?.email}</p>
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
                          className="block text-[13px] text-[var(--color-muted)] no-underline rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] py-2.5 px-3"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileOpen(false)} 
                          className="block text-[13px] text-[var(--color-primary)] font-semibold no-underline rounded-lg transition-all duration-150 hover:bg-[var(--color-primary-light)] py-2.5 px-3"
                        >
                          <span className="flex items-center gap-1.5">
                            <Zap size={14} />
                            Admin Panel
                          </span>
                        </Link>
                      )}
                      <hr className="border-none border-t border-[var(--color-border)] my-1" />
                      <button 
                        onClick={() => { logout(); setProfileOpen(false) }} 
                        className="w-full text-left bg-transparent border-none text-[13px] text-[var(--color-danger)] cursor-pointer rounded-lg transition-all duration-150 hover:bg-[var(--color-danger-bg)] py-2.5 px-3"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link 
                  to="/login" 
                  className="text-[13px] font-medium text-[var(--color-text)] no-underline rounded-full transition-all duration-200 hover:bg-[var(--color-bg-alt)] px-4 py-2"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="text-[13px] font-medium text-[var(--color-text-inverse)] no-underline bg-[var(--color-secondary)] rounded-full transition-all duration-200 hover:bg-[var(--color-secondary-light)] px-4 py-2"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden w-10 h-10 border-none bg-transparent cursor-pointer rounded-full items-center justify-center text-[var(--color-text)] flex"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 animate-slideDown">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className="block text-[15px] font-medium text-[var(--color-text)] no-underline rounded-xl transition-colors duration-150 hover:bg-[var(--color-bg-alt)] py-3.5 px-4"
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to="/scan" 
              className="flex items-center gap-2 text-[15px] font-medium text-[var(--color-text)] no-underline rounded-xl transition-colors duration-150 hover:bg-[var(--color-bg-alt)] py-3.5 px-4"
            >
              <QrCode size={18} className="text-[var(--color-primary)]" />
              Scan QR
            </Link>
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-[var(--color-secondary)]/60 backdrop-blur-lg flex items-start justify-center pt-[120px] animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="w-full max-w-[640px] mx-4 animate-fadeUp">
            <form 
              onSubmit={handleSearch} 
              className="flex bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-[28px] shadow-[var(--shadow-lg)] gap-3 py-2 pl-5 pr-2"
            >
              <Search size={20} className="text-[var(--color-muted)] shrink-0 self-center" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 border-none outline-none text-base bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted-light)]"
              />
              <button 
                type="submit" 
                className="bg-[var(--color-secondary)] text-[var(--color-text-inverse)] border-none rounded-[20px] text-sm font-semibold cursor-pointer shrink-0 transition-all duration-200 hover:bg-[var(--color-secondary-light)] px-6 py-2.5"
              >
                Search
              </button>
            </form>
            <p className="text-white/60 text-[13px] text-center mt-4">
              Press <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-[11px]">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-[68px]" />
      <div className="bg-[var(--color-secondary)] h-8" />
    </>
  )
}