function OrderStatusBadge({ status = 'New' }) {
  const statusConfig = {
    New: {
      label: 'New',
      className: 'bg-blue-50 text-blue-700',
    },
    Preparing: {
      label: 'Preparing',
      className: 'bg-yellow-50 text-yellow-700',
    },
    Ready: {
      label: 'Ready',
      className: 'bg-green-50 text-green-700',
    },
    Completed: {
      label: 'Completed',
      className: 'bg-[#fff4e7] text-[#6f3f24]',
    },
    Cancelled: {
      label: 'Cancelled',
      className: 'bg-red-50 text-red-500',
    },
  }

  const config = statusConfig[status] || statusConfig.New

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export default OrderStatusBadge