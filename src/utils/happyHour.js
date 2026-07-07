export const isHappyHourActive = (promo, date = new Date()) => {
  const currentHour = date.getHours()

  if (promo.startHour < promo.endHour) {
    return currentHour >= promo.startHour && currentHour < promo.endHour
  }

  return currentHour >= promo.startHour || currentHour < promo.endHour
}

export const getActiveHappyHourPromo = (promos, date = new Date()) => {
  return promos.find((promo) => isHappyHourActive(promo, date)) || null
}

export const calculateHappyHourDiscount = (cart, promo) => {
  if (!promo) {
    return 0
  }

  const eligibleSubtotal = cart.reduce((total, item) => {
    const eligible =
      promo.categories.includes('Semua') || promo.categories.includes(item.category)

    if (!eligible) {
      return total
    }

    return total + item.price * item.quantity
  }, 0)

  if (eligibleSubtotal <= 0) {
    return 0
  }

  let discount = 0

  if (promo.type === 'percent') {
    discount = Math.round(eligibleSubtotal * (promo.value / 100))
  }

  if (promo.type === 'nominal') {
    discount = promo.value
  }

  if (promo.maxDiscount) {
    discount = Math.min(discount, promo.maxDiscount)
  }

  return Math.min(discount, eligibleSubtotal)
}