const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#121212',
        'electric-blue': '#00BFFF',
        'neon-magenta': '#FF00FF',
        'light-gray': '#A0A0A0',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        display: ['"Monument Extended"', ...fontFamily.sans],
      },
      borderColor: {
        'white-20': 'rgba(255, 255, 255, 0.2)',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 191, 255, 0.6)',
        'neon-magenta': '0 0 15px rgba(255, 0, 255, 0.6)',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
