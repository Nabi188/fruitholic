import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type SelectedOption = {
  optionGroupId: string
  optionGroupName: string
  optionValueId: string
  optionValueName: string
  price: number
}

export type CartItem = {
  cartKey: string
  productId: string
  productName: string
  productSlug: string
  imageUrl: string
  variantId: string
  variantName: string
  variantPrice: number
  options: SelectedOption[]
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cartKey' | 'quantity'>, quantity?: number) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalAmount: () => number
  totalItems: () => number
}

function buildCartKey(productId: string, variantId: string, options: SelectedOption[]) {
  const optionHash = options
    .map((o) => o.optionValueId)
    .sort()
    .join('|')
  return `${productId}_${variantId}_${optionHash}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const cartKey = buildCartKey(item.productId, item.variantId, item.options)

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.cartKey === cartKey)
          
          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += quantity
            return { items: newItems }
          }
          
          return {
            items: [...state.items, { ...item, cartKey, quantity }],
          }
        })
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartKey !== cartKey),
        }))
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      totalAmount: () => {
        return get().items.reduce((sum, item) => {
          const optionsTotal = item.options.reduce((s, o) => s + o.price, 0)
          const unitPrice = item.variantPrice + optionsTotal
          return sum + unitPrice * item.quantity
        }, 0)
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'fruitholic-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
