import { useMemo } from 'react'
import { usePosStore } from '../store/posStore'

const statusColumns = [
  {
    status: 'New',
    title: 'Order Baru',
    description: 'Order baru masuk dari kasir.',
  },
  {
    status: 'Preparing',
    title: 'Sedang Dibuat',
    description: 'Barista sedang menyiapkan pesanan.',
  },
  {
    status: 'Ready',
    title: 'Siap Diambil',
    description: 'Pesanan sudah siap.',
  },
]

function KitchenDisplayModal() {
  const orderHistory = usePosStore((state) => state.orderHistory)
  const kitchenOpen = usePosStore((state) => state.kitchenOpen)
  const closeKitchen = usePosStore((state) => state.closeKitchen)
  const updateOrderStatus = usePosStore((state) => state.updateOrderStatus)
  const addToast = usePosStore((state) => state.addToast)

  const kitchenData = useMemo(() => {
    const activeOrders = orderHistory.filter((order) => {
      return order.status !== 'Completed'
    })

    const completedOrders = orderHistory.filter((order) => {
      return order.status === 'Completed'
    })

    const groupedOrders = statusColumns.map((column) => ({
      ...column,
      orders: activeOrders.filter((order) => {
        const status = order.status || 'New'
        return status === column.status
      }),
    }))

    return {
      activeOrders,
      completedOrders,
      groupedOrders,
    }
  }, [orderHistory])

  if (!kitchenOpen) {
    return null
  }

  const getOrderKey = (order) => {
    return order.orderId || order.queueCode
  }

  const handleStatusChange = (order, status) => {
    const orderId = getOrderKey(order)

    updateOrderStatus(orderId, status)

    addToast({
      title: 'Status order diperbarui',
      message: `${order.queueCode} sekarang ${status}.`,
      type: 'success',
    })
  }

  const getNextAction = (status) => {
    if (!status || status === 'New') {
      return {
        nextStatus: 'Preparing',
        label: 'Mulai Buat',
      }
    }

    if (status === 'Preparing') {
      return {
        nextStatus: 'Ready',
        label: 'Tandai Ready',
      }
    }

    if (status === 'Ready') {
      return {
        nextStatus: 'Completed',
        label: 'Selesaikan',
      }
    }

    return null
  }

  const getOrderMeta = (order) => {
    if (order.orderType === 'Dine In') {
      return `Meja ${order.tableNumber || '-'}`
    }

    if (order.orderType === 'Delivery') {
      return order.customerName || 'Delivery'
    }

    return 'Take Away'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Kitchen Display
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Antrian Barista
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Kelola status order dari kasir sampai pesanan selesai.
              </p>
            </div>

            <button
              onClick={closeKitchen}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar max-h-[74vh] overflow-y-auto p-6">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Order Aktif
              </p>
              <p className="mt-2 text-4xl font-black text-[#2d1810]">
                {kitchenData.activeOrders.length}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Ready
              </p>
              <p className="mt-2 text-4xl font-black text-[#2d1810]">
                {
                  kitchenData.activeOrders.filter(
                    (order) => order.status === 'Ready'
                  ).length
                }
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Selesai
              </p>
              <p className="mt-2 text-4xl font-black text-[#2d1810]">
                {kitchenData.completedOrders.length}
              </p>
            </div>
          </div>

          {kitchenData.activeOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-[#fffaf3] p-10 text-center">
              <div className="text-6xl">☕</div>

              <h3 className="mt-4 text-xl font-black text-[#2d1810]">
                Belum ada antrian aktif
              </h3>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Order yang berhasil dibayar akan muncul di layar barista.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {kitchenData.groupedOrders.map((column) => (
                <div
                  key={column.status}
                  className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5"
                >
                  <div className="mb-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-[#2d1810]">
                        {column.title}
                      </h3>

                      <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#6f3f24]">
                        {column.orders.length}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#7b5d4a]">
                      {column.description}
                    </p>
                  </div>

                  {column.orders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-6 text-center text-sm text-[#7b5d4a]">
                      Tidak ada order.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {column.orders.map((order) => {
                        const action = getNextAction(order.status || 'New')

                        return (
                          <div
                            key={getOrderKey(order)}
                            className="rounded-3xl border border-[#ead8c0] bg-white p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                                  {order.queueCode}
                                </p>

                                <h4 className="mt-1 text-2xl font-black text-[#2d1810]">
                                  {getOrderMeta(order)}
                                </h4>

                                <p className="mt-1 text-sm text-[#7b5d4a]">
                                  {order.orderType} • {order.paymentMethod}
                                </p>
                              </div>

                              <span className="rounded-full bg-[#fff4e7] px-3 py-2 text-xs font-bold text-[#6f3f24]">
                                {order.status || 'New'}
                              </span>
                            </div>

                            <div className="mt-4 space-y-3">
                              {order.items.map((item) => (
                                <div
                                  key={item.cartKey}
                                  className="rounded-2xl bg-[#fffaf3] p-4"
                                >
                                  <div className="flex justify-between gap-3">
                                    <p className="font-black text-[#2d1810]">
                                      {item.name}
                                    </p>

                                    <p className="font-black text-[#6f3f24]">
                                      x{item.quantity}
                                    </p>
                                  </div>

                                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#b88746]">
                                    {item.size}
                                    {item.temperature
                                      ? ` • ${item.temperature}`
                                      : ''}
                                  </p>

                                  <div className="mt-2 space-y-1 text-xs text-[#7b5d4a]">
                                    {item.sugar && <p>{item.sugar}</p>}
                                    {item.ice && <p>{item.ice}</p>}

                                    {item.addOns.length > 0 && (
                                      <p>
                                        Add-on:{' '}
                                        {item.addOns
                                          .map((addOn) => addOn.name)
                                          .join(', ')}
                                      </p>
                                    )}

                                    {item.note && (
                                      <p className="font-bold italic text-[#2d1810]">
                                        Catatan: {item.note}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-5 flex gap-3">
                              {action && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(order, action.nextStatus)
                                  }
                                  className="flex-1 rounded-2xl bg-[#6f3f24] px-4 py-3 text-sm font-bold text-white hover:bg-[#4b2818]"
                                >
                                  {action.label}
                                </button>
                              )}

                              {order.status !== 'Completed' && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(order, 'Completed')
                                  }
                                  className="rounded-2xl border border-[#ead8c0] px-4 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
                                >
                                  Done
                                </button>
                              )}
                            </div>

                            {order.statusUpdatedAt && (
                              <p className="mt-3 text-xs text-[#7b5d4a]">
                                Update: {order.statusUpdatedAt}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#ead8c0] p-5">
          <button
            onClick={closeKitchen}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup Kitchen Display
          </button>
        </div>
      </div>
    </div>
  )
}

export default KitchenDisplayModal