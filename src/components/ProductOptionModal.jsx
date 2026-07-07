import { useEffect, useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'

function ProductOptionModal({ product, editingItem, onClose }) {
  const addToCart = usePosStore((state) => state.addToCart)
  const updateCartItem = usePosStore((state) => state.updateCartItem)
  const addToast = usePosStore((state) => state.addToast)

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedTemperature, setSelectedTemperature] = useState('')
  const [selectedSugar, setSelectedSugar] = useState('')
  const [selectedIce, setSelectedIce] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!product) {
      return
    }

    if (editingItem) {
      setSelectedSize(editingItem.size || product.sizeOptions?.[0]?.name || '')
      setSelectedTemperature(
        editingItem.temperature || product.temperatureOptions?.[0] || ''
      )
      setSelectedSugar(editingItem.sugar || product.sugarOptions?.[0] || '')
      setSelectedIce(editingItem.ice || product.iceOptions?.[0] || '')
      setSelectedAddOns(editingItem.addOns || [])
      setQuantity(editingItem.quantity || 1)
      setNote(editingItem.note || '')
      return
    }

    setSelectedSize(product.sizeOptions?.[0]?.name || '')
    setSelectedTemperature(product.temperatureOptions?.[0] || '')
    setSelectedSugar(product.sugarOptions?.[0] || '')
    setSelectedIce(product.iceOptions?.[0] || '')
    setSelectedAddOns([])
    setQuantity(1)
    setNote('')
  }, [product, editingItem])

  const selectedSizeData = useMemo(() => {
    return product?.sizeOptions?.find((size) => size.name === selectedSize)
  }, [product, selectedSize])

  if (!product) {
    return null
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const showIceOptions =
    product.iceOptions.length > 0 &&
    selectedTemperature &&
    selectedTemperature !== 'Hot'

  const sizeAdditionalPrice = selectedSizeData?.additionalPrice || 0

  const addOnTotal = selectedAddOns.reduce((total, addOn) => {
    return total + addOn.price
  }, 0)

  const finalPrice = product.price + sizeAdditionalPrice + addOnTotal
  const lineTotal = finalPrice * quantity

  const toggleAddOn = (addOn) => {
    const alreadySelected = selectedAddOns.some(
      (selected) => selected.name === addOn.name
    )

    if (alreadySelected) {
      setSelectedAddOns((current) =>
        current.filter((selected) => selected.name !== addOn.name)
      )
    } else {
      setSelectedAddOns((current) => [...current, addOn])
    }
  }

  const handleSubmit = () => {
    if (!product.isAvailable) {
      addToast({
        title: 'Produk habis',
        message: `${product.name} sedang tidak tersedia.`,
        type: 'warning',
      })

      onClose()
      return
    }
    const payload = {
      size: selectedSize,
      temperature: selectedTemperature,
      sugar: selectedSugar,
      ice: showIceOptions ? selectedIce : '',
      addOns: selectedAddOns,
      note: note.trim(),
      quantity,
      finalPrice,
    }

    if (editingItem) {
      updateCartItem(editingItem.cartKey, product, payload)

      addToast({
        title: 'Item diperbarui',
        message: `${product.name} berhasil diperbarui di keranjang.`,
        type: 'success',
      })

      onClose()
      return
    }

    addToCart(product, payload)

    addToast({
      title: 'Item ditambahkan',
      message: `${quantity}x ${product.name} masuk ke keranjang.`,
      type: 'success',
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[#fffaf3] shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                {editingItem ? 'Edit Order' : 'Customize Order'}
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                {product.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-white px-4 py-2 font-bold text-[#6f3f24] shadow-sm hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar max-h-[60vh] space-y-6 overflow-y-auto p-6">
          <div>
            <p className="mb-3 font-bold text-[#2d1810]">Ukuran</p>

            <div className="grid grid-cols-3 gap-3">
              {product.sizeOptions.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    selectedSize === size.name
                      ? 'border-[#2d1810] bg-[#2d1810] text-white'
                      : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                  }`}
                >
                  <span className="block">{size.name}</span>

                  {size.additionalPrice > 0 && (
                    <span className="mt-1 block text-xs opacity-80">
                      +{formatCurrency(size.additionalPrice)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {product.temperatureOptions.length > 0 && (
            <div>
              <p className="mb-3 font-bold text-[#2d1810]">Suhu</p>

              <div className="grid grid-cols-3 gap-3">
                {product.temperatureOptions.map((temperature) => (
                  <button
                    key={temperature}
                    onClick={() => setSelectedTemperature(temperature)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selectedTemperature === temperature
                        ? 'border-[#2d1810] bg-[#2d1810] text-white'
                        : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                    }`}
                  >
                    {temperature}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sugarOptions.length > 0 && (
            <div>
              <p className="mb-3 font-bold text-[#2d1810]">Sugar Level</p>

              <div className="grid grid-cols-3 gap-3">
                {product.sugarOptions.map((sugar) => (
                  <button
                    key={sugar}
                    onClick={() => setSelectedSugar(sugar)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selectedSugar === sugar
                        ? 'border-[#2d1810] bg-[#2d1810] text-white'
                        : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                    }`}
                  >
                    {sugar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showIceOptions && (
            <div>
              <p className="mb-3 font-bold text-[#2d1810]">Ice Level</p>

              <div className="grid grid-cols-3 gap-3">
                {product.iceOptions.map((ice) => (
                  <button
                    key={ice}
                    onClick={() => setSelectedIce(ice)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selectedIce === ice
                        ? 'border-[#2d1810] bg-[#2d1810] text-white'
                        : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                    }`}
                  >
                    {ice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.addOnOptions.length > 0 && (
            <div>
              <p className="mb-3 font-bold text-[#2d1810]">Add-on</p>

              <div className="grid grid-cols-2 gap-3">
                {product.addOnOptions.map((addOn) => {
                  const active = selectedAddOns.some(
                    (selected) => selected.name === addOn.name
                  )

                  return (
                    <button
                      key={addOn.name}
                      onClick={() => toggleAddOn(addOn)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                        active
                          ? 'border-[#2d1810] bg-[#2d1810] text-white'
                          : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                      }`}
                    >
                      <span className="block">{addOn.name}</span>
                      <span className="mt-1 block text-xs opacity-80">
                        +{formatCurrency(addOn.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <p className="mb-3 font-bold text-[#2d1810]">Catatan Khusus</p>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: less sugar, no ice, jangan terlalu panas..."
              className="min-h-24 w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
            />
          </div>

          <div>
            <p className="mb-3 font-bold text-[#2d1810]">Jumlah</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-11 w-11 rounded-full bg-[#ead8c0] text-xl font-bold text-[#2d1810]"
              >
                -
              </button>

              <span className="w-10 text-center text-xl font-black text-[#2d1810]">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((current) => current + 1)}
                className="h-11 w-11 rounded-full bg-[#6f3f24] text-xl font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
              <span>Harga dasar</span>
              <span>{formatCurrency(product.price)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-[#7b5d4a]">
              <span>Tambahan ukuran</span>
              <span>{formatCurrency(sizeAdditionalPrice)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-[#7b5d4a]">
              <span>Add-on</span>
              <span>{formatCurrency(addOnTotal)}</span>
            </div>

            <div className="mt-3 border-t border-dashed border-[#ead8c0] pt-3">
              <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
                <span>Harga satuan</span>
                <span>{formatCurrency(finalPrice)}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xl font-black text-[#2d1810]">
                <span>Total item</span>
                <span>{formatCurrency(lineTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#ead8c0] p-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
          >
            {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductOptionModal