// src/components/Layout.jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />  {/* Pages render here */}
      </main>
      <Footer />
    </div>
  )
}