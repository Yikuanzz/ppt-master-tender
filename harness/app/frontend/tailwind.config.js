/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#F5F5F5',
        mutedForeground: '#525252',
        border: '#000000',
        borderLight: '#E5E5E5',
        accent: '#000000',
        accentForeground: '#FFFFFF',
        ring: '#000000',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
 },
      boxShadow: {
        none: '0 0 #0000',
      },
      transitionDuration: {
        DEFAULT: '75ms',
      },
    },
  },
  plugins: [],
}
