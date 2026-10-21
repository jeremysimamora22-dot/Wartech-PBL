import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Notice } from '../components/Notice'
import { btn } from '../lib/ui'

export default function NotFound() {
  return <Notice icon={SearchX} title="Halaman tidak ditemukan" action={<Link to="/" className={btn}>Ke beranda</Link>}>Alamat yang kamu buka tidak tersedia.</Notice>
}
