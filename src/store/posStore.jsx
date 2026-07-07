import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTodayInputValue } from '../utils/dateFilter'

const defaultConfirmDialog = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Ya',
  cancelText: 'Batal',
  variant: 'danger',
  onConfirm: null,
}

export const usePosStore = create(
  persist(
    (set, get) => ({
      cart: [],

      theme: localStorage.getItem('coffee-pos-theme') || 'light',

      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light'
          localStorage.setItem('coffee-pos-theme', nextTheme)
          return { theme: nextTheme }
        }),

      confirmDialog: defaultConfirmDialog,

      openConfirmDialog: (config) =>
        set({
          confirmDialog: {
            isOpen: true,
            title: config.title || 'Konfirmasi',
            message: config.message || 'Apakah kamu yakin?',
            confirmText: config.confirmText || 'Ya',
            cancelText: config.cancelText || 'Batal',
            variant: config.variant || 'danger',
            onConfirm: config.onConfirm || null,
          },
        }),

      closeConfirmDialog: () =>
        set({
          confirmDialog: { ...defaultConfirmDialog },
        }),

      toasts: [],

      addToast: (toast) => {
        const id = crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`

        const newToast = {
          id,
          title: toast.title || 'Notifikasi',
          message: toast.message || '',
          type: toast.type || 'success',
        }

        set((state) => ({
          toasts: [newToast, ...state.toasts].slice(0, 4),
        }))

        setTimeout(() => {
          get().removeToast(id)
        }, toast.duration || 3000)
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),

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
      orderHistory: [],
      receiptOpen: false,
      historyOpen: false,
      dashboardOpen: false,
      kitchenOpen: false,

      reportFilterMode: 'today',
      reportStartDate: getTodayInputValue(),
      reportEndDate: getTodayInputValue(),

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

      openHistory: () => set({ historyOpen: true }),

      closeHistory: () => set({ historyOpen: false }),

      openDashboard: () => set({ dashboardOpen: true }),

      closeDashboard: () => set({ dashboardOpen: false }),

      openKitchen: () => set({ kitchenOpen: true }),

      closeKitchen: () => set({ kitchenOpen: false }),

      updateOrderStatus: (orderId, status) =>
        set((state) => {
          const updateOrder = (order) => {
            const sameOrder =
              order.orderId === orderId || order.queueCode === orderId

            if (!sameOrder) {
              return order
            }

            return {
              ...order,
              status,
              statusUpdatedAt: new Date().toLocaleString('id-ID'),
            }
          }

          return {
            orderHistory: state.orderHistory.map(updateOrder),
            lastOrder: state.lastOrder ? updateOrder(state.lastOrder) : null,
          }
        }),

      cancelOrder: (orderId) =>
        set((state) => {
          const cancelledAt = new Date().toLocaleString('id-ID')

          const cancelSelectedOrder = (order) => {
            const sameOrder =
              order.orderId === orderId || order.queueCode === orderId

            if (!sameOrder) {
              return order
            }

            return {
              ...order,
              status: 'Cancelled',
              statusUpdatedAt: cancelledAt,
              cancelledAt,
            }
          }

          return {
            orderHistory: state.orderHistory.map(cancelSelectedOrder),
            lastOrder: state.lastOrder
              ? cancelSelectedOrder(state.lastOrder)
              : null,
          }
        }),

      setReportFilterMode: (reportFilterMode) =>
        set({
          reportFilterMode,
          reportStartDate:
            reportFilterMode === 'today' ? getTodayInputValue() : get().reportStartDate,
          reportEndDate:
            reportFilterMode === 'today' ? getTodayInputValue() : get().reportEndDate,
        }),

      setReportStartDate: (reportStartDate) =>
        set({
          reportStartDate,
          reportFilterMode: 'custom',
        }),

      setReportEndDate: (reportEndDate) =>
        set({
          reportEndDate,
          reportFilterMode: 'custom',
        }),

      resetReportFilterToday: () =>
        set({
          reportFilterMode: 'today',
          reportStartDate: getTodayInputValue(),
          reportEndDate: getTodayInputValue(),
        }),

      showReceiptFromHistory: (order) =>
        set({
          lastOrder: order,
          receiptOpen: true,
          historyOpen: false,
        }),

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

          const existingItem = state.cart.find(
            (item) => item.cartKey === cartKey
          )

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

      updateCartItem: (oldCartKey, product, options) =>
        set((state) => {
          const addOnKey =
            options.addOns
              ?.map((addOn) => addOn.name)
              .sort()
              .join('|') || 'none'

          const noteKey = options.note?.trim().toLowerCase() || 'none'

          const newCartKey = [
            product.id,
            options.size || 'none',
            options.temperature || 'none',
            options.sugar || 'none',
            options.ice || 'none',
            addOnKey,
            noteKey,
          ].join('-')

          const updatedItem = {
            cartKey: newCartKey,
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

          const otherItems = state.cart.filter(
            (item) => item.cartKey !== oldCartKey
          )

          const sameItem = otherItems.find(
            (item) => item.cartKey === newCartKey
          )

          if (sameItem) {
            return {
              cart: otherItems.map((item) =>
                item.cartKey === newCartKey
                  ? { ...item, quantity: item.quantity + options.quantity }
                  : item
              ),
            }
          }

          return {
            cart: [...otherItems, updatedItem],
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

        const now = new Date()

        const newOrder = {
          orderId: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
          status: 'New',
          statusUpdatedAt: now.toLocaleString('id-ID'),
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
          cashPaid: summary.cashPaid,
          change: summary.change,
          createdAt: now.toLocaleString('id-ID'),
          createdAtISO: now.toISOString(),
          createdHour: now.getHours(),
        }

        set({
          lastOrder: newOrder,
          orderHistory: [newOrder, ...state.orderHistory],
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
    }),
    {
      name: 'coffee-pos-storage',

      partialize: (state) => ({
        cart: state.cart,
        theme: state.theme,

        orderType: state.orderType,
        tableNumber: state.tableNumber,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        deliveryAddress: state.deliveryAddress,

        paymentMethod: state.paymentMethod,
        cashPaid: state.cashPaid,

        promoCode: state.promoCode,
        appliedVoucher: state.appliedVoucher,

        nextQueueNumber: state.nextQueueNumber,
        lastOrder: state.lastOrder,
        orderHistory: state.orderHistory,

        reportFilterMode: state.reportFilterMode,
        reportStartDate: state.reportStartDate,
        reportEndDate: state.reportEndDate,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.receiptOpen = false
        state.historyOpen = false
        state.dashboardOpen = false
        state.kitchenOpen = false
        state.confirmDialog = { ...defaultConfirmDialog }
        state.toasts = []
        state.promoError = ''
      },
    }
  )
)