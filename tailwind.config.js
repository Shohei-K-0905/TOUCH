// tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // For Expo Router v3 (app directory)
    "./src/**/*.{js,jsx,ts,tsx}", // If you also use a src directory
    "./components/**/*.{js,jsx,ts,tsx}" // If you also use a components directory
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
