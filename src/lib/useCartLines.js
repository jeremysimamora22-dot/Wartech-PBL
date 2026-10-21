import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'

// Gabungkan isi keranjang (id + qty) dengan data produk TERBARU dari database.
export default function useCartLines() {
  const { items } = useCart()
  const { products, loading } = useCatalog()
  const lines = items.map((i) => {
    const product = products.find((p) => p.id === i.id) || null
    return { ...i, product, subtotal: product ? product.price * i.qty : 0, ok: Boolean(product && product.stock >= i.qty) }
  })
  const total = lines.reduce((s, l) => s + l.subtotal, 0)
  return { lines, total, loading, valid: lines.length > 0 && lines.every((l) => l.ok) }
}
