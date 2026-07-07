import { create } from 'zustand'

export const usePosStore = create((set) => ({
  cart: [],

  addToCart: (product, options) =>
    set((state) => {
      const addOnKey =
        options.addOns
          ?.map((addOn) => addOn.name)
          .sort()
          .join('|') || 'none'

      const noteKey = options.note?.trim().toLowerCase() || 'none'

      const cartKey = [
        product.id,
        options.size || 'none',
        options.temperature || 'none',
        options.sugar || 'none',
        options.ice || 'none',
        addOnKey,
        noteKey,
      ].join('-')

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
        sugar: options.sugar,
        ice: options.ice,
        addOns: options.addOns,
        note: options.note,
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