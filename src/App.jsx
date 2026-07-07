import { useMemo, useState } from 'react'
import { products } from './data/products'
import ProductCard from './components/ProductCard'
import CartPanel from './components/CartPanel'
import ProductOptionModal from './components/ProductOptionModal'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

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

                <div className="rounded-2xl bg-[#2d1810] px-5 py-3 text-white">
                  <p className="text-xs uppercase tracking-widest text-[#d8b98f]">
                    Kasir
                  </p>
                  <p className="font-bold">Agus</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari menu, contoh: latte, espresso, croissant..."
                  className="w-full rounded-2xl border border-[#ead8c0] bg-white px-5 py-3 text-[#2d1810] outline-none transition focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                />

                <div className="flex gap-3 overflow-x-auto pb-1">
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
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-24">
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
                      onSelect={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="lg:w-[420px] lg:min-h-0">
            <CartPanel />
          </section>
        </div>
      </main>

      <ProductOptionModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}

export default App