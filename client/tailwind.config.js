/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        paper: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
        },
        comic: {
          yellow: '#facc15',
          blue: '#38bdf8',
          red: '#f87171',
          green: '#4ade80',
          purple: '#c084fc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        comic: ['Bangers', 'Comic Neue', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'comic': '3px 3px 0px 0px #0f172a',
        'comic-sm': '2px 2px 0px 0px #0f172a',
        'comic-lg': '5px 5px 0px 0px #0f172a',
        'comic-yellow': '4px 4px 0px 0px #facc15',
        'comic-blue': '4px 4px 0px 0px #38bdf8',
        'comic-dark': '3px 3px 0px 0px #000000',
      },
      borderWidth: {
        'comic': '2.5px',
      }
    },
  },
  plugins: [],
}
