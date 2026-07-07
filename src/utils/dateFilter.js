export const getTodayInputValue = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getOrderDate = (order) => {
  if (order.createdAtISO) {
    return new Date(order.createdAtISO)
  }

  return null
}

export const isDateInRange = (date, startDate, endDate) => {
  if (!date) {
    return false
  }

  const dateValue = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime()

  const start = startDate
    ? new Date(`${startDate}T00:00:00`).getTime()
    : -Infinity

  const end = endDate
    ? new Date(`${endDate}T23:59:59`).getTime()
    : Infinity

  return dateValue >= start && dateValue <= end
}

export const filterOrdersByDate = (
  orders,
  filterMode,
  startDate,
  endDate
) => {
  if (filterMode === 'all') {
    return orders
  }

  const today = getTodayInputValue()

  if (filterMode === 'today') {
    return orders.filter((order) => {
      const orderDate = getOrderDate(order)
      return isDateInRange(orderDate, today, today)
    })
  }

  if (filterMode === 'custom') {
    return orders.filter((order) => {
      const orderDate = getOrderDate(order)
      return isDateInRange(orderDate, startDate, endDate)
    })
  }

  return orders
}