/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs de la marque PagesJaunes.cd
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0587c1', // Couleur principale
          600: '#046ba0',
          700: '#034f7f',
          800: '#02335e',
          900: '#01173d',
        },
        secondary: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c0',
          300: '#fff6a0',
          400: '#fdf380',
          500: '#fbf00b', // Jaune principal
          600: '#e6d80a',
          700: '#d1c009',
          800: '#bca808',
          900: '#a79007',
        },
        accent: {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#dc0b1e', // Rouge principal
          600: '#c60a1b',
          700: '#b00918',
          800: '#9a0815',
          900: '#840712',
        },
        // Couleurs neutres
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
