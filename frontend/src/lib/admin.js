/** Super-admin gate — matches backend apps.users.permissions.user_is_super_admin */
export function isSuperAdmin(user) {
  if (!user) return false
  return Boolean(user.is_superuser)
}

/** Admin surfaces still needed after hero redesign (banners removed). */
export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/qr-offers', label: 'QR Offers' },
]
