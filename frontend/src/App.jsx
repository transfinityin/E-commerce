import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { useEffect } from 'react'
import AdminHeroBanners from './pages/admin/AdminHeroBanners'

import useAuthStore from './store/authStore'
import useCartStore from './store/cartStore'
import useWishlistStore from './store/wishlistStore'

// Pages
import Home          from './pages/Home'
import ProductList   from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
// Wishlist separate page remove — profile tab-la render aagum
import Checkout      from './pages/Checkout'
import OrderSuccess  from './pages/OrderSuccess'
// OrderHistory, OrderDetail separate pages — but profile tab-la kooda render aagum
import OrderHistory  from './pages/OrderHistory'
import OrderDetail   from './pages/OrderDetail'
import Login         from './pages/Login'
import Register      from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile       from './pages/Profile'
// Addresses separate page remove — profile tab-la render aagum
import SearchResults from './pages/SearchResults'
import NotFound      from './pages/NotFound'
import Addresses     from './pages/Addresses'  // ✅ Add back
import Wishlist      from './pages/Wishlist'  // ✅ Add back

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts  from './pages/admin/Products'
import AdminOrders    from './pages/admin/Orders'
import AdminUsers     from './pages/admin/Users'

import QROffers from './pages/admin/QROffers'
import TreasureHunt from './pages/TreasureHunt'
import QRScanner from './pages/QRScanner'

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
        <Route path="/"                   element={<Home />} />
        <Route path="/products"           element={<ProductList />} />
        <Route path="/products/:slug"     element={<ProductDetail />} />
        <Route path="/search"             element={<SearchResults />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<Register />} />
        <Route path="/forgot-password"    element={<ForgotPassword />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart"             element={<Cart />} />
          <Route path="/checkout"         element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          
          {/* Profile with tabs — single route only */}
          <Route path="/profile"          element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses"        element={<Addresses />} />      // ✅ Add back

          
          {/* Keep separate pages for direct access from other places (optional) */}
          <Route path="/orders"           element={<OrderHistory />} />
          <Route path="/orders/:id"       element={<OrderDetail />} />
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
      </Route>

      <Route path="/scan"               element={<QRScanner />} />
      <Route path="/scan/:qrCodeId"     element={<QRScanner />} />
      <Route path="/treasure-hunt"      element={<TreasureHunt />} />
      <Route path="*"                   element={<NotFound />} />
    </Routes>
  )
}