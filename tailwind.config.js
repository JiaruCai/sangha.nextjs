// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        orbit: {
          '0%, 100%': { 'background-position': '50% 50%' },
          '25%':       { 'background-position': '100% 50%' },
          '50%':       { 'background-position': '50% 100%' },
          '75%':       { 'background-position': '0% 50%' },
        },
      },
      animation: {
        'orbit-slow': 'orbit 5s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // …any other plugins…
  ],
}
