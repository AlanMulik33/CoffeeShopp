import { useEffect, useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'

function ProductOptionModal({ product, onClose }) {
  const addToCart = usePosStore((state) => state.addToCart)

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedTemperature, setSelectedTemperature] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizeOptions?.[0]?.name || '')
      setSelectedTemperature(product.temperatureOptions?.[0] || '')
      setQuantity(1)
    }
  }, [product])

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

  const additionalPrice = selectedSizeData?.additionalPrice || 0
  const finalPrice = product.price + additionalPrice
  const lineTotal = finalPrice * quantity

  const handleAddToCart = () => {
    addToCart(product, {
      size: selectedSize,
      temperature: selectedTemperature,
      quantity,
      finalPrice,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#fffaf3] shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Customize Order
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

        <div className="space-y-6 p-6">
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
              <span>Harga satuan</span>
              <span>{formatCurrency(finalPrice)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xl font-black text-[#2d1810]">
              <span>Total item</span>
              <span>{formatCurrency(lineTotal)}</span>
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
            onClick={handleAddToCart}
            className="flex-1 rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
          >
            Tambahkan
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductOptionModal