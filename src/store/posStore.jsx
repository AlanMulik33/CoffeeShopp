import { create } from 'zustand'

export const usePosStore = create((set, get) => ({
  cart: [],

  orderType: 'Dine In',
  tableNumber: '',
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',

  paymentMethod: 'Tunai',
  cashPaid: '',

  promoCode: '',
  appliedVoucher: null,
  promoError: '',

  nextQueueNumber: 1,
  lastOrder: null,
  receiptOpen: false,

  setOrderType: (orderType) =>
    set({
      orderType,
      tableNumber: '',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
    }),

  setTableNumber: (tableNumber) => set({ tableNumber }),

  setCustomerName: (customerName) => set({ customerName }),

  setCustomerPhone: (customerPhone) => set({ customerPhone }),

  setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),

  setPaymentMethod: (paymentMethod) =>
    set({
      paymentMethod,
      cashPaid: paymentMethod === 'Tunai' ? get().cashPaid : '',
    }),

  setCashPaid: (cashPaid) => set({ cashPaid }),

  setPromoCode: (promoCode) =>
    set({
      promoCode,
      promoError: '',
    }),

  applyVoucher: (voucher, subtotal) => {
    if (!voucher) {
      set({
        appliedVoucher: null,
        promoError: 'Kode voucher tidak ditemukan.',
      })
      return
    }

    if (subtotal <= 0) {
      set({
        appliedVoucher: null,
        promoError: 'Tambahkan produk dulu sebelum memakai voucher.',
      })
      return
    }

    if (subtotal < voucher.minimumPurchase) {
      set({
        appliedVoucher: null,
        promoError: `Minimal belanja untuk voucher ini adalah Rp ${voucher.minimumPurchase.toLocaleString(
          'id-ID'
        )}.`,
      })
      return
    }

    set({
      appliedVoucher: voucher,
      promoCode: voucher.code,
      promoError: '',
    })
  },

  removeVoucher: () =>
    set({
      promoCode: '',
      appliedVoucher: null,
      promoError: '',
    }),

  closeReceipt: () => set({ receiptOpen: false }),

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

  clearCart: () =>
    set({
      cart: [],
      promoCode: '',
      appliedVoucher: null,
      promoError: '',
      cashPaid: '',
    }),

  createTemporaryOrder: (summary) => {
    const state = get()

    const queueCode = `A${String(state.nextQueueNumber).padStart(3, '0')}`

    const newOrder = {
      queueCode,
      orderType: state.orderType,
      tableNumber: state.tableNumber,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      deliveryAddress: state.deliveryAddress,
      items: state.cart,
      subtotal: summary.subtotal,
      voucher: state.appliedVoucher,
      voucherDiscount: summary.voucherDiscount,
      happyHourPromo: summary.happyHourPromo,
      happyHourDiscount: summary.happyHourDiscount,
      discount: summary.discount,
      taxableAmount: summary.taxableAmount,
      tax: summary.tax,
      total: summary.total,
      paymentMethod: state.paymentMethod,
    }

    set({
      lastOrder: newOrder,
      receiptOpen: true,
      nextQueueNumber: state.nextQueueNumber + 1,
      cart: [],
      tableNumber: '',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      cashPaid: '',
      promoCode: '',
      appliedVoucher: null,
      promoError: '',
    })

    return newOrder
  },
}))