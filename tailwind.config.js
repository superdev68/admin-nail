/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(131, 69, 6)",
          ink: "rgb(100, 54, 12)",
          soft: "rgb(244, 238, 233)",
          line: "rgb(220, 203, 185)",
          deep: "rgb(87, 48, 14)",
          tan: "rgb(187, 153, 118)",
        },
        ink: "#1c1a22",
        muted: "#6c6877",
        line: "#e4e2e9",
        canvas: "rgb(241, 239, 239)",
      },
      fontFamily: {
        display: ['"Fraunces"', '"Iowan Old Style"', "Georgia", "serif"],
        sans: ['"Be Vietnam Pro"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      borderRadius: { xl2: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(28,26,34,.04), 0 4px 16px rgba(28,26,34,.05)",
      },
    },
  },
  plugins: [],
};
