import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'wartech-cart'
const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

// Keranjang hanya menyimpan id + jumlah + catatan. Harga & stok selalu dibaca ulang dari database.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* abaikan */
    }
  }, [items])

  const add = (id, qty = 1, note = '') =>
    setItems((cur) =>
      cur.some((i) => i.id === id)
        ? cur.map((i) => (i.id === id ? { ...i, qty: i.qty + qty, note: note || i.note } : i))
        : [...cur, { id, qty, note }]
    )
  const setQty = (id, qty) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)))
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id))
  const clear = () => setItems([])
  const count = items.reduce((n, i) => n + i.qty, 0)

  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count }}>{children}</Ctx.Provider>
}
