import { useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'

const emptyItemForm = {
  productId: '',
  quantity: '1',
  unitCost: '',
}

function RestockModal() {
  const restockOpen = usePosStore((state) => state.restockOpen)
  const closeRestock = usePosStore((state) => state.closeRestock)
  const productCatalog = usePosStore((state) => state.productCatalog)
  const restockHistory = usePosStore((state) => state.restockHistory)
  const createRestockTransaction = usePosStore(
    (state) => state.createRestockTransaction
  )
  const addToast = usePosStore((state) => state.addToast)

  const [supplierName, setSupplierName] = useState('')
  const [note, setNote] = useState('')
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [restockItems, setRestockItems] = useState([])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const selectedProduct = useMemo(() => {
    return productCatalog.find(
      (product) => product.id === Number(itemForm.productId)
    )
  }, [productCatalog, itemForm.productId])

  const totalRestockCost = restockItems.reduce((total, item) => {
    return total + item.quantity * item.unitCost
  }, 0)

  if (!restockOpen) {
    return null
  }

  const resetForm = () => {
    setSupplierName('')
    setNote('')
    setItemForm(emptyItemForm)
    setRestockItems([])
  }

  const handleAddItem = () => {
    const product = productCatalog.find(
      (product) => product.id === Number(itemForm.productId)
    )

    if (!product) {
      addToast({
        title: 'Produk belum dipilih',
        message: 'Pilih produk yang ingin direstock.',
        type: 'warning',
      })
      return
    }

    const quantity = Math.max(1, Number(itemForm.quantity || 1))
    const unitCost = Math.max(0, Number(itemForm.unitCost || 0))

    if (unitCost <= 0) {
      addToast({
        title: 'Harga beli kosong',
        message: 'Isi harga beli per item terlebih dahulu.',
        type: 'warning',
      })
      return
    }

    const existingItem = restockItems.find(
      (item) => item.productId === product.id
    )

    if (existingItem) {
      setRestockItems((current) =>
        current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                unitCost,
              }
            : item
        )
      )
    } else {
      setRestockItems((current) => [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          category: product.category,
          currentStock: product.stock ?? 0,
          quantity,
          unitCost,
        },
      ])
    }

    setItemForm(emptyItemForm)
  }

  const handleRemoveItem = (productId) => {
    setRestockItems((current) =>
      current.filter((item) => item.productId !== productId)
    )
  }

  const handleSubmit = () => {
    if (!supplierName.trim()) {
      addToast({
        title: 'Supplier kosong',
        message: 'Isi nama supplier terlebih dahulu.',
        type: 'warning',
      })
      return
    }

    if (restockItems.length === 0) {
      addToast({
        title: 'Item restock kosong',
        message: 'Tambahkan minimal satu produk untuk direstock.',
        type: 'warning',
      })
      return
    }

    const transaction = createRestockTransaction({
      supplierName: supplierName.trim(),
      note: note.trim(),
      items: restockItems,
    })

    addToast({
      title: 'Restock berhasil',
      message: `${transaction.items.length} produk berhasil direstock.`,
      type: 'success',
    })

    resetForm()
  }

  const exportRestockCSV = () => {
    if (restockHistory.length === 0) {
      addToast({
        title: 'Tidak ada data',
        message: 'Belum ada riwayat restock untuk diexport.',
        type: 'warning',
      })
      return
    }

    const headers = [
      'Tanggal',
      'Supplier',
      'Produk',
      'Kategori',
      'Stok Sebelum',
      'Jumlah Masuk',
      'Stok Sesudah',
      'Harga Beli',
      'Total Biaya',
      'Catatan',
    ]

    const rows = restockHistory.flatMap((transaction) =>
      transaction.items.map((item) => [
        transaction.createdAt,
        transaction.supplierName,
        item.productName,
        item.category,
        item.beforeStock,
        item.quantity,
        item.afterStock,
        item.unitCost,
        item.totalCost,
        transaction.note,
      ])
    )

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
    link.download = `riwayat-restock-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)

    addToast({
      title: 'Export berhasil',
      message: 'Riwayat restock berhasil didownload.',
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
                Restock Product
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Pembelian / Restock Barang
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Catat stok masuk dari supplier dan otomatis tambah stok produk.
              </p>
            </div>

            <button
              onClick={closeRestock}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Form Restock
              </p>

              <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                Tambah Stok Masuk
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Nama Supplier
                  </label>

                  <input
                    value={supplierName}
                    onChange={(event) => setSupplierName(event.target.value)}
                    placeholder="Contoh: Supplier Kopi Bali"
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                  />
                </div>

                <div className="rounded-3xl border border-[#ead8c0] bg-white p-4">
                  <p className="font-bold text-[#2d1810]">Tambah Produk</p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Produk
                      </label>

                      <select
                        value={itemForm.productId}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            productId: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                      >
                        <option value="">Pilih produk</option>

                        {productCatalog.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - stok {product.stock ?? 0}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProduct && (
                      <div className="rounded-2xl bg-[#fffaf3] p-4 text-sm text-[#7b5d4a]">
                        <p className="font-bold text-[#2d1810]">
                          {selectedProduct.name}
                        </p>
                        <p>Stok saat ini: {selectedProduct.stock ?? 0}</p>
                        <p>Harga jual: {formatCurrency(selectedProduct.price)}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                          Jumlah Masuk
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={itemForm.quantity}
                          onChange={(event) =>
                            setItemForm((current) => ({
                              ...current,
                              quantity: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                          Harga Beli / Item
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={itemForm.unitCost}
                          onChange={(event) =>
                            setItemForm((current) => ({
                              ...current,
                              unitCost: event.target.value,
                            }))
                          }
                          placeholder="12000"
                          className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
                    >
                      Tambah ke Restock
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Catatan
                  </label>

                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Contoh: Pembelian stok mingguan"
                    className="min-h-24 w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                      Restock Cart
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                      Item yang Akan Direstock
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                      Total Biaya
                    </p>
                    <p className="font-black text-[#2d1810]">
                      {formatCurrency(totalRestockCost)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {restockItems.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                      <div className="text-5xl">📦</div>
                      <p className="mt-3 font-bold text-[#2d1810]">
                        Belum ada item restock
                      </p>
                      <p className="mt-1 text-sm text-[#7b5d4a]">
                        Pilih produk di form sebelah kiri.
                      </p>
                    </div>
                  ) : (
                    restockItems.map((item) => (
                      <div
                        key={item.productId}
                        className="rounded-3xl border border-[#ead8c0] bg-white p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                          <div>
                            <p className="font-black text-[#2d1810]">
                              {item.productName}
                            </p>
                            <p className="mt-1 text-sm text-[#7b5d4a]">
                              Stok {item.currentStock} →{' '}
                              {item.currentStock + item.quantity}
                            </p>
                            <p className="mt-1 text-sm text-[#7b5d4a]">
                              {item.quantity} × {formatCurrency(item.unitCost)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="font-black text-[#6f3f24]">
                              {formatCurrency(item.quantity * item.unitCost)}
                            </p>

                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={handleSubmit}
                    disabled={restockItems.length === 0}
                    className="w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
                  >
                    Simpan Restock
                  </button>

                  <button
                    onClick={resetForm}
                    className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
                <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                      Restock History
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                      Riwayat Restock
                    </h3>
                  </div>

                  <button
                    onClick={exportRestockCSV}
                    disabled={restockHistory.length === 0}
                    className="rounded-2xl bg-[#6f3f24] px-5 py-3 text-sm font-bold text-white hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
                  >
                    Export CSV
                  </button>
                </div>

                {restockHistory.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                    <div className="text-5xl">🧾</div>
                    <p className="mt-3 font-bold text-[#2d1810]">
                      Belum ada riwayat restock
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restockHistory.slice(0, 6).map((transaction) => (
                      <div
                        key={transaction.restockId}
                        className="rounded-3xl border border-[#ead8c0] bg-white p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                              {transaction.createdAt}
                            </p>
                            <p className="mt-1 font-black text-[#2d1810]">
                              {transaction.supplierName}
                            </p>
                            <p className="mt-1 text-sm text-[#7b5d4a]">
                              {transaction.items.length} item •{' '}
                              {formatCurrency(transaction.totalCost)}
                            </p>
                            {transaction.note && (
                              <p className="mt-1 text-sm italic text-[#7b5d4a]">
                                {transaction.note}
                              </p>
                            )}
                          </div>

                          <div className="text-sm text-[#7b5d4a]">
                            {transaction.items.map((item) => (
                              <p key={item.productId}>
                                {item.productName} +{item.quantity}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ead8c0] p-5">
          <button
            onClick={closeRestock}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup Restock
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestockModal