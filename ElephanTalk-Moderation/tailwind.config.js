/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dark-login': "url('/assets/login/login-light-background.webp')"
      },
      colors: {
        primary: "#25a2b5",
        darkprim: "#228398"
      },
    },
  },
  plugins: [],
};
