/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#bd4f2f',
        secondary: '#803523',
        accent: '#ddb15a',
        background: '#f5ede2',
        surface: '#fffaf3',
        card: '#fffdf9',
        text: '#2f241f',
        muted: '#7f6c62',
        success: '#2f7d5b',
      },
      fontFamily: {
        sans: ['Avenir Next', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        modern: '0 20px 45px rgba(86, 54, 37, 0.12)',
      },
    },
  },
  plugins: [],
};
