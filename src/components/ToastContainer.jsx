import { usePosStore } from '../store/posStore'

function ToastContainer() {
  const toasts = usePosStore((state) => state.toasts)
  const removeToast = usePosStore((state) => state.removeToast)

  if (toasts.length === 0) {
    return null
  }

  const getToastStyle = (type) => {
    if (type === 'error') {
      return {
        icon: '⚠️',
        border: 'border-red-200',
        iconBg: 'bg-red-50',
        iconText: 'text-red-500',
      }
    }

    if (type === 'warning') {
      return {
        icon: '☕',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-50',
        iconText: 'text-yellow-600',
      }
    }

    return {
      icon: '✅',
      border: 'border-[#ead8c0]',
      iconBg: 'bg-[#fff4e7]',
      iconText: 'text-[#b88746]',
    }
  }

  return (
    <div className="fixed right-4 top-4 z-[90] flex w-[calc(100%-32px)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type)

        return (
          <div
            key={toast.id}
            className={`rounded-3xl border ${style.border} bg-white p-4 shadow-2xl backdrop-blur`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.iconBg} ${style.iconText}`}
              >
                {style.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-[#2d1810]">
                  {toast.title}
                </h3>

                {toast.message && (
                  <p className="mt-1 text-sm leading-5 text-[#7b5d4a]">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 py-1 text-sm font-bold text-[#7b5d4a] hover:bg-[#fff4e7]"
              >
                X
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer