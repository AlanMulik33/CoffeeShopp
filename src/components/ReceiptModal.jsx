import { usePosStore } from '../store/posStore'

function ReceiptModal() {
  const lastOrder = usePosStore((state) => state.lastOrder)
  const receiptOpen = usePosStore((state) => state.receiptOpen)
  const closeReceipt = usePosStore((state) => state.closeReceipt)

  if (!receiptOpen || !lastOrder) {
    return null
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="no-print border-b border-[#ead8c0] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
                Receipt
              </p>
              <h2 className="text-2xl font-black text-[#2d1810]">
                Struk Pembayaran
              </h2>
            </div>

            <button
              onClick={closeReceipt}
              className="rounded-full bg-[#fff4e7] px-4 py-2 font-bold text-[#6f3f24] hover:bg-[#ead8c0]"
            >
              X
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div id="receipt-print" className="bg-white text-[#2d1810]">
            <div className="text-center">
              <h1 className="text-2xl font-black">Warm Brew Coffee</h1>
              <p className="mt-1 text-sm text-[#7b5d4a]">
                Coffee Shop POS
              </p>
              <p className="text-sm text-[#7b5d4a]">
                Jl. Contoh Coffee No. 10
              </p>
            </div>

            <div className="my-5 border-t border-dashed border-[#cdb79e]" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[#7b5d4a]">No. Antrian</span>
                <span className="font-black">{lastOrder.queueCode}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#7b5d4a]">Waktu</span>
                <span className="text-right">{lastOrder.createdAt}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#7b5d4a]">Tipe Order</span>
                <span className="font-bold">{lastOrder.orderType}</span>
              </div>

              {lastOrder.orderType === 'Dine In' && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#7b5d4a]">Nomor Meja</span>
                  <span className="font-bold">{lastOrder.tableNumber}</span>
                </div>
              )}

              {lastOrder.orderType === 'Delivery' && (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7b5d4a]">Pelanggan</span>
                    <span className="font-bold">{lastOrder.customerName}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#7b5d4a]">No. HP</span>
                    <span>{lastOrder.customerPhone}</span>
                  </div>

                  <div>
                    <p className="text-[#7b5d4a]">Alamat</p>
                    <p className="font-bold">{lastOrder.deliveryAddress}</p>
                  </div>
                </>
              )}
            </div>

            <div className="my-5 border-t border-dashed border-[#cdb79e]" />

            <div className="space-y-4">
              {lastOrder.items.map((item) => (
                <div key={item.cartKey}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black">{item.name}</p>

                      <p className="mt-1 text-xs uppercase tracking-widest text-[#b88746]">
                        {item.size}
                        {item.temperature ? ` • ${item.temperature}` : ''}
                      </p>

                      <div className="mt-1 space-y-1 text-xs text-[#7b5d4a]">
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

                      <p className="mt-1 text-sm text-[#7b5d4a]">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 font-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-dashed border-[#cdb79e]" />

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[#7b5d4a]">Subtotal</span>
                    <span>{formatCurrency(lastOrder.subtotal)}</span>
                </div>

                {lastOrder.voucher && lastOrder.voucherDiscount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-[#7b5d4a]">
                        Voucher ({lastOrder.voucher.code})
                        </span>
                        <span>-{formatCurrency(lastOrder.voucherDiscount)}</span>
                    </div>
                    )}

                    {lastOrder.happyHourPromo && lastOrder.happyHourDiscount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-[#7b5d4a]">
                        Happy Hour ({lastOrder.happyHourPromo.code})
                        </span>
                        <span>-{formatCurrency(lastOrder.happyHourDiscount)}</span>
                    </div>
                    )}

                <div className="flex justify-between">
                    <span className="text-[#7b5d4a]">PPN 11%</span>
                    <span>{formatCurrency(lastOrder.tax)}</span>
                </div>

              <div className="border-t border-dashed border-[#cdb79e] pt-3">
                <div className="flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span>{formatCurrency(lastOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="my-5 border-t border-dashed border-[#cdb79e]" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7b5d4a]">Metode Bayar</span>
                <span className="font-bold">{lastOrder.paymentMethod}</span>
              </div>

              {lastOrder.paymentMethod === 'Tunai' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#7b5d4a]">Uang Diterima</span>
                    <span>{formatCurrency(lastOrder.cashPaid)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#7b5d4a]">Kembalian</span>
                    <span>{formatCurrency(lastOrder.change)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="my-5 border-t border-dashed border-[#cdb79e]" />

            <div className="text-center text-sm text-[#7b5d4a]">
              <p className="font-bold text-[#2d1810]">
                Terima kasih sudah berkunjung
              </p>
              <p>Simpan struk ini sebagai bukti pembayaran.</p>
            </div>
          </div>
        </div>

        <div className="no-print flex gap-3 border-t border-[#ead8c0] p-5">
          <button
            onClick={closeReceipt}
            className="flex-1 rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
          >
            Tutup
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
          >
            Print Struk
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal