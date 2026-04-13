module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0078D4",
        "primary-dark": "#106EBE",
        success: "#107C10",
        warning: "#FFB900",
        error: "#DA3B01",
      },
    },
  },
  plugins: [],
};
