/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI-Tech Inspired Color Palette
        primary: {
          50: '#E0F7FE',
          100: '#B3EDFD',
          200: '#80E2FC',
          300: '#4DD7FA',
          400: '#26CFF9',
          500: '#00C7F8', // Main Primary - Bright Cyan
          600: '#00B1DF',
          700: '#0097C0',
          800: '#007DA1',
          900: '#005572',
        },
        secondary: {
          50: '#F0E9FF',
          100: '#D9C7FF',
          200: '#C2A5FF',
          300: '#AB83FF',
          400: '#9461FF',
          500: '#7D3FFF', // Main Secondary - Electric Purple
          600: '#6B2FE6',
          700: '#591FCD',
          800: '#470FB4',
          900: '#35009B',
        },
        accent: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899', // Main Accent - Vibrant Pink
          600: '#DB2777',
          700: '#BE185D',
          800: '#9F1239',
          900: '#831843',
        },
        ai: {
          cyan: '#00D9FF',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
          teal: '#14B8A6',
        },
      },
      backgroundImage: {
        'gradient-ai': 'linear-gradient(135deg, #00D9FF 0%, #3B82F6 50%, #8B5CF6 100%)',
        'gradient-ai-reverse': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #00D9FF 100%)',
        'gradient-soft': 'linear-gradient(135deg, #E0F7FE 0%, #F0E9FF 50%, #FDF2F8 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};