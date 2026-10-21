/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: '#102663', brand: '#2563EB', bright: '#3B82F6', soft: '#DBEAFE', mist: '#F7FAFF' },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 24px 70px -24px rgba(37,99,235,0.28)',
        glow: '0 12px 32px -8px rgba(37,99,235,0.55)',
      },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(40px,-30px,0) scale(1.08)' },
        },
        spark: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%,70%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        drift: 'drift 20s ease-in-out infinite',
        spark: 'spark 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
