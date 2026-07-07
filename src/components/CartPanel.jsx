import { usePosStore } from '../store/posStore'

function CartPanel() {
  const cart = usePosStore((state) => state.cart)
  const increaseQuantity = usePosStore((state) => state.increaseQuantity)
  const decreaseQuantity = usePosStore((state) => state.decreaseQuantity)
  const removeFromCart = usePosStore((state) => state.removeFromCart)
  const clearCart = usePosStore((state) => state.clearCart)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const tax = Math.round(subtotal * 0.11)
  const total = subtotal + tax

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-[#ead8c0] bg-white shadow-xl">
      <div className="border-b border-[#ead8c0] p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
          Order Summary
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#2d1810]">
          Keranjang
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-6xl">🧺</div>
            <h3 className="mt-4 text-xl font-bold text-[#2d1810]">
              Keranjang kosong
            </h3>
            <p className="mt-2 text-sm text-[#7b5d4a]">
              Klik menu kopi di sebelah kiri untuk menambahkan pesanan.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartKey}
              className="rounded-2xl border border-[#ead8c0] bg-[#fffaf3] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#2d1810]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    {item.size}
                    {item.temperature ? ` • ${item.temperature}` : ''}
                  </p>

                  <div className="mt-2 space-y-1 text-xs text-[#7b5d4a]">
                    {item.sugar && <p>{item.sugar}</p>}
                    {item.ice && <p>{item.ice}</p>}

                    {item.addOns.length > 0 && (
                      <p>
                        Add-on:{' '}
                        {item.addOns.map((addOn) => addOn.name).join(', ')}
                      </p>
                    )}

                    {item.note && (
                      <p className="italic">
                        Catatan: {item.note}
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-[#7b5d4a]">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartKey)}
                  className="rounded-full px-3 py-1 text-sm font-bold text-red-500 hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQuantity(item.cartKey)}
                    className="h-9 w-9 rounded-full bg-[#ead8c0] font-bold text-[#2d1810]"
                  >
                    -
                  </button>

                  <span className="w-8 text-center font-bold text-[#2d1810]">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item.cartKey)}
                    className="h-9 w-9 rounded-full bg-[#6f3f24] font-bold text-white"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold text-[#6f3f24]">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#ead8c0] p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
            <span>PPN 11%</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="border-t border-dashed border-[#ead8c0] pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-[#2d1810]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          className="mt-5 w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white transition hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
        >
          Bayar Sekarang
        </button>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="mt-3 w-full rounded-2xl border border-[#ead8c0] px-5 py-3 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>
    </aside>
  )
}

export default CartPanel