/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0c0f14",
        fog: "#f1f2f6",
        ember: "#ff6b4a",
        sea: "#1c7ed6",
        moss: "#1b5e4b",
      },
      boxShadow: {
        glow: "0 0 45px rgba(255, 107, 74, 0.35)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 0.45 },
          "50%": { opacity: 0.75 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        rise: "rise 0.8s ease-out both",
        pulseSlow: "pulseSlow 5s ease-in-out infinite",
      },
      backgroundImage: {
        halo: "radial-gradient(circle at top, rgba(255, 107, 74, 0.35), transparent 60%)",
        tide: "radial-gradient(circle at 20% 20%, rgba(28, 126, 214, 0.3), transparent 50%)",
      },
    },
  },
  plugins: [],
};
