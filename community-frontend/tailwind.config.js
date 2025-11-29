/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        dark: {
          bg: "#121212",
          surface: "#1e1e1e",
          border: "#2c2c2c",
          text: "#e0e0e0",
          muted: "#a0a0a0",
        },
        named: {
          black: "#0f0f0f",
          gray: "#2a2a2a",
          highlight: "#ff4d4d", // Red accent often seen in sports sites
        },
      },
    },
  },
  plugins: [],
};
