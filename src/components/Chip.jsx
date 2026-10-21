import { PAY, STATUS } from '../lib/format'

const tone = {
  pending: 'bg-amber-100 text-amber-700', accepted: 'bg-blue-100 text-blue-700', preparing: 'bg-indigo-100 text-indigo-700',
  ready: 'bg-emerald-100 text-emerald-700', completed: 'bg-slate-200 text-slate-700', rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700', unpaid: 'bg-amber-100 text-amber-700', pending_verification: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-slate-200 text-slate-700',
}

export default function Chip({ kind = 'status', value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone[value] || 'bg-slate-100 text-slate-600'}`}>
      {(kind === 'pay' ? PAY : STATUS)[value] || value}
    </span>
  )
}
