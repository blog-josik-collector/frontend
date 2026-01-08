import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Your customizations go here
    },
  },
  plugins: [],
} satisfies Config;

export default config;
