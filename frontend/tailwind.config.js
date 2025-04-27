/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        facebook: {
          primary: '#1877F2',      // Facebook Blue
          hover: '#166FE5',        // Darker Blue for hover
          dark: '#18191A',         // Dark background
          card: '#242526',         // Card/Component background
          hover2: '#3A3B3C',       // Secondary hover color
          text: {
            primary: '#E4E6EB',    // Primary text
            secondary: '#B0B3B8',  // Secondary text
          },
          button: {
            secondary: '#4B4C4F',  // Secondary button
          },
          divider: '#3E4042',      // Divider lines
          input: '#3A3B3C',        // Input background
          active: '#2D88FF',       // Active state blue
        }
      }
    }
  },
  plugins: [],
};
