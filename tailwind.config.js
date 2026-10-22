/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#fecaaa',
          300: '#fda574',
          400: '#fb7a3c',
          500: '#f95a16',
          600: '#ea400c',
          700: '#c2300c',
          800: '#9a2812',
          900: '#7c2412',
        },
        ink: '#1f2430',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-14px) rotate(6deg)' } },
        gradient: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        wiggle: { '0%,100%': { transform: 'rotate(-6deg)' }, '50%': { transform: 'rotate(6deg)' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '100%': { transform: 'translateX(220%) skewX(-20deg)' } },
        pop: { '0%': { transform: 'scale(0.6)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        gradient: 'gradient 8s ease infinite',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        shine: 'shine 2.8s ease-in-out infinite',
        pop: 'pop 0.35s ease-out both',
      },
      boxShadow: {
        card: '0 4px 24px -6px rgba(31,36,48,0.12)',
        lift: '0 12px 32px -8px rgba(249,90,22,0.35)',
      },
    },
  },
  plugins: [],
}
