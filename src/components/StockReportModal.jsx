import { useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'

function StockReportModal() {
  const stockReportOpen = usePosStore((state) => state.stockReportOpen)
  const closeStockReport = usePosStore((state) => state.closeStockReport)
  const productCatalog = usePosStore((state) => state.productCatalog)
  const updateProductStock = usePosStore((state) => state.updateProductStock)
  const lowStockThreshold = usePosStore((state) => state.lowStockThreshold)
  const setLowStockThreshold = usePosStore(
    (state) => state.setLowStockThreshold
  )
  const addToast = usePosStore((state) => state.addToast)

  const [filterMode, setFilterMode] = useState('all')
  const [search, setSearch] = useState('')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const stockData = useMemo(() => {
    const totalProducts = productCatalog.length

    const totalStock = productCatalog.reduce((total, product) => {
      return total + (product.stock ?? 0)
    }, 0)

    const availableProducts = productCatalog.filter((product) => {
      return product.isAvailable && (product.stock ?? 0) > 0
    }).length

    const outOfStockProducts = productCatalog.filter((product) => {
      return (product.stock ?? 0) <= 0 || !product.isAvailable
    }).length

    const lowStockProducts = productCatalog.filter((product) => {
      const stock = product.stock ?? 0
      return stock > 0 && stock <= lowStockThreshold
    }).length

    const stockValue = productCatalog.reduce((total, product) => {
      return total + (product.price || 0) * (product.stock ?? 0)
    }, 0)

    const filteredProducts = productCatalog
      .filter((product) => {
        const keyword = search.toLowerCase()
        const matchSearch =
          product.name.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword)

        if (!matchSearch) {
          return false
        }

        const stock = product.stock ?? 0

        if (filterMode === 'low') {
          return stock > 0 && stock <= lowStockThreshold
        }

        if (filterMode === 'out') {
          return stock <= 0 || !product.isAvailable
        }

        return true
      })
      .sort((a, b) => {
        return (a.stock ?? 0) - (b.stock ?? 0)
      })

    return {
      totalProducts,
      totalStock,
      availableProducts,
      outOfStockProducts,
      lowStockProducts,
      stockValue,
      filteredProducts,
    }
  }, [productCatalog, filterMode, search, lowStockThreshold])

  if (!stockReportOpen) {
    return null
  }

  const getStockStatus = (product) => {
    const stock = product.stock ?? 0

    if (stock <= 0 || !product.isAvailable) {
      return {
        label: 'Habis',
        className: 'bg-red-50 text-red-500',
      }
    }

    if (stock <= lowStockThreshold) {
      return {
        label: 'Stok Rendah',
        className: 'bg-yellow-50 text-yellow-700',
      }
    }

    return {
      label: 'Aman',
      className: 'bg-green-50 text-green-700',
    }
  }

  const handleStockChange = (product, nextStock) => {
    const safeStock = Math.max(0, Number(nextStock || 0))

    updateProductStock(product.id, safeStock)

    addToast({
      title: 'Stok diperbarui',
      message: `Stok ${product.name} sekarang ${safeStock}.`,
      type: 'success',
    })
  }

  const exportStockCSV = () => {
    if (stockData.filteredProducts.length === 0) {
      addToast({
        title: 'Tidak ada data',
        message: 'Tidak ada data stok yang bisa diexport.',
        type: 'warning',
      })
      return
    }

    const headers = [
      'Nama Produk',
      'Kategori',
      'Harga',
      'Stok',
      'Nilai Stok',
      'Status Produk',
      'Status Stok',
    ]

    const rows = stockData.filteredProducts.map((product) => {
      const stockStatus = getStockStatus(product)

      return [
        product.name,
        product.category,
        product.price,
        product.stock ?? 0,
        (product.price || 0) * (product.stock ?? 0),
        product.isAvailable ? 'Tersedia' : 'Habis',
        stockStatus.label,
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `laporan-stok-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)

    addToast({
      title: 'Export berhasil',
      message: 'Laporan stok berhasil didownload.',
      type: 'success',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Stock Report
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Laporan Stok Produk
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Pantau stok produk, produk habis, dan produk dengan stok rendah.
              </p>
            </div>

            <button
              onClick={closeStockReport}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Produk
              </p>
              <p className="mt-3 text-4xl font-black text-[#2d1810]">
                {stockData.totalProducts}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Produk Tersedia
              </p>
              <p className="mt-3 text-4xl font-black text-green-700">
                {stockData.availableProducts}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Stok Rendah
              </p>
              <p className="mt-3 text-4xl font-black text-yellow-700">
                {stockData.lowStockProducts}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Habis
              </p>
              <p className="mt-3 text-4xl font-black text-red-500">
                {stockData.outOfStockProducts}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Stok
              </p>
              <p className="mt-3 text-4xl font-black text-[#2d1810]">
                {stockData.totalStock}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                  Filter Stok
                </p>
                <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                  Daftar Stok Produk
                </h3>
                <p className="mt-1 text-sm text-[#7b5d4a]">
                  Estimasi nilai stok: {formatCurrency(stockData.stockValue)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr] xl:w-[520px]">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Batas Stok Rendah
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(event) =>
                      setLowStockThreshold(event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Cari Produk
                  </label>

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama/kategori..."
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  filterMode === 'all'
                    ? 'border-[#2d1810] bg-[#2d1810] text-white'
                    : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                }`}
              >
                Semua
              </button>

              <button
                onClick={() => setFilterMode('low')}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  filterMode === 'low'
                    ? 'border-[#2d1810] bg-[#2d1810] text-white'
                    : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                }`}
              >
                Stok Rendah
              </button>

              <button
                onClick={() => setFilterMode('out')}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  filterMode === 'out'
                    ? 'border-[#2d1810] bg-[#2d1810] text-white'
                    : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                }`}
              >
                Habis
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {stockData.filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                  <div className="text-5xl">📦</div>
                  <p className="mt-3 font-bold text-[#2d1810]">
                    Data stok tidak ditemukan
                  </p>
                  <p className="mt-1 text-sm text-[#7b5d4a]">
                    Coba ubah filter atau kata pencarian.
                  </p>
                </div>
              ) : (
                stockData.filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const stock = product.stock ?? 0

                  return (
                    <div
                      key={product.id}
                      className="rounded-3xl border border-[#ead8c0] bg-white p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_260px] xl:items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4e7] text-3xl">
                            {product.image}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-[#2d1810]">
                                {product.name}
                              </h4>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${stockStatus.className}`}
                              >
                                {stockStatus.label}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-[#7b5d4a]">
                              {product.category} • {formatCurrency(product.price)}
                            </p>

                            <p className="mt-1 text-xs text-[#7b5d4a]">
                              Nilai stok: {formatCurrency(product.price * stock)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#fffaf3] p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                            Stok Saat Ini
                          </p>
                          <p className="mt-1 text-3xl font-black text-[#2d1810]">
                            {stock}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() =>
                              handleStockChange(product, stock - 1)
                            }
                            className="rounded-2xl border border-[#ead8c0] px-3 py-3 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                          >
                            -1
                          </button>

                          <button
                            onClick={() =>
                              handleStockChange(product, stock + 1)
                            }
                            className="rounded-2xl border border-[#ead8c0] px-3 py-3 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                          >
                            +1
                          </button>

                          <button
                            onClick={() =>
                              handleStockChange(product, stock + 10)
                            }
                            className="rounded-2xl bg-[#6f3f24] px-3 py-3 font-bold text-white hover:bg-[#4b2818]"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#ead8c0] p-5 md:grid-cols-2">
          <button
            onClick={exportStockCSV}
            disabled={stockData.filteredProducts.length === 0}
            className="w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
          >
            Export CSV Stok
          </button>

          <button
            onClick={closeStockReport}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup Laporan Stok
          </button>
        </div>
      </div>
    </div>
  )
}

export default StockReportModal