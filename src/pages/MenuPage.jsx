import { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import ProductGrid from '../components/customer/ProductGrid'
import { BackendNotice, GridSkeleton, Notice } from '../components/Notice'
import { useCatalog } from '../context/CatalogContext'
import { supabase } from '../lib/supabase'
import { btn, btnGhost, heading, input, muted } from '../lib/ui'

const sorts = {
  name: ['Nama A-Z', (a, b) => a.name.localeCompare(b.name)],
  low: ['Harga termurah', (a, b) => a.price - b.price],
  high: ['Harga tertinggi', (a, b) => b.price - a.price],
  pick: ['Pilihan kantin', (a, b) => Number(b.is_popular) - Number(a.is_popular)],
}

export default function MenuPage() {
  const { categories, products, loading, error, reload } = useCatalog()
  const [sp, setSp] = useSearchParams()
  const { hash } = useLocation()
  const [limit, setLimit] = useState(12)
  const q = sp.get('q') || ''
  const cat = sp.get('cat') || ''
  const sort = sorts[sp.get('sort')] ? sp.get('sort') : 'name'
  const set = (k, v) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v)
    else n.delete(k)
    setSp(n, { replace: true })
    setLimit(12)
  }
  const list = useMemo(
    () => products.filter((p) => (!cat || p.category_id === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())).sort(sorts[sort][1]),
    [products, q, cat, sort]
  )
  const chip = (on) => `rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-brand text-white shadow-glow' : 'bg-white/80 text-navy ring-1 ring-soft hover:text-brand dark:bg-white/10 dark:text-white dark:ring-white/10'}`

  if (!supabase) return <BackendNotice />
  return (
    <div className="py-4">
      <h1 className={`text-3xl ${heading}`}>Menu</h1>
      <p className={`mt-1 ${muted}`}>Pilih makanan dan minuman yang ingin kamu pesan.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="cari" autoFocus={hash === '#cari'} value={q} onChange={(e) => set('q', e.target.value)} placeholder="Cari menu…" aria-label="Cari menu" className={`${input} pl-9`} />
        </div>
        <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Urutkan" className={`${input} sm:w-52`}>
          {Object.entries(sorts).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => set('cat', '')} className={chip(!cat)}>Semua</button>
        {categories.map((c) => <button key={c.id} type="button" onClick={() => set('cat', c.id)} className={chip(cat === c.id)}>{c.name}</button>)}
      </div>
      {error && <Notice title="Menu belum bisa dimuat" action={<button type="button" onClick={reload} className={btn}>Coba lagi</button>}>{error}</Notice>}
      {!error && (
        <div className="mt-6">
          {loading ? (
            <GridSkeleton />
          ) : list.length === 0 ? (
            <Notice icon={SearchX} title="Menu tidak ditemukan" action={<button type="button" onClick={() => setSp({}, { replace: true })} className={btnGhost}>Hapus filter</button>}>
              Coba kata kunci atau kategori lain.
            </Notice>
          ) : (
            <>
              <p className={`mb-4 text-sm ${muted}`}>{list.length} menu ditemukan</p>
              <ProductGrid products={list.slice(0, limit)} />
              {list.length > limit && (
                <div className="mt-8 text-center"><button type="button" onClick={() => setLimit((l) => l + 12)} className={btnGhost}>Tampilkan lebih banyak</button></div>
              )}
            </>
          )}
        </div>
      )}
      <p className="sr-only"><Link to="/cart">Keranjang</Link></p>
    </div>
  )
}
