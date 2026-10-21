export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
export const dateTime = (s) => new Date(s).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
export const STATUS = {
  pending: 'Menunggu Konfirmasi', accepted: 'Diterima', preparing: 'Sedang Diproses', ready: 'Siap Diambil',
  completed: 'Selesai', rejected: 'Ditolak', cancelled: 'Dibatalkan',
}
export const PAY = {
  unpaid: 'Belum dibayar', pending_verification: 'Menunggu verifikasi', paid: 'Berhasil', failed: 'Gagal', refunded: 'Dikembalikan',
}
