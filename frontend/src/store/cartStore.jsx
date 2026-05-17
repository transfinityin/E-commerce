import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useCartStore = create(
  persist(
    (set, get) => ({
      cart:    null,
      loading: false,

      fetchCart: async () => {
        try {
          set({ loading: true })
          const { data } = await api.get('/cart/')
          set({ cart: data })
        } catch (err) {
          console.error('Cart fetch error:', err)
        } finally {
          set({ loading: false })
        }
      },

      addToCart: async (product_id, quantity = 1, size = null) => {
        const { data } = await api.post('/cart/add/', { product_id, quantity, size })
        set({ cart: data.cart })
        return data
      },

      updateItem: async (item_id, quantity) => {
        const { data } = await api.patch(`/cart/item/${item_id}/`, { quantity })
        set({ cart: data.cart })
      },

      removeItem: async (item_id) => {
        await api.delete(`/cart/item/${item_id}/`)
        get().fetchCart()
      },

      clearCart: async () => {
        await api.delete('/cart/')
        set({ cart: null })
      },
    }),
    {
      name: 'cart-storage', // localStorage la save aagum
      partialize: (state) => ({ cart: state.cart }), // cart mattum persist
    }
  )
)

export default useCartStore