


import { Routes, Route,Navigate  } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { useEffect } from 'react'
import AdminHeroBanners from './pages/admin/AdminHeroBanners'
import HomePage from './pages/HomePage'
import LorePage from './pages/LorePage'
import useAuthStore from './store/authStore'
import useCartStore from './store/cartStore'
import useWishlistStore from './store/wishlistStore'

// Pages
import Home          from './pages/Home'
import ProductList   from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import OrderSuccess  from './pages/OrderSuccess'
import OrderHistory  from './pages/OrderHistory'
import OrderDetail   from './pages/OrderDetail'
import Login         from './pages/Login'
import Register      from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile       from './pages/Profile'
import SearchResults from './pages/SearchResults'
import NotFound      from './pages/NotFound'
import Addresses     from './pages/Addresses' 
import Wishlist      from './pages/Wishlist'  

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts  from './pages/admin/Products'
import AdminOrders    from './pages/admin/Orders'
import AdminUsers     from './pages/admin/Users'
import QROffers from './pages/admin/QROffers'
import TreasureHunt from './pages/TreasureHunt'
import QRScanner from './pages/QRScanner'
import MyMaps from './pages/MyMaps'
import HuntLocations from './pages/admin/HuntLocations'


// ===== NEW: TRANSFINITY WORLD MAP =====
import WorldMap from './components/WorldMap/WorldMap'
// import CouponQRScanner from './pages/QRScanner'
import HuntQRCodes from './pages/admin/HuntQRCodes'
// Support pages
import SupportPage from './pages/SupportPage'
import ContactPage from './pages/ContactPage'
import ReturnsPage from './pages/ReturnsPage'
import ShippingPage from './pages/ShippingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import CookiesPage from './pages/CookiesPage'
import RefundsPage from './pages/RefundsPage'
import ArcDetail from './components/WorldMap/ArcDetail'
import Arcs from './pages/Arc'

import Intro from './pages/Intro'


import Wanderer from './pages/Arcs/Wanderer'
import Founderer from './pages/Arcs/Founderer'
// import Phantom from './pages/arcs/Phantom'
// import Ascension from './pages/arcs/Ascension'
// import Rebirth from './pages/arcs/Rebirth'
// import EclipseSun from './pages/arcs/EclipseSun'
// import Crimson from './pages/arcs/Crimson'
// import Void from './pages/arcs/Void'
// import ZenithCourt from './pages/arcs/ZenithCourt'
// import Cosmic from './pages/arcs/Cosmic'
// import ShadowWar from './pages/arcs/ShadowWar'
// import Celestial from './pages/arcs/Celestial'
export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchCart       = useCartStore((s) => s.fetchCart)
  const fetchWishlist   = useWishlistStore((s) => s.fetchWishlist)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
      fetchWishlist()
    }
  }, [isAuthenticated])

  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
      <Route path="/" element={<Intro />} />
        <Route path="/home"                   element={<Home />} />
        <Route path="/products"           element={<ProductList />} />
        <Route path="/products/:slug"     element={<ProductDetail />} />
        <Route path="/search"             element={<SearchResults />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<Register />} />
        <Route path="/forgot-password"    element={<ForgotPassword />} />

        <Route path="/homepage" element={<HomePage />} />
        <Route path="/lore/:arcName" element={<LorePage />} />
        <Route path="/arc/:arcKey/detail" element={<ArcDetail />} />
        <Route path="/arcs/wanderer" element={<Wanderer />} />
        {/* ===== NEW: WORLD MAP ROUTES ===== */}
        <Route path="/map" element={<WorldMap />} />
        
        
        
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart"             element={<Cart />} />
          <Route path="/checkout"         element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          
          <Route path="/profile"          element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses"        element={<Addresses />} />     
          <Route path="/hunt/start" element={<Navigate to="/scan" replace />} />
          <Route path="/orders"           element={<OrderHistory />} />
          <Route path="/orders/:id"       element={<OrderDetail />} />
          <Route path="/admin/hunt/qr-codes" element={<HuntQRCodes />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/products"     element={<AdminProducts />} />
        <Route path="/admin/orders"       element={<AdminOrders />} />
        <Route path="/admin/users"        element={<AdminUsers />} />
        <Route path="/admin/hero-banners" element={<AdminHeroBanners />} />
        <Route path="/admin/qr-offers"    element={<QROffers />} />
        <Route path="/admin/hunt/locations" element={<HuntLocations />} />
        
      </Route>

      {/* Support Pages */}
      <Route path="/support" element={<SupportPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/returns" element={<ReturnsPage />} />
      <Route path="/shipping" element={<ShippingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/refunds" element={<RefundsPage />} />

      {/* Old Treasure Hunt (keep for backward compatibility) */}
     
     <Route path="/hunt/scanner" element={<QRScanner />} />
<Route path="/scan" element={<QRScanner />} />
<Route path="scan/:qrCodeId" element={<QRScanner />} />  
      <Route path="/treasure-hunt"      element={<TreasureHunt />} />
     
      <Route path="/hunt" element={<TreasureHunt />} />
      

      <Route path="/hunt/dashboard" element={<TreasureHunt />} />
      <Route path="/hunt/map" element={<MyMaps />} />
      <Route path="/arcs" element={<Arcs />} />

      <Route path="*"                   element={<NotFound />} />




      <Route path="/arcs/wanderer" element={<Wanderer />} />
      {/* <Route path="/arcs/founderer" element={<Founderer />} />
      <Route path="/arcs/phantom" element={<Phantom />} />
      <Route path="/arcs/ascension" element={<Ascension />} />
      <Route path="/arcs/rebirth" element={<Rebirth />} />
      <Route path="/arcs/eclipse-sun" element={<EclipseSun />} />
      <Route path="/arcs/crimson" element={<Crimson />} />
      <Route path="/arcs/void" element={<Void />} />
      <Route path="/arcs/zenith-court" element={<ZenithCourt />} />
      <Route path="/arcs/cosmic" element={<Cosmic />} />
      <Route path="/arcs/shadow-war" element={<ShadowWar />} />
      <Route path="/arcs/celestial" element={<Celestial />} /> */}
    </Routes>
  )
}