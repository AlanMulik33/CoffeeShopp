import { create } from 'zustand'

export const usePosStore = create((set) => ({
  cart: [],

  addToCart: (product, options) =>
    set((state) => {
      const cartKey = `${product.id}-${options.size}-${options.temperature || 'none'}`

      const existingItem = state.cart.find((item) => item.cartKey === cartKey)

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.cartKey === cartKey
              ? { ...item, quantity: item.quantity + options.quantity }
              : item
          ),
        }
      }

      const newItem = {
        cartKey,
        productId: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        basePrice: product.price,
        price: options.finalPrice,
        size: options.size,
        temperature: options.temperature,
        quantity: options.quantity,
      }

      return {
        cart: [...state.cart, newItem],
      }
    }),

  increaseQuantity: (cartKey) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    })),

  decreaseQuantity: (cartKey) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeFromCart: (cartKey) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartKey !== cartKey),
    })),

  clearCart: () => set({ cart: [] }),
}))