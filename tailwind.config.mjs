/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'phone-lg': '390px',
        'xs': '400px',
      },
      colors: {
        // Add your exact hex codes from colors.css here
        'td-purple': '#452c63',
        'td-accent': '#9972ab',
        'td-dark': '#1a1a1a',
      },
    },
  },
  plugins: [],
};
export default config;