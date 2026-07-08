import { useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'

const drinkSizes = [
  { name: 'Small', additionalPrice: 0 },
  { name: 'Medium', additionalPrice: 3000 },
  { name: 'Large', additionalPrice: 6000 },
]

const regularSize = [{ name: 'Regular', additionalPrice: 0 }]

const sugarOptions = ['Normal Sugar', 'Less Sugar', 'No Sugar']
const iceOptions = ['Normal Ice', 'Less Ice', 'No Ice']

const defaultAddOns = [
  { name: 'Extra Shot', price: 5000 },
  { name: 'Vanilla Syrup', price: 4000 },
  { name: 'Caramel Syrup', price: 4000 },
]

const sizeOptionsToText = (sizeOptions = []) => {
  return sizeOptions
    .map((size) => `${size.name}:${size.additionalPrice || 0}`)
    .join('\n')
}

const addOnOptionsToText = (addOnOptions = []) => {
  return addOnOptions
    .map((addOn) => `${addOn.name}:${addOn.price || 0}`)
    .join('\n')
}

const listToText = (items = []) => {
  return items.join(', ')
}

const parseListText = (text) => {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseSizeOptions = (text, fallback = regularSize) => {
  const parsed = text
    .split('\n')
    .map((line) => {
      const [namePart, pricePart] = line.split(':')
      const name = namePart?.trim()
      const additionalPrice = Number(pricePart?.trim() || 0)

      if (!name) {
        return null
      }

      return {
        name,
        additionalPrice: Number.isFinite(additionalPrice)
          ? additionalPrice
          : 0,
      }
    })
    .filter(Boolean)

  return parsed.length > 0 ? parsed : fallback
}

const parseAddOnOptions = (text) => {
  return text
    .split('\n')
    .map((line) => {
      const [namePart, pricePart] = line.split(':')
      const name = namePart?.trim()
      const price = Number(pricePart?.trim() || 0)

      if (!name) {
        return null
      }

      return {
        name,
        price: Number.isFinite(price) ? price : 0,
      }
    })
    .filter(Boolean)
}

const drinkOptionForm = {
  sizeOptionsText: sizeOptionsToText(drinkSizes),
  temperatureOptionsText: 'Hot, Iced',
  sugarOptionsText: listToText(sugarOptions),
  iceOptionsText: listToText(iceOptions),
  addOnOptionsText: addOnOptionsToText(defaultAddOns),
}

const foodOptionForm = {
  sizeOptionsText: sizeOptionsToText(regularSize),
  temperatureOptionsText: '',
  sugarOptionsText: '',
  iceOptionsText: '',
  addOnOptionsText: '',
}

const emptyForm = {
  name: '',
  category: 'Espresso',
  price: '',
  stock: '20',
  image: '☕',
  description: '',
  ...drinkOptionForm,
}

function ProductAdminModal() {
  const productAdminOpen = usePosStore((state) => state.productAdminOpen)
  const closeProductAdmin = usePosStore((state) => state.closeProductAdmin)
  const productCatalog = usePosStore((state) => state.productCatalog)
  const addProduct = usePosStore((state) => state.addProduct)
  const updateProduct = usePosStore((state) => state.updateProduct)
  const toggleProductAvailability = usePosStore(
    (state) => state.toggleProductAvailability
  )
  const deleteProduct = usePosStore((state) => state.deleteProduct)
  const openConfirmDialog = usePosStore((state) => state.openConfirmDialog)
  const addToast = usePosStore((state) => state.addToast)

  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filteredProducts = useMemo(() => {
    return productCatalog.filter((product) => {
      const keyword = search.toLowerCase()

      return (
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      )
    })
  }, [productCatalog, search])

  if (!productAdminOpen) {
    return null
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCategoryChange = (category) => {
    const optionPreset = category === 'Makanan' ? foodOptionForm : drinkOptionForm

    setForm((current) => ({
      ...current,
      category,
      image: category === 'Makanan' && current.image === '☕' ? '🥐' : current.image,
      ...optionPreset,
    }))
  }

  const resetForm = () => {
    setEditingProduct(null)
    setForm(emptyForm)
  }

  const startEdit = (product) => {
    setEditingProduct(product)

    setForm({
      name: product.name || '',
      category: product.category || 'Espresso',
      price: String(product.price || ''),
      stock: String(product.stock ?? 0),
      image: product.image || '☕',
      description: product.description || '',
      sizeOptionsText: sizeOptionsToText(
        product.sizeOptions?.length ? product.sizeOptions : regularSize
      ),
      temperatureOptionsText: listToText(product.temperatureOptions || []),
      sugarOptionsText: listToText(product.sugarOptions || []),
      iceOptionsText: listToText(product.iceOptions || []),
      addOnOptionsText: addOnOptionsToText(product.addOnOptions || []),
    })
  }

  const buildOptionsFromForm = () => {
    const fallbackSize =
      form.category === 'Makanan' ? regularSize : drinkSizes

    return {
      sizeOptions: parseSizeOptions(form.sizeOptionsText, fallbackSize),
      temperatureOptions: parseListText(form.temperatureOptionsText),
      sugarOptions: parseListText(form.sugarOptionsText),
      iceOptions: parseListText(form.iceOptionsText),
      addOnOptions: parseAddOnOptions(form.addOnOptionsText),
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const price = Number(form.price)
    const stock = Math.max(0, Number(form.stock || 0))
    if (!form.name.trim()) {
      addToast({
        title: 'Nama produk kosong',
        message: 'Isi nama produk terlebih dahulu.',
        type: 'warning',
      })
      return
    }

    if (!price || price <= 0) {
      addToast({
        title: 'Harga tidak valid',
        message: 'Harga produk harus lebih dari 0.',
        type: 'warning',
      })
      return
    }

    const optionData = buildOptionsFromForm()

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: form.name.trim(),
        category: form.category,
        price,
        stock,
        isAvailable: stock > 0 ? editingProduct.isAvailable : false,
        image: form.image.trim() || '☕',
        description: form.description.trim(),
        ...optionData,
      })

      addToast({
        title: 'Produk diperbarui',
        message: `${form.name} berhasil diperbarui.`,
        type: 'success',
      })

      resetForm()
      return
    }

    addProduct({
      name: form.name.trim(),
      category: form.category,
      price,
      stock,
      image: form.image.trim() || '☕',
      description: form.description.trim(),
      ...optionData,
    })

    addToast({
      title: 'Produk ditambahkan',
      message: `${form.name} berhasil masuk katalog.`,
      type: 'success',
    })

    resetForm()
  }

  const handleDelete = (product) => {
    openConfirmDialog({
      title: `Hapus ${product.name}?`,
      message:
        'Produk akan hilang dari daftar menu. Riwayat order lama tetap aman karena item order sudah tersimpan di transaksi.',
      confirmText: 'Hapus Produk',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        deleteProduct(product.id)

        addToast({
          title: 'Produk dihapus',
          message: `${product.name} berhasil dihapus dari katalog.`,
          type: 'warning',
        })

        if (editingProduct?.id === product.id) {
          resetForm()
        }
      },
    })
  }

  const handleToggleAvailability = (product) => {
    toggleProductAvailability(product.id)

    addToast({
      title: 'Status produk diubah',
      message: `${product.name} sekarang ${
        product.isAvailable ? 'habis' : 'tersedia'
      }.`,
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
                Product Admin
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Kelola Produk
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Tambah, edit, hapus, status produk, dan opsi custom order.
              </p>
            </div>

            <button
              onClick={closeProductAdmin}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </p>

              <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                {editingProduct ? editingProduct.name : 'Produk Baru'}
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Nama Produk
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleChange('name', event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                    placeholder="Contoh: Vanilla Latte"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      handleCategoryChange(event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                  >
                    <option value="Espresso">Espresso</option>
                    <option value="Manual Brew">Manual Brew</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Makanan">Makanan</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Harga Dasar
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      handleChange('price', event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Stok Produk
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) => handleChange('stock', event.target.value)}
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                    placeholder="20"
                  />

                  <p className="mt-1 text-xs text-[#7b5d4a]">
                    Jika stok 0, produk otomatis menjadi habis.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Emoji / Icon
                  </label>
                  <input
                    value={form.image}
                    onChange={(event) =>
                      handleChange('image', event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                    placeholder="☕"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      handleChange('description', event.target.value)
                    }
                    className="min-h-24 w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                    placeholder="Deskripsi singkat produk..."
                  />
                </div>

                <div className="rounded-3xl border border-[#ead8c0] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Opsi Custom Order
                  </p>

                  <p className="mt-1 text-xs text-[#7b5d4a]">
                    Format harga tambahan gunakan tanda titik dua.
                  </p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Size & Tambahan Harga
                      </label>
                      <textarea
                        value={form.sizeOptionsText}
                        onChange={(event) =>
                          handleChange('sizeOptionsText', event.target.value)
                        }
                        className="min-h-24 w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        placeholder={'Small:0\nMedium:3000\nLarge:6000'}
                      />
                      <p className="mt-1 text-xs text-[#7b5d4a]">
                        Contoh: Small:0, Medium:3000, Large:6000
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Opsi Suhu
                      </label>
                      <input
                        value={form.temperatureOptionsText}
                        onChange={(event) =>
                          handleChange(
                            'temperatureOptionsText',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        placeholder="Hot, Iced, Blend"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Sugar Level
                      </label>
                      <input
                        value={form.sugarOptionsText}
                        onChange={(event) =>
                          handleChange('sugarOptionsText', event.target.value)
                        }
                        className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        placeholder="Normal Sugar, Less Sugar, No Sugar"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Ice Level
                      </label>
                      <input
                        value={form.iceOptionsText}
                        onChange={(event) =>
                          handleChange('iceOptionsText', event.target.value)
                        }
                        className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        placeholder="Normal Ice, Less Ice, No Ice"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        Add-on & Harga
                      </label>
                      <textarea
                        value={form.addOnOptionsText}
                        onChange={(event) =>
                          handleChange('addOnOptionsText', event.target.value)
                        }
                        className="min-h-24 w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                        placeholder={'Extra Shot:5000\nVanilla Syrup:4000'}
                      />
                      <p className="mt-1 text-xs text-[#7b5d4a]">
                        Satu add-on per baris. Contoh: Extra Shot:5000
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Product List
                  </p>

                  <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                    Daftar Produk
                  </h3>
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0] md:max-w-xs"
                  placeholder="Cari produk..."
                />
              </div>

              <div className="mt-5 space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                    <div className="text-5xl">📦</div>
                    <p className="mt-3 font-bold text-[#2d1810]">
                      Produk tidak ditemukan
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-3xl border border-[#ead8c0] bg-white p-4"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  product.isAvailable
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-500'
                                }`}
                              >
                                {product.isAvailable ? 'Tersedia' : 'Habis'}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-[#7b5d4a]">
                              {product.category} • {formatCurrency(product.price)} • Stok {product.stock ?? 0}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-[#7b5d4a]">
                              {product.description}
                            </p>

                            <p className="mt-2 text-xs text-[#7b5d4a]">
                              {(product.sizeOptions || []).length} size •{' '}
                              {(product.temperatureOptions || []).length} suhu •{' '}
                              {(product.addOnOptions || []).length} add-on
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:w-[320px]">
                          <button
                            onClick={() => startEdit(product)}
                            className="rounded-2xl border border-[#ead8c0] px-3 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                                if ((product.stock ?? 0) <= 0 && !product.isAvailable) {
                                  addToast({
                                    title: 'Stok masih kosong',
                                    message: 'Tambahkan stok dulu sebelum produk dibuat tersedia.',
                                    type: 'warning',
                                  })
                                  return
                                }

                                handleToggleAvailability(product)
                              }}
                            className="rounded-2xl border border-[#ead8c0] px-3 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                          >
                            {product.isAvailable && product.stock > 0 ? 'Habis' : 'Ready'}
                          </button>

                          <button
                            onClick={() => handleDelete(product)}
                            className="rounded-2xl border border-red-200 px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ead8c0] p-5">
          <button
            onClick={closeProductAdmin}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup Admin Produk
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductAdminModal