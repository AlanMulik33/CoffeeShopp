import { useEffect, useRef, useState } from 'react'

function ActionMenu({
  canAccess,
  onOpenDashboard,
  onOpenKitchen,
  onOpenProductAdmin,
  onOpenStockReport,
  onOpenRestock,
  onOpenHistory,
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const actions = [
    {
      key: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Lihat ringkasan penjualan',
      shortcut: 'F3',
      onClick: onOpenDashboard,
    },
    {
      key: 'barista',
      icon: '☕',
      label: 'Barista',
      description: 'Lihat antrian pesanan',
      shortcut: 'F4',
      onClick: onOpenKitchen,
    },
    {
      key: 'produk',
      icon: '📦',
      label: 'Produk',
      description: 'Kelola menu dan harga',
      shortcut: 'F5',
      onClick: onOpenProductAdmin,
    },
    {
      key: 'stok',
      icon: '📋',
      label: 'Stok',
      description: 'Pantau stok rendah dan habis',
      shortcut: 'F6',
      onClick: onOpenStockReport,
    },
    {
      key: 'restock',
      icon: '🧾',
      label: 'Restock',
      description: 'Catat stok masuk',
      shortcut: 'F7',
      onClick: onOpenRestock,
    },
    {
      key: 'riwayat',
      icon: '🕘',
      label: 'Riwayat',
      description: 'Lihat transaksi sebelumnya',
      shortcut: 'F2',
      onClick: onOpenHistory,
    },
  ]

  const visibleActions = actions.filter((action) => canAccess(action.key))

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleActionClick = (action) => {
    action.onClick()
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="rounded-2xl border border-[#ead8c0] bg-white px-5 py-3 text-sm font-bold text-[#6f3f24] shadow-sm transition hover:bg-[#fff4e7]"
      >
        ☰ Menu
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[320px] overflow-hidden rounded-3xl border border-[#ead8c0] bg-white shadow-2xl">
          <div className="border-b border-[#ead8c0] bg-[#fffaf3] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
              Menu Aksi
            </p>
            <p className="mt-1 text-sm text-[#7b5d4a]">
              Pilih fitur sesuai role akun.
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {visibleActions.length === 0 ? (
              <div className="rounded-2xl bg-[#fffaf3] p-4 text-center text-sm font-bold text-[#7b5d4a]">
                Tidak ada menu tersedia.
              </div>
            ) : (
              <div className="space-y-2">
                {visibleActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleActionClick(action)}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-[#fff4e7]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fffaf3] text-xl">
                      {action.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black text-[#2d1810]">
                        {action.label}
                      </p>
                      <p className="text-xs text-[#7b5d4a]">
                        {action.description}
                      </p>
                    </div>

                    <kbd className="rounded-xl border border-[#ead8c0] bg-[#fffaf3] px-2 py-1 text-[11px] font-black text-[#6f3f24]">
                      {action.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 rounded-2xl bg-[#fffaf3] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b88746]">
                Shortcut Umum
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs font-bold text-[#7b5d4a]">
                <div className="flex justify-between gap-3">
                  <span>Ctrl + K</span>
                  <span>Cari menu</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span>Esc</span>
                  <span>Tutup modal/menu</span>
                </div>

                {canAccess('pos') && (
                  <div className="flex justify-between gap-3">
                    <span>Ctrl + Backspace</span>
                    <span>Kosongkan keranjang</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionMenu