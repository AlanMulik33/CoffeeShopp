import { usePosStore } from '../store/posStore'

function ResetDemoDataButton({ fullWidth = false }) {
  const resetDemoData = usePosStore((state) => state.resetDemoData)
  const openConfirmDialog = usePosStore((state) => state.openConfirmDialog)
  const addToast = usePosStore((state) => state.addToast)

  const handleReset = () => {
    openConfirmDialog({
      title: 'Reset semua data demo?',
      message:
        'Keranjang, riwayat order, dashboard, kitchen display, dan nomor antrian akan dihapus. Tema light/dark tetap aman.',
      confirmText: 'Reset Data',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        resetDemoData()

        addToast({
          title: 'Data demo direset',
          message: 'Riwayat order dan data testing berhasil dikosongkan.',
          type: 'warning',
        })
      },
    })
  }

  return (
    <button
      onClick={handleReset}
      className={`rounded-2xl border border-red-200 px-5 py-4 font-bold text-red-500 transition hover:bg-red-50 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      Reset Data Demo
    </button>
  )
}

export default ResetDemoDataButton