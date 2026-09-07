/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0B0D12",
          panel: "#12151C",
          raised: "#171B24",
          border: "#242936",
        },
        ink: {
          DEFAULT: "#E7E9EE",
          muted: "#9BA3B4",
          faint: "#5C6478",
        },
        accent: {
          DEFAULT: "#5B7FFF",
          soft: "#3D57C7",
          glow: "#7C97FF",
        },
        good: "#3DCB8F",
        warn: "#E8A23D",
        bad: "#E8556B",
      },
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        subtle: "0 1px 0 rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
