module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      keyframes: {
        pulsate: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
      },
      animation: {
        pulsate: 'pulsate 1s infinite',
      },
      colors: {
        background: '#1a202c',
        card: '#2d3748',
        text: '#e2e8f0',
        border: '#4a5568',
        lightBg: '#374152',
      },
      height: {
        'cli': '70vh',
        '2/3-screen': '66.6667vh',
      },
      minHeight: {
        'cli': '66.6667vh',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
