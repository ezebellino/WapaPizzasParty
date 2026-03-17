/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E90FF', // Azul brillante para elementos destacados
        secondary: '#4B5563', // Gris oscuro para elementos secundarios
        accent: '#F59E0B', // Amarillo para elementos destacados (como botones o enlaces)
        card: '#2D3748', // Fondo para tarjetas o bloques
        text: '#E2E8F0', // Texto principal (gris claro)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        modern: '0 4px 8px rgba(0, 0, 0, 0.3)', // Sombra más suave
      },
    },
  },
  plugins: [],
}

