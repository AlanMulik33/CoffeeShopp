import { useEffect, useMemo, useState } from 'react'
import { products } from './data/products'
import ProductCard from './components/ProductCard'
import CartPanel from './components/CartPanel'
import ProductOptionModal from './components/ProductOptionModal'
import ReceiptModal from './components/ReceiptModal'
import OrderHistoryModal from './components/OrderHistoryModal'
import ThemeToggle from './components/ThemeToggle'
import ConfirmDialog from './components/ConfirmDialog'
import ToastContainer from './components/ToastContainer'
import { usePosStore } from './store/posStore'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  const cart = usePosStore((state) => state.cart)
  const receiptOpen = usePosStore((state) => state.receiptOpen)
  const historyOpen = usePosStore((state) => state.historyOpen)

  const closeReceipt = usePosStore((state) => state.closeReceipt)
  const closeHistory = usePosStore((state) => state.closeHistory)
  const openHistory = usePosStore((state) => state.openHistory)
  const clearCart = usePosStore((state) => state.clearCart)
  const openConfirmDialog = usePosStore((state) => state.openConfirmDialog)
  const addToast = usePosStore((state) => state.addToast)

  const categories = useMemo(() => {
    const uniqueCategories = products.map((product) => product.category)
    return ['Semua', ...new Set(uniqueCategories)]
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === 'Semua' || product.category === selectedCategory

    const matchSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    return matchCategory && matchSearch
  })

  const handleSelectProduct = (product) => {
    setEditingItem(null)
    setSelectedProduct(product)
  }

  const handleEditItem = (item) => {
    const product = products.find((product) => product.id === item.productId)

    if (!product) {
      return
    }

    setEditingItem(item)
    setSelectedProduct(product)
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
    setEditingItem(null)
  }

  useEffect(() => {
    const handleKeyboardShortcut = (event) => {
      const activeElement = document.activeElement
      const activeTag = activeElement?.tagName?.toLowerCase()

      const isTyping =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeElement?.isContentEditable

      const isCtrlOrCommand = event.ctrlKey || event.metaKey

      if (isCtrlOrCommand && event.key.toLowerCase() === 'k') {
        event.preventDefault()

        const searchInput = document.getElementById('menu-search-input')

        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }

        return
      }

      if (event.key === 'Escape') {
        if (selectedProduct) {
          closeProductModal()
          return
        }

        if (receiptOpen) {
          closeReceipt()
          return
        }

        if (historyOpen) {
          closeHistory()
          return
        }
      }

      if (event.key === 'F2') {
        event.preventDefault()
        openHistory()
        return
      }

      if (isCtrlOrCommand && event.key === 'Backspace' && !isTyping) {
        event.preventDefault()

        if (cart.length === 0) {
          return
        }

      openConfirmDialog({
        title: 'Kosongkan keranjang?',
        message:
          'Semua item yang sudah masuk ke keranjang akan dihapus. Aksi ini tidak bisa dibatalkan.',
        confirmText: 'Kosongkan',
        cancelText: 'Batal',
        variant: 'danger',
        onConfirm: () => {
          clearCart()

          addToast({
            title: 'Keranjang dikosongkan',
            message: 'Semua item berhasil dihapus dari keranjang.',
            type: 'warning',
          })
        },
      })
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcut)

    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcut)
    }
}, [
  selectedProduct,
  receiptOpen,
  historyOpen,
  cart.length,
  closeReceipt,
  closeHistory,
  openHistory,
  clearCart,
  openConfirmDialog,
  addToast,
])

  return (
    <>
      <main className="min-h-screen bg-[#f7efe5] p-4 text-[#2d1810] md:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:h-[calc(100vh-48px)] lg:flex-row">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#ead8c0] bg-[#fffaf3] shadow-xl">
            <div className="shrink-0 border-b border-[#ead8c0] p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Coffee Shop POS
              </p>

              <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <h1 className="text-4xl font-black text-[#2d1810]">
                    Warm Brew Cashier
                  </h1>
                  <p className="mt-2 text-[#7b5d4a]">
                    Pilih menu kopi, makanan, atau non-coffee untuk menambahkan pesanan.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ThemeToggle />

                  <div className="rounded-2xl bg-[#2d1810] px-5 py-3 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#d8b98f]">
                      Kasir
                    </p>
                    <p className="font-bold">Agus</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <input
                  id="menu-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari menu, contoh: latte, espresso, croissant..."
                  className="w-full rounded-2xl border border-[#ead8c0] bg-white px-5 py-3 text-[#2d1810] outline-none transition focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                />

                <div className="coffee-scrollbar flex gap-3 overflow-x-auto pb-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${
                        selectedCategory === category
                          ? 'bg-[#2d1810] text-white'
                          : 'bg-white text-[#7b5d4a] hover:bg-[#ead8c0]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold text-[#7b5d4a]">
                  <span className="rounded-full border border-[#ead8c0] bg-white px-3 py-2">
                    Ctrl + K: Cari Menu
                  </span>

                  <span className="rounded-full border border-[#ead8c0] bg-white px-3 py-2">
                    Esc: Tutup Modal
                  </span>

                  <span className="rounded-full border border-[#ead8c0] bg-white px-3 py-2">
                    F2: Riwayat Order
                  </span>

                  <span className="rounded-full border border-[#ead8c0] bg-white px-3 py-2">
                    Ctrl + Backspace: Kosongkan Keranjang
                  </span>
                </div>
              </div>
            </div>

            <div className="coffee-scrollbar min-h-0 flex-1 overflow-y-auto p-6 pb-24">
              {filteredProducts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="text-6xl">🔎</div>

                  <h3 className="mt-4 text-xl font-bold text-[#2d1810]">
                    Menu tidak ditemukan
                  </h3>

                  <p className="mt-2 text-sm text-[#7b5d4a]">
                    Coba gunakan kata kunci lain atau pilih kategori berbeda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="lg:w-[460px] lg:min-h-0">
            <CartPanel onEditItem={handleEditItem} />
          </section>
        </div>
      </main>

      <ProductOptionModal
        product={selectedProduct}
        editingItem={editingItem}
        onClose={closeProductModal}
      />

      <ReceiptModal />

      <OrderHistoryModal />

      <ConfirmDialog />

      <ToastContainer />
    </>
  )
}

export default App