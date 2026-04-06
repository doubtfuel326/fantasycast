/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#00C853",
          dark: "#111111",
          navy: "#141929",
        },
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 3s ease-in-out infinite",
        "talking": "talking 0.3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        talking: {
          "0%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(1.15)" },
        },
      },
    },
  },
  plugins: [],
};
