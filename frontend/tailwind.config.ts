import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5', // Warm ivory white
        foreground: '#1F1612', // Deep espresso brown
        surface: '#FFFFFF',    // Crisp white
        accent: {
          DEFAULT: '#2B1A13',  // Rich espresso brown
          hover: '#3F271D',
          light: '#F3EDE6',    // Warm latte pill badge
          border: '#D9D0C5',   // Warm subtle border
        },
        muted: {
          DEFAULT: '#6B5B53',  // Warm secondary text
          light: '#9C8C83',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.95)',
          border: '#E8E1D7',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
