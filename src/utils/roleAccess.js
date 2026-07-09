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

export const canAccessFeature = (user, feature) => {
  if (!user) {
    return false
  }

  return roleAccess[user.role]?.includes(feature) || false
}