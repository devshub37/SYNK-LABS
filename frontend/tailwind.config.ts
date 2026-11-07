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
        background: '#040d16', // Deep vibrant dark cyan-tinted
        foreground: '#ffffff',
        accent: {
          DEFAULT: '#00f0ff', // Vibrant Electric Cyan
          hover: '#00cce0',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)', // Brighter glass
          border: 'rgba(255, 255, 255, 0.15)', // More visible border
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
