import { happyHourPromos } from '../data/happyHourPromos'
import { vouchers } from '../data/vouchers'
import { usePosStore } from '../store/posStore'
import {
  calculateHappyHourDiscount,
  getActiveHappyHourPromo,
} from '../utils/happyHour'

const paymentMethods = ['Tunai', 'QRIS', 'Kartu', 'GoPay', 'OVO', 'Dana']

function CartPanel({ onEditItem }) {
  const cart = usePosStore((state) => state.cart)

  const orderType = usePosStore((state) => state.orderType)
  const tableNumber = usePosStore((state) => state.tableNumber)
  const customerName = usePosStore((state) => state.customerName)
  const customerPhone = usePosStore((state) => state.customerPhone)
  const deliveryAddress = usePosStore((state) => state.deliveryAddress)

  const paymentMethod = usePosStore((state) => state.paymentMethod)
  const cashPaid = usePosStore((state) => state.cashPaid)

  const promoCode = usePosStore((state) => state.promoCode)
  const appliedVoucher = usePosStore((state) => state.appliedVoucher)
  const promoError = usePosStore((state) => state.promoError)

  const lastOrder = usePosStore((state) => state.lastOrder)

  const orderHistory = usePosStore((state) => state.orderHistory)
  const openHistory = usePosStore((state) => state.openHistory)

  const setOrderType = usePosStore((state) => state.setOrderType)
  const setTableNumber = usePosStore((state) => state.setTableNumber)
  const setCustomerName = usePosStore((state) => state.setCustomerName)
  const setCustomerPhone = usePosStore((state) => state.setCustomerPhone)
  const setDeliveryAddress = usePosStore((state) => state.setDeliveryAddress)

  const setPaymentMethod = usePosStore((state) => state.setPaymentMethod)
  const setCashPaid = usePosStore((state) => state.setCashPaid)

  const setPromoCode = usePosStore((state) => state.setPromoCode)
  const applyVoucher = usePosStore((state) => state.applyVoucher)
  const removeVoucher = usePosStore((state) => state.removeVoucher)

  const increaseQuantity = usePosStore((state) => state.increaseQuantity)
  const decreaseQuantity = usePosStore((state) => state.decreaseQuantity)
  const removeFromCart = usePosStore((state) => state.removeFromCart)
  const clearCart = usePosStore((state) => state.clearCart)
  const createTemporaryOrder = usePosStore((state) => state.createTemporaryOrder)
  const openConfirmDialog = usePosStore((state) => state.openConfirmDialog)
  const addToast = usePosStore((state) => state.addToast)

  const handleRemoveItem = (item) => {
    openConfirmDialog({
      title: 'Hapus item?',
      message: `${item.name} akan dihapus dari keranjang.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        removeFromCart(item.cartKey)

        addToast({
          title: 'Item dihapus',
          message: `${item.name} berhasil dihapus dari keranjang.`,
          type: 'warning',
        })
      },
    })
  }

  const handleClearCart = () => {
    openConfirmDialog({
      title: 'Kosongkan keranjang?',
      message:
        'Semua item, voucher, dan data pembayaran di keranjang saat ini akan dihapus.',
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const parseNumber = (value) => {
    return Number(String(value).replace(/\D/g, '')) || 0
  }

  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const calculateVoucherDiscount = () => {
    if (!appliedVoucher) {
      return 0
    }

    if (appliedVoucher.type === 'nominal') {
      return Math.min(appliedVoucher.value, subtotal)
    }

    const percentDiscount = Math.round(subtotal * (appliedVoucher.value / 100))

    if (appliedVoucher.maxDiscount) {
      return Math.min(percentDiscount, appliedVoucher.maxDiscount)
    }

    return percentDiscount
  }

  const voucherDiscount = calculateVoucherDiscount()
  const activeHappyHourPromo = getActiveHappyHourPromo(happyHourPromos)
  const happyHourDiscount = calculateHappyHourDiscount(cart, activeHappyHourPromo)

  const discount = Math.min(voucherDiscount + happyHourDiscount, subtotal)
  const taxableAmount = Math.max(subtotal - discount, 0)
  const tax = Math.round(taxableAmount * 0.11)
  const total = taxableAmount + tax

  const cashPaidNumber = parseNumber(cashPaid)
  const change = paymentMethod === 'Tunai' ? cashPaidNumber - total : 0

  const dineInValid = orderType !== 'Dine In' || tableNumber.trim() !== ''

  const deliveryValid =
    orderType !== 'Delivery' ||
    (customerName.trim() !== '' &&
      customerPhone.trim() !== '' &&
      deliveryAddress.trim() !== '')

  const paymentValid =
    paymentMethod !== 'Tunai' || (cashPaidNumber > 0 && cashPaidNumber >= total)

  const canCreateOrder =
    cart.length > 0 && dineInValid && deliveryValid && paymentValid

  const handleCashChange = (event) => {
    const onlyNumber = event.target.value.replace(/\D/g, '')
    setCashPaid(onlyNumber)
  }

  const handleApplyVoucher = () => {
    const normalizedCode = promoCode.trim().toUpperCase()

    const foundVoucher = vouchers.find(
      (voucher) => voucher.code === normalizedCode
    )

    applyVoucher(foundVoucher, subtotal)
  }

  const handleCreateOrder = () => {
    if (!canCreateOrder) {
      return
    }

    const order = createTemporaryOrder({
      subtotal,
      voucherDiscount,
      happyHourPromo: activeHappyHourPromo,
      happyHourDiscount,
      discount,
      taxableAmount,
      tax,
      total,
      cashPaid: paymentMethod === 'Tunai' ? cashPaidNumber : total,
      change: paymentMethod === 'Tunai' ? change : 0,
    })

    addToast({
      title: 'Order berhasil',
      message: `Nomor antrian ${order.queueCode} sudah dibuat.`,
      type: 'success',
    })
  }

  return (
    <aside className="flex h-full min-h-[720px] flex-col overflow-hidden rounded-3xl border border-[#ead8c0] bg-white shadow-xl lg:min-h-0">
      <div className="shrink-0 border-b border-[#ead8c0] p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
          Order Summary
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-black text-[#2d1810]">Keranjang</h2>
          <button
            onClick={openHistory}
            className="mt-4 w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-4 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Riwayat Order ({orderHistory.length})
          </button>

          {lastOrder && (
            <div className="rounded-2xl bg-[#fff4e7] px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b88746]">
                Last Queue
              </p>
              <p className="text-lg font-black text-[#2d1810]">
                {lastOrder.queueCode}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="coffee-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
        <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-4">
          <p className="mb-3 font-bold text-[#2d1810]">Mode Order</p>

          <div className="grid grid-cols-3 gap-2">
            {['Dine In', 'Take Away', 'Delivery'].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                  orderType === type
                    ? 'border-[#2d1810] bg-[#2d1810] text-white'
                    : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {orderType === 'Dine In' && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                Nomor Meja
              </label>

              <input
                type="text"
                value={tableNumber}
                onChange={(event) => setTableNumber(event.target.value)}
                placeholder="Contoh: 05"
                className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
              />

              {!dineInValid && (
                <p className="mt-2 text-xs font-bold text-red-500">
                  Nomor meja wajib diisi untuk Dine In.
                </p>
              )}
            </div>
          )}

          {orderType === 'Delivery' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                  Nama Pelanggan
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Contoh: Agus"
                  className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                  Nomor HP
                </label>

                <input
                  type="text"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                  Alamat Delivery
                </label>

                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Contoh: Jl. Tukad Badung No. 10"
                  className="min-h-20 w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
                />
              </div>

              {!deliveryValid && (
                <p className="text-xs font-bold text-red-500">
                  Data delivery wajib lengkap.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-4">
          <p className="mb-3 font-bold text-[#2d1810]">Voucher / Promo</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="Contoh: KOPI10"
              className="min-w-0 flex-1 rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] uppercase outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
            />

            <button
              onClick={handleApplyVoucher}
              className="rounded-2xl bg-[#6f3f24] px-4 py-3 text-sm font-bold text-white hover:bg-[#4b2818]"
            >
              Pakai
            </button>
          </div>

          {appliedVoucher && (
            <div className="mt-3 rounded-2xl bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#2d1810]">
                    {appliedVoucher.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7b5d4a]">
                    Kode: {appliedVoucher.code}
                  </p>
                </div>

                <button
                  onClick={removeVoucher}
                  className="text-sm font-bold text-red-500"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}

          {promoError && (
            <p className="mt-2 text-xs font-bold text-red-500">
              {promoError}
            </p>
          )}

          <div className="mt-3 rounded-2xl bg-white p-4 text-xs text-[#7b5d4a]">
            <p className="font-bold text-[#2d1810]">Kode uji coba:</p>
            <p>KOPI10, HEMAT5000, LATTE20</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-4">
          <p className="mb-3 font-bold text-[#2d1810]">Pembayaran</p>

          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                  paymentMethod === method
                    ? 'border-[#2d1810] bg-[#2d1810] text-white'
                    : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {paymentMethod === 'Tunai' && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                Uang Diterima
              </label>

              <input
                type="text"
                value={cashPaid}
                onChange={handleCashChange}
                placeholder="Contoh: 100000"
                className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
              />

              <div className="mt-3 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
                  <span>Dibayar</span>
                  <span>{formatCurrency(cashPaidNumber)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between font-bold">
                  <span className={change < 0 ? 'text-red-500' : 'text-[#2d1810]'}>
                    Kembalian
                  </span>

                  <span className={change < 0 ? 'text-red-500' : 'text-[#6f3f24]'}>
                    {change < 0
                      ? `Kurang ${formatCurrency(Math.abs(change))}`
                      : formatCurrency(change)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod !== 'Tunai' && (
            <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-[#7b5d4a]">
              Pembayaran menggunakan {paymentMethod}. Pastikan pembayaran sudah
              berhasil sebelum order dibuat.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-4">
          <p className="mb-3 font-bold text-[#2d1810]">Happy Hour Otomatis</p>

          {activeHappyHourPromo ? (
            <div className="rounded-2xl bg-white p-4">
              <p className="font-bold text-[#2d1810]">
                {activeHappyHourPromo.name}
              </p>

              <p className="mt-1 text-sm text-[#7b5d4a]">
                {activeHappyHourPromo.description}
              </p>

              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Aktif {String(activeHappyHourPromo.startHour).padStart(2, '0')}.00 -{' '}
                {String(activeHappyHourPromo.endHour).padStart(2, '0')}.00
              </p>

              {happyHourDiscount > 0 ? (
                <p className="mt-3 font-bold text-green-700">
                  Diskon aktif: -{formatCurrency(happyHourDiscount)}
                </p>
              ) : (
                <p className="mt-3 text-sm text-[#7b5d4a]">
                  Promo aktif, tapi belum ada item yang sesuai kategori promo.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-4">
              <p className="font-bold text-[#2d1810]">Tidak ada promo aktif</p>
              <p className="mt-1 text-sm text-[#7b5d4a]">
                Happy Hour akan aktif otomatis sesuai jam yang ditentukan.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {cart.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-[#fffaf3] p-8 text-center">
              <div className="text-6xl">🧺</div>

              <h3 className="mt-4 text-xl font-bold text-[#2d1810]">
                Keranjang kosong
              </h3>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Klik menu kopi di sebelah kiri untuk menambahkan pesanan.
              </p>

              {lastOrder && (
                <div className="mt-5 rounded-2xl bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Order terakhir
                  </p>

                  <p className="mt-1 font-bold text-[#2d1810]">
                    {lastOrder.queueCode} • {lastOrder.orderType}
                  </p>

                  <p className="text-sm text-[#7b5d4a]">
                    {formatCurrency(lastOrder.total)} • {lastOrder.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartKey}
                className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-[#2d1810]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#b88746]">
                      {item.size}
                      {item.temperature ? ` • ${item.temperature}` : ''}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-[#7b5d4a]">
                      {item.sugar && <p>{item.sugar}</p>}
                      {item.ice && <p>{item.ice}</p>}

                      {item.addOns.length > 0 && (
                        <p>
                          Add-on:{' '}
                          {item.addOns.map((addOn) => addOn.name).join(', ')}
                        </p>
                      )}

                      {item.note && <p className="italic">Catatan: {item.note}</p>}
                    </div>

                    <p className="mt-3 text-sm text-[#7b5d4a]">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() => onEditItem(item)}
                    className="rounded-full px-3 py-1 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="rounded-full px-3 py-1 text-sm font-bold text-red-500 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.cartKey)}
                      className="h-10 w-10 rounded-full bg-[#ead8c0] text-lg font-bold text-[#2d1810]"
                    >
                      -
                    </button>

                    <span className="w-8 text-center text-lg font-black text-[#2d1810]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.cartKey)}
                      className="h-10 w-10 rounded-full bg-[#6f3f24] text-lg font-bold text-white"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-lg font-black text-[#6f3f24]">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#ead8c0] bg-white p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {voucherDiscount > 0 && (
            <div className="flex items-center justify-between text-sm font-bold text-green-700">
              <span>Diskon Voucher</span>
              <span>-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}

          {happyHourDiscount > 0 && (
            <div className="flex items-center justify-between text-sm font-bold text-green-700">
              <span>Diskon Happy Hour</span>
              <span>-{formatCurrency(happyHourDiscount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-[#7b5d4a]">
            <span>PPN 11%</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="border-t border-dashed border-[#ead8c0] pt-4">
            <div className="flex items-center justify-between text-xl font-black text-[#2d1810]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <button
          disabled={!canCreateOrder}
          onClick={handleCreateOrder}
          className="mt-5 w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white transition hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
        >
          Bayar & Buat Order
        </button>

        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
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