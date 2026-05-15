import { create } from 'zustand'
import api from '../services/api'

const useWishlistStore = create((set) => ({
  items: [],

  fetchWishlist: async () => {
    try {
      const { data } = await api.get('/wishlist/')
      set({ items: data.results || data })
    } catch {}
  },

  toggle: async (product_id) => {
    const { data } = await api.post('/wishlist/toggle/', { product_id })
    // Refresh wishlist
    const { data: wl } = await api.get('/wishlist/')
    set({ items: wl.results || wl })
    return data
  },

  isWishlisted: (product_id) => {
    const { items } = useWishlistStore.getState()
    return items.some((i) => i.product.id === product_id)
  },
}))

export default useWishlistStore