/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '*.{html,js}',
    '*/*.{html,js}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'c': ['roboto-medium', 'sans-serif'],
      },
      transitionProperty: {
        'c': 'inset',
      },
      letterSpacing: {
        'c': '.25em'
      }
    },
  },
  plugins: [],
}

