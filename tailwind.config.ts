import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          red: {
            50: '#FFE5E5',
            100: '#FFCCCC',
            200: '#FF9999',
            300: '#FF6666',
            400: '#FF3333',
            500: '#DD0000',
            600: '#AA0000',
            700: '#8B0000',
            800: '#660000',
            900: '#440000',
            DEFAULT: '#8B0000',
          },
          blue: {
            50: '#E6F0FF',
            100: '#CCE1FF',
            200: '#99C3FF',
            300: '#66A5FF',
            400: '#3387FF',
            500: '#0069FF',
            600: '#0051CC',
            700: '#003D99',
            800: '#002966',
            900: '#001F3F',
            DEFAULT: '#001F3F',
          },
          gold: {
            50: '#FFFEF5',
            100: '#FFFCEB',
            200: '#FFF8D6',
            300: '#FFF3C2',
            400: '#FFEDAD',
            500: '#FFE899',
            600: '#FFE385',
            700: '#FFD700',
            800: '#CCAC00',
            900: '#998100',
            DEFAULT: '#FFD700',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
