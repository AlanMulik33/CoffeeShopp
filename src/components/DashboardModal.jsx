import { useMemo } from 'react'
import { usePosStore } from '../store/posStore'
import ReportDateFilter from './ReportDateFilter'
import OrderStatusBadge from './OrderStatusBadge'
import { filterOrdersByDate } from '../utils/dateFilter'

function DashboardModal() {
  const orderHistory = usePosStore((state) => state.orderHistory)
  const reportFilterMode = usePosStore((state) => state.reportFilterMode)
  const reportStartDate = usePosStore((state) => state.reportStartDate)
  const reportEndDate = usePosStore((state) => state.reportEndDate)
  const dashboardOpen = usePosStore((state) => state.dashboardOpen)
  const closeDashboard = usePosStore((state) => state.closeDashboard)
  const showReceiptFromHistory = usePosStore(
    (state) => state.showReceiptFromHistory
  )

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const dashboardData = useMemo(() => {
    const filteredOrders = filterOrdersByDate(
        orderHistory,
        reportFilterMode,
        reportStartDate,
        reportEndDate
    )

    const totalTransactions = filteredOrders.length

    const totalRevenue = filteredOrders.reduce((total, order) => {
      return total + (order.total || 0)
    }, 0)

    const totalDiscount = filteredOrders.reduce((total, order) => {
      return total + (order.discount || 0)
    }, 0)

    const totalItems = filteredOrders.reduce((total, order) => {
      return (
        total +
        order.items.reduce((itemTotal, item) => {
          return itemTotal + item.quantity
        }, 0)
      )
    }, 0)

    const averageTransaction =
      totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0

    const productMap = {}

    orderHistory.forEach((order) => {
      order.items.forEach((item) => {
        if (!productMap[item.name]) {
          productMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          }
        }

        productMap[item.name].quantity += item.quantity
        productMap[item.name].revenue += item.price * item.quantity
      })
    })

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    const bestSeller = topProducts[0] || null

    const paymentMap = {}

    orderHistory.forEach((order) => {
      const method = order.paymentMethod || 'Tidak diketahui'
      paymentMap[method] = (paymentMap[method] || 0) + 1
    })

    const paymentStats = Object.entries(paymentMap)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)

    const topPayment = paymentStats[0] || null

    const statusMap = {
        New: 0,
        Preparing: 0,
        Ready: 0,
        Completed: 0,
        }

        filteredOrders.forEach((order) => {
        const status = order.status || 'New'

        if (!statusMap[status]) {
            statusMap[status] = 0
        }

        statusMap[status] += 1
        })

        const statusStats = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
        }))

    const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    revenue: 0,
    transactions: 0,
    items: 0,
    }))

    filteredOrders.forEach((order) => {
    const orderDate = order.createdAtISO ? new Date(order.createdAtISO) : null

    const hour =
        Number.isInteger(order.createdHour) && order.createdHour >= 0
        ? order.createdHour
        : orderDate
            ? orderDate.getHours()
            : null

    if (hour === null || Number.isNaN(hour)) {
        return
    }

    const itemCount = order.items.reduce((total, item) => {
        return total + item.quantity
    }, 0)

    hourlySales[hour].revenue += order.total || 0
    hourlySales[hour].transactions += 1
    hourlySales[hour].items += itemCount
    })

    const activeHourlySales = hourlySales.filter((hourData) => {
    return hourData.revenue > 0 || hourData.transactions > 0
    })

    const maxHourlyRevenue =
    activeHourlySales.length > 0
        ? Math.max(...activeHourlySales.map((hourData) => hourData.revenue))
        : 0

    const recentOrders = filteredOrders.slice(0, 5)

    return {
    filteredOrders,
    totalTransactions,
    totalRevenue,
    totalDiscount,
    totalItems,
    averageTransaction,
    topProducts,
    bestSeller,
    paymentStats,
    topPayment,
    statusStats,
    hourlySales,
    activeHourlySales,
    maxHourlyRevenue,
    recentOrders,
    }
  }, [orderHistory, reportFilterMode, reportStartDate, reportEndDate])

  if (!dashboardOpen) {
    return null
  }

  const maxProductQuantity =
    dashboardData.topProducts[0]?.quantity > 0
      ? dashboardData.topProducts[0].quantity
      : 1

  const maxPaymentCount =
    dashboardData.paymentStats[0]?.count > 0
      ? dashboardData.paymentStats[0].count
      : 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-[#ead8c0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Sales Dashboard
              </p>

              <h2 className="mt-1 text-3xl font-black text-[#2d1810]">
                Dashboard Penjualan
              </h2>

              <p className="mt-2 text-sm text-[#7b5d4a]">
                Ringkasan sementara dari riwayat order frontend.
              </p>
            </div>

            <button
              onClick={closeDashboard}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="coffee-scrollbar max-h-[74vh] overflow-y-auto p-6">
            <ReportDateFilter totalData={dashboardData.filteredOrders.length} />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Transaksi
              </p>
              <p className="mt-3 text-4xl font-black text-[#2d1810]">
                {dashboardData.totalTransactions}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Pendapatan
              </p>
              <p className="mt-3 text-2xl font-black text-[#2d1810]">
                {formatCurrency(dashboardData.totalRevenue)}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Item Terjual
              </p>
              <p className="mt-3 text-4xl font-black text-[#2d1810]">
                {dashboardData.totalItems}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Rata-rata Order
              </p>
              <p className="mt-3 text-2xl font-black text-[#2d1810]">
                {formatCurrency(dashboardData.averageTransaction)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Total Diskon
              </p>
              <p className="mt-3 text-2xl font-black text-green-700">
                {formatCurrency(dashboardData.totalDiscount)}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Produk Terlaris
              </p>
              <p className="mt-3 text-2xl font-black text-[#2d1810]">
                {dashboardData.bestSeller
                  ? dashboardData.bestSeller.name
                  : '-'}
              </p>
              <p className="mt-1 text-sm text-[#7b5d4a]">
                {dashboardData.bestSeller
                  ? `${dashboardData.bestSeller.quantity} item terjual`
                  : 'Belum ada data'}
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Payment Favorit
              </p>
              <p className="mt-3 text-2xl font-black text-[#2d1810]">
                {dashboardData.topPayment
                  ? dashboardData.topPayment.method
                  : '-'}
              </p>
              <p className="mt-1 text-sm text-[#7b5d4a]">
                {dashboardData.topPayment
                  ? `${dashboardData.topPayment.count} transaksi`
                  : 'Belum ada data'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
            <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Order Status
                </p>

                <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                Status Antrian Order
                </h3>

                <p className="mt-1 text-sm text-[#7b5d4a]">
                Ringkasan status order dari Kitchen Display.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {dashboardData.statusStats.map((item) => (
                <div
                    key={item.status}
                    className="rounded-2xl border border-[#ead8c0] bg-white p-4"
                >
                    <OrderStatusBadge status={item.status} />

                    <p className="mt-3 text-3xl font-black text-[#2d1810]">
                    {item.count}
                    </p>

                    <p className="mt-1 text-sm text-[#7b5d4a]">
                    order
                    </p>
                </div>
                ))}
            </div>
            </div>

          <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Hourly Sales
                </p>

                <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                    Grafik Penjualan Per Jam
                </h3>

                <p className="mt-1 text-sm text-[#7b5d4a]">
                    Omzet dan jumlah transaksi berdasarkan jam order.
                </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                    Peak Hour
                </p>

                <p className="font-black text-[#2d1810]">
                    {dashboardData.activeHourlySales.length > 0
                    ? dashboardData.activeHourlySales
                        .slice()
                        .sort((a, b) => b.revenue - a.revenue)[0].label
                    : '-'}
                </p>
                </div>
            </div>

            {dashboardData.activeHourlySales.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                <div className="text-5xl">📈</div>

                <p className="mt-3 font-bold text-[#2d1810]">
                    Belum ada data grafik
                </p>

                <p className="mt-1 text-sm text-[#7b5d4a]">
                    Buat transaksi dulu agar grafik penjualan per jam muncul.
                </p>
                </div>
            ) : (
                <div className="space-y-4">
                {dashboardData.activeHourlySales.map((hourData) => {
                    const width =
                    dashboardData.maxHourlyRevenue > 0
                        ? Math.max(
                            8,
                            (hourData.revenue / dashboardData.maxHourlyRevenue) * 100
                        )
                        : 0

                    return (
                    <div key={hourData.hour}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div>
                            <p className="font-black text-[#2d1810]">
                            {hourData.label}
                            </p>

                            <p className="text-xs text-[#7b5d4a]">
                            {hourData.transactions} transaksi • {hourData.items} item
                            </p>
                        </div>

                        <p className="font-black text-[#6f3f24]">
                            {formatCurrency(hourData.revenue)}
                        </p>
                        </div>

                        <div className="h-4 overflow-hidden rounded-full bg-white">
                        <div
                            className="h-full rounded-full bg-[#b88746]"
                            style={{ width: `${width}%` }}
                        />
                        </div>
                    </div>
                    )
                })}
                </div>
            )}
            </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                  Top Product
                </p>
                <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                  Produk Terlaris
                </h3>
              </div>

              {dashboardData.topProducts.length === 0 ? (
                <p className="text-sm text-[#7b5d4a]">
                  Belum ada produk terjual.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.topProducts.map((product) => {
                    const width = Math.max(
                      8,
                      (product.quantity / maxProductQuantity) * 100
                    )

                    return (
                      <div key={product.name}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-[#2d1810]">
                            {product.name}
                          </span>
                          <span className="text-[#7b5d4a]">
                            {product.quantity} item
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#b88746]"
                            style={{ width: `${width}%` }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-[#7b5d4a]">
                          Revenue item: {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                  Payment Method
                </p>
                <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                  Metode Pembayaran
                </h3>
              </div>

              {dashboardData.paymentStats.length === 0 ? (
                <p className="text-sm text-[#7b5d4a]">
                  Belum ada pembayaran.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.paymentStats.map((payment) => {
                    const width = Math.max(
                      8,
                      (payment.count / maxPaymentCount) * 100
                    )

                    return (
                      <div key={payment.method}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-[#2d1810]">
                            {payment.method}
                          </span>
                          <span className="text-[#7b5d4a]">
                            {payment.count} transaksi
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#6f3f24]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Recent Transaction
              </p>
              <h3 className="mt-1 text-xl font-black text-[#2d1810]">
                5 Transaksi Terbaru
              </h3>
            </div>

            {dashboardData.recentOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#ead8c0] bg-white p-8 text-center">
                <div className="text-5xl">📊</div>
                <p className="mt-3 font-bold text-[#2d1810]">
                  Belum ada transaksi
                </p>
                <p className="mt-1 text-sm text-[#7b5d4a]">
                  Buat order dulu agar dashboard terisi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentOrders.map((order) => (
                  <div
                    key={`${order.queueCode}-${order.createdAt}`}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 md:flex-row md:items-center"
                  >
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                            {order.queueCode}
                        </p>

                        <OrderStatusBadge status={order.status || 'New'} />
                        </div>

                        <p className="mt-2 font-black text-[#2d1810]">
                        {order.orderType} • {order.paymentMethod}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <p className="text-lg font-black text-[#6f3f24]">
                        {formatCurrency(order.total)}
                      </p>

                      <button
                        onClick={() => showReceiptFromHistory(order)}
                        className="rounded-2xl bg-[#6f3f24] px-4 py-3 text-sm font-bold text-white hover:bg-[#4b2818]"
                      >
                        Struk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#ead8c0] p-5">
          <button
            onClick={closeDashboard}
            className="w-full rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardModal