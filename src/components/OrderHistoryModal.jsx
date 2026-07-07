import { usePosStore } from '../store/posStore'

function OrderHistoryModal() {
  const orderHistory = usePosStore((state) => state.orderHistory)
  const historyOpen = usePosStore((state) => state.historyOpen)
  const closeHistory = usePosStore((state) => state.closeHistory)
  const showReceiptFromHistory = usePosStore(
    (state) => state.showReceiptFromHistory
  )

  if (!historyOpen) {
    return null
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const exportToCSV = () => {
    if (orderHistory.length === 0) {
        return
    }

    const headers = [
        'Nomor Antrian',
        'Waktu',
        'Tipe Order',
        'Nomor Meja',
        'Nama Pelanggan',
        'No HP',
        'Alamat Delivery',
        'Metode Pembayaran',
        'Subtotal',
        'Diskon Voucher',
        'Diskon Happy Hour',
        'Total Diskon',
        'PPN',
        'Total',
        'Item',
    ]

    const escapeCSV = (value) => {
        const stringValue = String(value ?? '')
        return `"${stringValue.replace(/"/g, '""')}"`
    }

    const rows = orderHistory.map((order) => {
        const itemText = order.items
        .map((item) => {
            const modifiers = [
            item.size,
            item.temperature,
            item.sugar,
            item.ice,
            item.addOns?.length > 0
                ? `Add-on: ${item.addOns.map((addOn) => addOn.name).join(', ')}`
                : '',
            item.note ? `Catatan: ${item.note}` : '',
            ]
            .filter(Boolean)
            .join(' | ')

            return `${item.name} x${item.quantity} (${modifiers})`
        })
        .join('; ')

        return [
        order.queueCode,
        order.createdAt,
        order.orderType,
        order.tableNumber || '',
        order.customerName || '',
        order.customerPhone || '',
        order.deliveryAddress || '',
        order.paymentMethod,
        order.subtotal,
        order.voucherDiscount || 0,
        order.happyHourDiscount || 0,
        order.discount || 0,
        order.tax,
        order.total,
        itemText,
        ].map(escapeCSV)
    })

    const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `riwayat-order-${date}.csv`
    link.click()

    URL.revokeObjectURL(url)
    }

  const totalRevenue = orderHistory.reduce((total, order) => {
    return total + order.total
  }, 0)

  const totalItems = orderHistory.reduce((total, order) => {
    return (
      total +
      order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0)
    )
  }, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Transaction History
              </p>
              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Riwayat Order
              </h2>
              <p className="mt-2 text-sm text-[#7b5d4a]">
                Daftar transaksi sementara selama aplikasi belum direfresh.
              </p>
            </div>

            <button
              onClick={closeHistory}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Order
              </p>
              <p className="mt-2 text-3xl font-black text-[#2d1810]">
                {orderHistory.length}
              </p>
            </div>

            <div className="rounded-3xl bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Item Terjual
              </p>
              <p className="mt-2 text-3xl font-black text-[#2d1810]">
                {totalItems}
              </p>
            </div>

            <div className="rounded-3xl bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Pendapatan
              </p>
              <p className="mt-2 text-xl font-black text-[#2d1810]">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          {orderHistory.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#ead8c0] bg-[#fffaf3] p-10 text-center">
              <div className="text-6xl">🧾</div>
              <h3 className="mt-4 text-xl font-bold text-[#2d1810]">
                Belum ada transaksi
              </h3>
              <p className="mt-2 text-sm text-[#7b5d4a]">
                Order yang sudah dibayar akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orderHistory.map((order) => (
                <div
                  key={`${order.queueCode}-${order.createdAt}`}
                  className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                        {order.queueCode}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                        {order.orderType}
                        {order.orderType === 'Dine In' && order.tableNumber
                          ? ` • Meja ${order.tableNumber}`
                          : ''}
                      </h3>

                      <p className="mt-1 text-sm text-[#7b5d4a]">
                        {order.createdAt}
                      </p>

                      <p className="mt-2 text-sm text-[#7b5d4a]">
                        {order.items.length} jenis item • {order.paymentMethod}
                      </p>

                      {order.voucher && (
                        <p className="mt-2 text-sm font-bold text-green-700">
                          Voucher: {order.voucher.code}
                        </p>
                      )}

                      {order.happyHourPromo && order.happyHourDiscount > 0 && (
                        <p className="mt-1 text-sm font-bold text-green-700">
                          Happy Hour: {order.happyHourPromo.code}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm text-[#7b5d4a]">Total</p>
                      <p className="text-2xl font-black text-[#6f3f24]">
                        {formatCurrency(order.total)}
                      </p>

                      <button
                        onClick={() => showReceiptFromHistory(order)}
                        className="mt-3 rounded-2xl bg-[#6f3f24] px-5 py-3 text-sm font-bold text-white hover:bg-[#4b2818]"
                      >
                        Lihat Struk
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-dashed border-[#ead8c0] pt-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.cartKey}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-[#7b5d4a]">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-bold text-[#2d1810]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#ead8c0] p-5">
        <button
            onClick={closeHistory}
            className="flex-1 rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
        >
            Tutup
        </button>

        <button
            onClick={exportToCSV}
            disabled={orderHistory.length === 0}
            className="flex-1 rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
        >
            Export CSV
        </button>
        </div>
      </div>
    </div>
  )
}

export default OrderHistoryModal