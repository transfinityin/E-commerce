import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import { useEffect } from 'react'

import useAuthStore from './store/authStore'
import useCartStore from './store/cartStore'
import useWishlistStore from './store/wishlistStore'

import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderHistory from './pages/OrderHistory'
import OrderDetail from './pages/OrderDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import Addresses from './pages/Addresses'
import Wishlist from './pages/Wishlist'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import QROffers from './pages/admin/QROffers'
import TreasureHunt from './pages/TreasureHunt'
import QRScanner from './pages/QRScanner'
import MyMaps from './pages/MyMaps'

import SupportPage from './pages/SupportPage'
import ContactPage from './pages/ContactPage'
import ReturnsPage from './pages/ReturnsPage'
import ShippingPage from './pages/ShippingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import CookiesPage from './pages/CookiesPage'
import RefundsPage from './pages/RefundsPage'

import Arcs from './pages/Arc'
import Landing from './pages/Landing'
import Founder from './pages/founder'
import Wanderer from './pages/Arcs/Wanderer'
import Founderer from './pages/Arcs/Founderer'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
      fetchCart()
      fetchWishlist()
    }
  }, [isAuthenticated, refreshUser, fetchCart, fetchWishlist])

  return (
    <Routes>
      {/* Home keeps its own overlay nav inside the scroll hero */}
      <Route path="/" element={<Landing />} />

      {/* Shared SiteNav + Footer chrome — same language as home */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/arcs" element={<Arcs />} />
        <Route path="/arcs/wanderer" element={<Wanderer />} />
        <Route path="/arcs/founderer" element={<Founderer />} />
        <Route path="/founder" element={<Founder />} />

        <Route path="/scan" element={<QRScanner />} />
        <Route path="/scan/:qrCodeId" element={<QRScanner />} />
        <Route path="/hunt/scanner" element={<QRScanner />} />
        <Route path="/treasure-hunt" element={<TreasureHunt />} />
        <Route path="/hunt" element={<TreasureHunt />} />
        <Route path="/hunt/dashboard" element={<TreasureHunt />} />
        <Route path="/hunt/map" element={<MyMaps />} />

        <Route path="/support" element={<SupportPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/refunds" element={<RefundsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/hunt/start" element={<Navigate to="/scan" replace />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/qr-offers" element={<QROffers />} />
        </Route>
      </Route>
    </Routes>
  )
}
