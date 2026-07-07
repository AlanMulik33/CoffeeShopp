import { usePosStore } from '../store/posStore'
import ReportDateFilter from './ReportDateFilter'
import OrderStatusBadge from './OrderStatusBadge'
import ResetDemoDataButton from './ResetDemoDataButton'
import { filterOrdersByDate } from '../utils/dateFilter'

function OrderHistoryModal() {
  const orderHistory = usePosStore((state) => state.orderHistory)
  const reportFilterMode = usePosStore((state) => state.reportFilterMode)
  const reportStartDate = usePosStore((state) => state.reportStartDate)
  const reportEndDate = usePosStore((state) => state.reportEndDate)
  const historyOpen = usePosStore((state) => state.historyOpen)
  const closeHistory = usePosStore((state) => state.closeHistory)
  const showReceiptFromHistory = usePosStore(
    (state) => state.showReceiptFromHistory
  )
  const cancelOrder = usePosStore((state) => state.cancelOrder)
  const openConfirmDialog = usePosStore((state) => state.openConfirmDialog)
  const addToast = usePosStore((state) => state.addToast)

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

  const getOrderKey = (order) => {
    return order.orderId || order.queueCode
    }

  const handleCancelOrder = (order) => {
    openConfirmDialog({
        title: `Batalkan order ${order.queueCode}?`,
        message:
        'Order akan diberi status Cancelled. Data transaksi tetap tersimpan di riwayat.',
        confirmText: 'Batalkan Order',
        cancelText: 'Kembali',
        variant: 'danger',
        onConfirm: () => {
        cancelOrder(getOrderKey(order))

        addToast({
            title: 'Order dibatalkan',
            message: `${order.queueCode} berhasil dibatalkan.`,
            type: 'warning',
        })
        },
    })
    }
   

  const filteredOrders = filterOrdersByDate(
    orderHistory,
    reportFilterMode,
    reportStartDate,
    reportEndDate
    )

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
        return
    }

  const headers = [
    'Nomor Antrian',
    'Status',
    'Update Status',
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

    const rows = filteredOrders.map((order) => {
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
        order.status || 'New',
        order.statusUpdatedAt || '',
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

  const totalRevenue = filteredOrders.reduce((total, order) => {
    return total + order.total
  }, 0)

  const totalItems = filteredOrders.reduce((total, order) => {
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

        <div className="coffee-scrollbar max-h-[70vh] overflow-y-auto p-6">
            <ReportDateFilter totalData={filteredOrders.length} />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Order
              </p>
              <p className="mt-2 text-3xl font-black text-[#2d1810]">
                {filteredOrders.length}
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

          {filteredOrders.length === 0 ? (
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
              {filteredOrders.map((order) => (
                <div
                  key={`${order.queueCode}-${order.createdAt}`}
                  className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                            {order.queueCode}
                        </p>

                        <OrderStatusBadge status={order.status || 'New'} />
                        </div>

                        <h3 className="mt-2 text-xl font-black text-[#2d1810]">
                        {order.orderType}
                        {order.orderType === 'Dine In' && order.tableNumber
                            ? ` • Meja ${order.tableNumber}`
                            : ''}
                        </h3>

                      <p className="mt-1 text-sm text-[#7b5d4a]">
                        {order.createdAt}
                      </p>

                      {order.statusUpdatedAt && (
                        <p className="mt-1 text-xs text-[#7b5d4a]">
                            Update status: {order.statusUpdatedAt}
                        </p>
                        )}

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

                    <div className="mt-3 flex flex-col gap-2">
                        <button
                            onClick={() => showReceiptFromHistory(order)}
                            className="rounded-2xl bg-[#6f3f24] px-5 py-3 text-sm font-bold text-white hover:bg-[#4b2818]"
                        >
                            Lihat Struk
                        </button>

                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <button
                            onClick={() => handleCancelOrder(order)}
                            className="rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
                            >
                            Batalkan
                            </button>
                        )}
                    </div>
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

        <div className="grid grid-cols-1 gap-3 border-t border-[#ead8c0] p-5 md:grid-cols-3">
        <ResetDemoDataButton fullWidth />

        <button
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
            className="w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818] disabled:cursor-not-allowed disabled:bg-[#c8b6a4]"
        >
            Export CSV
        </button>

        <button
            onClick={closeHistory}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
        >
            Tutup
        </button>
        </div>
      </div>
    </div>
  )
}

export default OrderHistoryModal