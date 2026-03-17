/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#eb0a7c',
        secondary: '#b10861',
        accent: '#ffd2e5',
        background: '#fff5f9',
        surface: '#fffafc',
        card: '#fffdfd',
        text: '#3e2330',
        muted: '#8c6676',
        success: '#2f7d5b',
      },
      fontFamily: {
        sans: ['Avenir Next', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        modern: '0 20px 45px rgba(176, 8, 97, 0.14)',
      },
    },
  },
  plugins: [],
};
