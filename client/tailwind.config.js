/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        // 🌈 Brand Colors
        primary: '#00B5AD',      // Teal (Main Accent)
        secondary: '#0070F3',    // Bright Blue (Highlight)
        accent: '#9C27B0',       // Purple Accent

        // 🌞 Light Mode
        lightBg: '#F9FAFB',      // Page background
        lightSurface: '#FFFFFF', // Card surface
        lightText: '#111827',    // Dark text on light surfaces

        // 🌙 Dark Mode
        darkBg: '#0D1117',       // Main dark background
        darkSurface: '#161B22',  // Card surface in dark mode
        darkText: '#E5E7EB',     // Light text on dark backgrounds

        // Neutral colors for borders & muted text
        mutedLight: '#6B7280',   // Muted text in light mode
        mutedDark: '#9CA3AF',    // Muted text in dark mode
      },
      boxShadow: {
        glow: '0 0 20px rgba(47, 204, 113, 0.3)',
        'glow-blue': '0 0 20px rgba(31, 142, 241, 0.3)',
        'glow-emerald': '0 0 20px rgba(46, 204, 113, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-genie': 'linear-gradient(135deg, #1F8EF1 0%, #2ECC71 100%)',
        'gradient-brand': 'linear-gradient(135deg, #1F8EF1 0%, #2ECC71 100%)',
      },
      dropShadow: {
        'glow': '0 0 8px rgba(47, 204, 113, 0.5)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-genie': 'linear-gradient(135deg, #1F8EF1 0%, #2ECC71 100%)',
      },
    },
  },
  plugins: [],
}

