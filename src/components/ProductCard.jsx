import { usePosStore } from '../store/posStore'

function ProductCard({ product }) {
  const addToCart = usePosStore((state) => state.addToCart)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <button
      onClick={() => addToCart(product)}
      className="group rounded-3xl border border-[#ead8c0] bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8ead8] to-[#d8b98f] text-5xl">
        {product.image}
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
          {product.category}
        </p>

        <h3 className="mt-1 text-xl font-bold text-[#2d1810]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-[#7b5d4a]">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-bold text-[#6f3f24]">
            {formatCurrency(product.price)}
          </p>

          <span className="rounded-full bg-[#2d1810] px-4 py-2 text-sm font-bold text-white transition group-hover:bg-[#b88746]">
            Tambah
          </span>
        </div>
      </div>
    </button>
  )
}

export default ProductCard