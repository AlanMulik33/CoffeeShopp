export const roleAccess = {
  admin: [
    'pos',
    'dashboard',
    'barista',
    'produk',
    'stok',
    'restock',
    'riwayat',
  ],
  kasir: ['pos', 'riwayat'],
  barista: ['barista'],
}

export const featureLabels = {
  pos: 'POS Kasir',
  dashboard: 'Dashboard',
  barista: 'Barista',
  produk: 'Produk',
  stok: 'Stok',
  restock: 'Restock',
  riwayat: 'Riwayat Order',
}

export const canAccessFeature = (user, feature) => {
  if (!user) {
    return false
  }

  return roleAccess[user.role]?.includes(feature) || false
}

export const getFeatureLabel = (feature) => {
  return featureLabels[feature] || feature
}