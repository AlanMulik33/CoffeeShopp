import { useEffect } from 'react'
import { usePosStore } from '../store/posStore'

function ConfirmDialog() {
  const confirmDialog = usePosStore((state) => state.confirmDialog)
  const closeConfirmDialog = usePosStore((state) => state.closeConfirmDialog)

  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    onConfirm,
  } = confirmDialog

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeConfirmDialog()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, closeConfirmDialog])

  if (!isOpen) {
    return null
  }

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm()
    }

    closeConfirmDialog()
  }

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-[#6f3f24] text-white hover:bg-[#4b2818]'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#ead8c0] bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
              variant === 'danger'
                ? 'bg-red-50 text-red-500'
                : 'bg-[#fff4e7] text-[#b88746]'
            }`}
          >
            {variant === 'danger' ? '⚠️' : '☕'}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
              Konfirmasi
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#2d1810]">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7b5d4a]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={closeConfirmDialog}
            className="flex-1 rounded-2xl border border-[#ead8c0] px-5 py-4 font-bold text-[#6f3f24] transition hover:bg-[#fff4e7]"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            className={`flex-1 rounded-2xl px-5 py-4 font-bold transition ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog