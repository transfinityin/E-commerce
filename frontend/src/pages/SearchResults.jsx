import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { Search } from 'lucide-react'

export default function SearchResults() {
  const [searchParams]          = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(false)
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)

// Normalize: "tshirt" → also try "t shirt", "t-shirt"
  const qNorm = q.replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split

  Promise.all([
    api.get(`/products/search/?q=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
    api.get(`/products/?search=${encodeURIComponent(q)}`).catch(() => ({ data: [] })),
  ]).then(([r1, r2]) => {
    const all = [
      ...(r1.data.results || r1.data || []),
      ...(r2.data.results || r2.data || []),
    ]
    const unique = Array.from(new Map(all.map(p => [p.id, p])).values())
    setProducts(unique)
    setCount(unique.length)
  }).finally(() => setLoading(false))
}, [q])

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        padding: '20px 24px', background: '#fafafa',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} style={{ color: '#888' }} />
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111', fontFamily: 'DM Sans, sans-serif' }}>
            Results for <span style={{ color: '#7c3aed' }}>"{q}"</span>
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#888', marginLeft: '10px' }}>
              {!loading && `(${products.length} found)`}
            </span>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                aspectRatio: '3/4', borderRadius: '12px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
              }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No results for "{q}"</h2>
            <p style={{ color: '#888', marginBottom: '28px' }}>Try different keywords</p>
            <Link to="/products" style={{
              padding: '12px 28px', background: '#111',
              color: '#fff', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            }}>Browse All Products</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}