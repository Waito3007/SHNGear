const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#121212",
        "electric-blue": "#00BFFF",
        "neon-magenta": "#FF00FF",
        "light-gray": "#A0A0A0",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        display: ['"Monument Extended"', ...fontFamily.sans],
      },
      borderColor: {
        "white-20": "rgba(255, 255, 255, 0.2)",
      },
      scale: {
        102: "1.02",
        105: "1.05",
      },
      boxShadow: {
        "neon-blue": "0 0 15px rgba(0, 191, 255, 0.6)",
        "neon-magenta": "0 0 15px rgba(255, 0, 255, 0.6)",
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-5px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".custom-scrollbar": {
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "3px",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
