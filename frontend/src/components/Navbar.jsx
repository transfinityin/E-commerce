import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Bell } from 'lucide-react'
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
    // { label: 'New In',    to: '/products?ordering=-created_at' },
    // { label: 'Featured',  to: '/products?is_featured=true' },
    // { label: 'Offers',    to: '/products?sale=true' },
  ]

  const cartCount = cart?.total_items || 0

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-[rgba(250,250,248,0.96)] backdrop-blur-[12px] border-b border-[#E8E4DE] shadow-[0_1px_3px_rgba(13,13,13,0.06)]' 
          : 'bg-[#FAFAF8] border-b border-transparent'
      }`}>
        {/* Top strip */}
        <div className="bg-[#0D0D0D] text-white text-center font-medium" style={{ padding: '8px 16px', fontSize: '12px', letterSpacing: '0.08em' }}>
          ✦ Free shipping on orders above ₹999 &nbsp;|&nbsp; Easy 7-day returns ✦
        </div>

        {/* Main nav */}
        <div className="flex items-center mx-auto" style={{ maxWidth: '1400px', padding: '0 24px', height: '68px', gap: '32px' }}>
          {/* Logo */}
          {/* <Link to="/" className="font-[Playfair_Display] text-[24px] font-bold text-[#0D0D0D] no-underline tracking-tight shrink-0">
            Trans<span className="text-[#C8A96E]">Finity</span>
          </Link> */}

          {/* Logo only — no text */}
<Link to="/" className="flex items-center no-underline shrink-0" style={{ gap: '8px' }}>
  <img
    src="/logo.png"
    alt="Transfinity Logo"
    style={{
      height: '52px',
      width: '52px',
      objectFit: 'contain',
      borderRadius: '4px',
    }}
  />
  <div style={{ lineHeight: 1.1 }}>
    <span style={{
      display: 'block',
      fontFamily: 'Playfair Display, serif',
      fontSize: '20px', fontWeight: 700,
      color: '#0D0D0D', letterSpacing: '-0.01em',
    }}>
      Trans<span style={{ color: '#C8A96E' }}>finity</span>
    </span>
    <span style={{
      display: 'block',
      fontSize: '9px', fontWeight: 600,
      color: '#8A8A8A', letterSpacing: '0.2em',
      textTransform: 'uppercase',
    }}>
      Beyond The Limits
    </span>
  </div>
</Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex flex-1" style={{ gap: '4px' }}>
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`text-sm font-medium no-underline rounded-full transition-all duration-200 ${
                  location.pathname === link.to 
                    ? 'bg-[#F5F2EE] text-[#0D0D0D]' 
                    : 'bg-transparent text-[#3A3A3A] hover:bg-[#F5F2EE] hover:text-[#0D0D0D]'
                }`}
                style={{ padding: '8px 16px' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link to="/scan" className="text-sm font-medium text-[#3A3A3A] no-underline rounded-full transition-all duration-200 hover:bg-[#F5F2EE] hover:text-[#0D0D0D]" style={{ padding: '8px 16px' }}>
            📱 Scan QR
          </Link>

          {/* Right icons */}
          <div className="flex items-center ml-auto" style={{ gap: '4px' }}>

            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-full flex items-center justify-center text-[#3A3A3A] transition-all duration-200 hover:bg-[#F5F2EE] hover:text-[#0D0D0D]"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="w-10 h-10 flex items-center justify-center text-[#3A3A3A] rounded-full transition-all duration-200 no-underline hover:bg-[#F5F2EE] hover:text-[#0D0D0D]"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="w-10 h-10 flex items-center justify-center text-[#3A3A3A] rounded-full transition-all duration-200 no-underline relative hover:bg-[#F5F2EE] hover:text-[#0D0D0D]"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C8A96E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className={`flex items-center cursor-pointer rounded-full transition-all duration-200 ${
                    profileOpen 
                      ? 'bg-[#F5F2EE] border border-[#E8E4DE]' 
                      : 'bg-transparent border border-transparent hover:bg-[#F5F2EE] hover:border-[#E8E4DE]'
                  }`}
                  style={{ gap: '8px', padding: '6px 12px 6px 6px' }}
                >
                  <div className="w-7 h-7 bg-[#0D0D0D] text-white rounded-full flex items-center justify-center text-xs font-bold font-[Playfair_Display]">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-[#0D0D0D]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[#8A8A8A] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {profileOpen && (
                  <div 
                    className="absolute right-0 top-[calc(100%+8px)] bg-white border border-[#E8E4DE] rounded-[20px] shadow-[0_12px_40px_rgba(13,13,13,0.12)] min-w-[200px] overflow-hidden animate-[slideDown_0.2s_ease] z-[200]"
                  >
                    <div className="border-b border-[#E8E4DE]" style={{ padding: '16px' }}>
                      <p className="text-[13px] font-semibold text-[#0D0D0D]">{user?.name}</p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5">{user?.email}</p>
                    </div>
                    <div style={{ padding: '8px' }}>
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
                          className="block text-[13px] text-[#3A3A3A] no-underline rounded-md transition-all duration-150 hover:bg-[#F5F2EE] hover:text-[#0D0D0D]"
                          style={{ padding: '10px 12px' }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileOpen(false)} 
                          className="block text-[13px] text-[#A8873E] font-semibold no-underline rounded-md transition-all duration-150 hover:bg-[#F2E8D5]"
                          style={{ padding: '10px 12px' }}
                        >
                          ⚡ Admin Panel
                        </Link>
                      )}
                      <hr className="border-none border-t border-[#E8E4DE] my-1" />
                      <button 
                        onClick={() => { logout(); setProfileOpen(false) }} 
                        className="w-full text-left bg-transparent border-none text-[13px] text-[#D64545] cursor-pointer rounded-md transition-all duration-150 font-['DM_Sans'] hover:bg-[#FDECEA]"
                        style={{ padding: '10px 12px' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex" style={{ gap: '8px' }}>
                <Link 
                  to="/login" 
                  className="text-[13px] font-medium text-[#0D0D0D] no-underline rounded-full transition-all duration-200 hover:bg-[#F5F2EE]"
                  style={{ padding: '8px 18px' }}
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="text-[13px] font-medium text-white no-underline bg-[#0D0D0D] rounded-full transition-all duration-200 hover:bg-[#3A3A3A]"
                  style={{ padding: '8px 18px' }}
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden w-10 h-10 border-none bg-transparent cursor-pointer rounded-full items-center justify-center text-[#0D0D0D] flex"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="bg-white border-t border-[#E8E4DE] animate-[slideDown_0.2s_ease]" style={{ padding: '16px' }}>
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className="block text-[15px] font-medium text-[#0D0D0D] no-underline rounded-xl transition-colors duration-150 hover:bg-[#F5F2EE]"
                style={{ padding: '14px 16px' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-[rgba(13,13,13,0.6)] backdrop-blur-[8px] flex items-start justify-center animate-[fadeIn_0.2s_ease]"
          style={{ paddingTop: '120px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="w-full animate-[fadeUp_0.25s_ease]" style={{ maxWidth: '640px', margin: '0 16px' }}>
            <form 
              onSubmit={handleSearch} 
              className="flex bg-white border-2 border-[#0D0D0D] rounded-[28px] shadow-[0_24px_60px_rgba(13,13,13,0.16)]"
              style={{ gap: '12px', padding: '8px 8px 8px 20px' }}
            >
              <Search size={20} className="text-[#8A8A8A] shrink-0 self-center" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 border-none outline-none text-base font-['DM_Sans'] bg-transparent text-[#0D0D0D]"
              />
              <button 
                type="submit" 
                className="bg-[#0D0D0D] text-white border-none rounded-[20px] text-sm font-semibold cursor-pointer font-['DM_Sans'] shrink-0 transition-all duration-200 hover:bg-[#3A3A3A]"
                style={{ padding: '10px 24px' }}
              >
                Search
              </button>
            </form>
            <p className="text-[rgba(255,255,255,0.6)] text-[13px] text-center mt-4">
              Press <kbd className="bg-[rgba(255,255,255,0.15)] px-1.5 py-0.5 rounded text-[11px]">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '68px' }} />
      <div className="bg-[#0D0D0D]" style={{ height: '32px' }} />
    </>
  )
}