import { usePosStore } from '../store/posStore'

function ProductCard({ product, onSelect }) {
  const addToast = usePosStore((state) => state.addToast)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleClick = () => {
    if (!product.isAvailable && product.stock > 0 || product.stock <= 0) {
      addToast({
        title: 'Produk habis',
        message: `${product.name} sedang tidak tersedia.`,
        type: 'warning',
      })

      return
    }

    onSelect(product)
  }

  return (
    <button
      onClick={handleClick}
      className={`group relative rounded-3xl border border-[#ead8c0] bg-white p-4 text-left shadow-sm transition duration-300 ${
        product.isAvailable && product.stock > 0
          ? 'hover:-translate-y-1 hover:shadow-xl'
          : 'cursor-not-allowed opacity-60'
      }`}
    >
      {!product.isAvailable && product.stock > 0 && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
          Habis
        </div>
      )}

      <div className="flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8ead8] to-[#d8b98f] text-5xl">
        {product.image}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
            {product.category}
          </p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              product.isAvailable && product.stock > 0 && product.stock > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {product.isAvailable && product.stock > 0 && product.stock > 0 ? `Stok ${product.stock}` : 'Sold Out'}
          </span>
        </div>

        <h3 className="mt-2 text-xl font-bold text-[#2d1810]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-[#7b5d4a]">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-bold text-[#6f3f24]">
            {formatCurrency(product.price)}
          </p>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              product.isAvailable && product.stock > 0
                ? 'bg-[#2d1810] text-white group-hover:bg-[#b88746]'
                : 'bg-[#c8b6a4] text-white'
            }`}
          >
            {product.isAvailable && product.stock > 0 ? 'Pilih' : 'Habis'}
          </span>
        </div>
      </div>
    </button>
  )
}

export default ProductCard