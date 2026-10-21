// Logo warung + sentuhan circuit (garis & node) di dalam toko.
export default function Logo({ size = 52, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wt-logo" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#wt-logo)" />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 24l3-8h24l3 8" />
        <path d="M17 24c0 4 3 5 5 5s5-1 5-5c0 4 3 5 5 5s5-1 5-5c0 4 3 5 5 5s5-1 5-5" />
        <path d="M19 31v16h26V31" />
      </g>
      <g stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 47v-8M26 47v-4l-4-4M38 47v-4l4-4" />
      </g>
      <g fill="#fff">
        <circle cx="32" cy="39" r="2" />
        <circle cx="22" cy="39" r="1.8" />
        <circle cx="42" cy="39" r="1.8" />
      </g>
    </svg>
  )
}
