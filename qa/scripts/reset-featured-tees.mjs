/**
 * Wipe catalog and recreate the 3 home featured tees with local images.
 * Usage: node qa/scripts/reset-featured-tees.mjs
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const API = process.env.TF_API_URL || 'http://localhost:8000/api'
const ADMIN = {
  email: process.env.TF_ADMIN_EMAIL || 'admin@transfinity.test',
  password: process.env.TF_ADMIN_PASSWORD || 'Admin123!',
}

const TEES = [
  {
    name: 'THE VOID TEE',
    slug: 'void',
    folder: 'product-1',
    sku: 'TF-VOID-001',
    description:
      'Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.',
  },
  {
    name: 'THE ETERNAL TEE',
    slug: 'eternal',
    folder: 'product-2',
    sku: 'TF-ETERNAL-001',
    description:
      'Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.',
  },
  {
    name: 'THE ASCENDANT TEE',
    slug: 'ascendant',
    folder: 'product-3',
    sku: 'TF-ASCENDANT-001',
    description:
      'Premium oversized fit. 240 GSM. 100% pure cotton. Built for those who go beyond.',
  },
]

async function api(path, opts = {}) {
  const { headers = {}, body, formData, ...rest } = opts
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: formData
      ? { ...headers }
      : { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
    body: formData || (body != null ? JSON.stringify(body) : undefined),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new Error(`${opts.method || 'GET'} ${path} → ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

async function main() {
  console.log('Login as admin…')
  const auth = await api('/auth/login/', {
    method: 'POST',
    body: { email: ADMIN.email, password: ADMIN.password },
  })
  const token = auth.access
  const H = { Authorization: `Bearer ${token}` }

  console.log('List existing products…')
  const list = await api('/products/admin/products/', { headers: H })
  const existing = list.results || list || []
  console.log(`Removing/archiving ${existing.length} products…`)
  for (const p of existing) {
    try {
      // Hide first so featured home clears even if hard-delete is blocked by orders
      await api(`/products/admin/products/${p.id}/`, {
        method: 'PATCH',
        headers: H,
        body: { is_active: false, is_featured: false },
      })
      const del = await fetch(`${API}/products/admin/products/${p.id}/`, {
        method: 'DELETE',
        headers: { ...H, Accept: 'application/json' },
      })
      let body = null
      try {
        body = await del.json()
      } catch {
        body = null
      }
      if (del.status === 204) console.log('  deleted', p.name)
      else if (del.ok && body?.archived) console.log('  archived', p.name)
      else console.log('  cleared', p.name, del.status)
    } catch (e) {
      console.log('  skip', p.name, String(e.message || e))
    }
  }

  // Ensure a category exists
  let categoryId = null
  try {
    const cats = await api('/products/categories/', { headers: H })
    const arr = cats.results || cats || []
    const tee = arr.find((c) => /tee|t-?shirt|apparel/i.test(c.name)) || arr[0]
    categoryId = tee?.id || null
  } catch {
    /* optional */
  }

  for (const tee of TEES) {
    console.log(`Create ${tee.name}…`)
    const product = await api('/products/admin/products/', {
      method: 'POST',
      headers: H,
      body: {
        name: tee.name,
        slug: tee.slug,
        description: tee.description,
        price: '1699.00',
        sale_price: null,
        stock: 50,
        sku: tee.sku,
        category: categoryId,
        is_active: true,
        is_featured: true,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      },
    })

    const dir = join(ROOT, 'frontend/public/product', tee.folder)
    const files = readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort()
    const fd = new FormData()
    for (const file of files) {
      const buf = readFileSync(join(dir, file))
      fd.append('images', new Blob([buf], { type: 'image/png' }), file)
    }
    console.log(`  upload ${files.length} images…`)
    await api(`/products/admin/products/${product.id}/images/`, {
      method: 'POST',
      headers: H,
      formData: fd,
    })
    console.log('  ok', product.id)
  }

  const featured = await api('/products/featured/')
  const rows = featured.results || featured || []
  console.log('\nFeatured now:')
  for (const p of rows) {
    console.log(`- ${p.name} (${p.slug}) images=${(p.images || []).length}`)
  }
  console.log('\nDone. Refresh http://localhost:5173/ and /admin/products')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
