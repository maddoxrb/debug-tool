module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable dark mode with a specific class
  theme: {
    extend: {
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
        'cli': '66.6667vh', // Define min-h-cli
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
