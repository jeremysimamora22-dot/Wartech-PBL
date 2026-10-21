import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { rupiah } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { btn, btnGhost, card, heading, input, muted } from '../../lib/ui'

function Row({ p, cats, onUpd, onStock }) {
  const [price, setPrice] = useState(p.price)
  const [stock, setStock] = useState(p.stock)
  useEffect(() => {
    setPrice(p.price)
    setStock(p.stock)
  }, [p.price, p.stock])
  const tog = 'flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300'
  return (
    <article className={`grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end ${card}`}>
      <div>
        <p className="font-bold text-navy dark:text-white">{p.name}</p>
        <select value={p.category_id || ''} onChange={(e) => onUpd(p.id, { category_id: e.target.value || null })} aria-label="Kategori" className={`${input} mt-2`}>
          <option value="">Tanpa kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <label className="text-xs font-semibold text-slate-500">Harga ({rupiah(p.price)})
        <span className="mt-1 flex gap-2">
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
          <button type="button" disabled={Number(price) === p.price || price === ''} onClick={() => onUpd(p.id, { price: parseInt(price, 10) })} className={btnGhost}>Simpan</button>
        </span>
      </label>
      <label className="text-xs font-semibold text-slate-500">Stok saat ini: {p.stock}
        <span className="mt-1 flex gap-2">
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={input} />
          <button type="button" disabled={Number(stock) === p.stock || stock === ''} onClick={() => onStock(p.id, parseInt(stock, 10))} className={btnGhost}>Set</button>
        </span>
      </label>
      <div className="flex gap-4 md:flex-col md:gap-1.5">
        <label className={tog}><input type="checkbox" checked={p.is_active} onChange={(e) => onUpd(p.id, { is_active: e.target.checked })} /> Aktif</label>
        <label className={tog}><input type="checkbox" checked={p.is_popular} onChange={(e) => onUpd(p.id, { is_popular: e.target.checked })} /> Pilihan kantin</label>
      </div>
    </article>
  )
}

export default function AdminProducts() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [cats, setCats] = useState([])
  const [nw, setNw] = useState({ name: '', category_id: '', price: '', stock: '' })

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from('products').select('id,name,price,stock,is_active,is_popular,category_id').order('name'),
      supabase.from('categories').select('id,name').order('sort_order'),
    ])
    if (p.error) toast('Gagal memuat produk', 'warn')
    else setRows(p.data)
    setCats(c.data || [])
  }, [toast])
  useEffect(() => {
    load()
  }, [load])

  const done = (error, ok) => {
    toast(error ? 'Gagal menyimpan. Coba lagi.' : ok, error ? 'warn' : 'ok')
    load()
  }
  const upd = async (id, patch) => done((await supabase.from('products').update(patch).eq('id', id)).error, 'Tersimpan')
  const stock = async (id, n) => done((await supabase.rpc('set_stock', { p_product: id, p_stock: n })).error, 'Stok diperbarui')

  const add = async (e) => {
    e.preventDefault()
    const price = parseInt(nw.price, 10)
    const st = parseInt(nw.stock || '0', 10)
    if (!nw.name.trim() || !(price >= 0) || !(st >= 0)) return toast('Lengkapi nama, harga, dan stok dengan benar.', 'warn')
    const { data, error } = await supabase.from('products').insert({ name: nw.name.trim(), price, category_id: nw.category_id || null }).select('id').single()
    if (error) return toast('Gagal menambah produk.', 'warn')
    if (st > 0) await supabase.rpc('set_stock', { p_product: data.id, p_stock: st })
    setNw({ name: '', category_id: '', price: '', stock: '' })
    toast('Produk ditambahkan')
    return load()
  }
  const f = (k) => (e) => setNw((x) => ({ ...x, [k]: e.target.value }))

  return (
    <div>
      <h1 className={`text-2xl ${heading}`}>Produk & Stok</h1>
      <p className={`text-sm ${muted}`}>Perubahan stok tercatat di riwayat stok. Foto produk menyusul di tahap berikutnya.</p>
      <form onSubmit={add} className={`mt-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] ${card}`}>
        <input value={nw.name} onChange={f('name')} placeholder="Nama produk baru" aria-label="Nama produk" className={input} />
        <select value={nw.category_id} onChange={f('category_id')} aria-label="Kategori" className={input}>
          <option value="">Kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" min="0" value={nw.price} onChange={f('price')} placeholder="Harga" aria-label="Harga" className={input} />
        <input type="number" min="0" value={nw.stock} onChange={f('stock')} placeholder="Stok awal" aria-label="Stok awal" className={input} />
        <button type="submit" className={btn}>Tambah</button>
      </form>
      <div className="mt-5 space-y-3">
        {rows === null && <div className="h-32 animate-pulse rounded-3xl bg-soft/70 dark:bg-white/10" />}
        {rows?.length === 0 && <p className={`py-10 text-center ${muted}`}>Belum ada produk.</p>}
        {rows?.map((p) => <Row key={p.id} p={p} cats={cats} onUpd={upd} onStock={stock} />)}
      </div>
    </div>
  )
}
