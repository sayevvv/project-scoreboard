import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        karantina: ['"Karantina"', 'cursive'], // Menambahkan font Karantina
      },
    },
  },
  plugins: [],
}

export default config
