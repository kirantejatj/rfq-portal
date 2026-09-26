/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact 12 Brand Colors Specified
        brand: {
          maroon: '#7A1315',       // Primary 1: Deep Maroon
          redMaroon: '#A31E22',    // Primary 2: Red Maroon
          black: '#231F20',        // Secondary 1: Black
          darkGrey: '#414042',     // Secondary 2: Dark Grey
          peach: '#FBB97D',        // Optional 1: Peach
          grey: '#58595B',         // Optional 2: Grey
          lightPeach: '#FDE6D3',   // Optional 3: Light Peach
          lightGrey: '#A7A9AC',    // Optional 4: Light Grey
          gold: '#CB902E',         // Optional 5: Gold
          darkGold: '#67491C',     // Optional 6: Dark Gold / Brown
          burntOrange: '#CA6E28',  // Optional 7: Burnt Orange
          deepBlue: '#0E2C49',     // Optional 8: Deep Blue
        },
        // Mapped Gov scale to ensure full compatibility across all components
        gov: {
          50: '#FDF7F3',   // Ultra soft warm peach tint
          100: '#FDE6D3',  // Optional 3: Light Peach
          200: '#FBB97D',  // Optional 1: Peach
          300: '#E8A56E',  // Warm Peach tone
          400: '#CA6E28',  // Optional 7: Burnt Orange
          500: '#CB902E',  // Optional 5: Gold Accent
          600: '#A31E22',  // Primary 2: Red Maroon
          700: '#8E1719',  // Medium Deep Maroon
          800: '#7A1315',  // Primary 1: Deep Maroon
          900: '#4D0C0E',  // Dark Maroon
          950: '#231F20',  // Secondary 1: Black
        },
        gold: {
          50: '#FCF8F2',
          100: '#FDE6D3',
          200: '#FBB97D',
          300: '#E4AB52',
          400: '#D99B35',
          500: '#CB902E',  // Optional 5: Gold
          600: '#B07B23',
          700: '#8F6218',
          800: '#67491C',  // Optional 6: Dark Gold
          900: '#483313',
        },
        dark: {
          50: '#F5F5F6',
          100: '#E6E6E8',
          200: '#A7A9AC',  // Optional 4: Light Grey
          300: '#85878A',
          400: '#58595B',  // Optional 2: Grey
          500: '#414042',  // Secondary 2: Dark Grey
          600: '#343335',
          700: '#2C292A',
          800: '#231F20',  // Secondary 1: Black
          900: '#191617',
          950: '#0E0C0D',
        },
        navy: {
          50: '#EEF3F8',
          100: '#D3DFEB',
          200: '#A7BFD7',
          300: '#749BC0',
          400: '#477AA7',
          500: '#265C8C',
          600: '#16436C',
          700: '#0E2C49',  // Optional 8: Deep Blue
          800: '#091E33',
          900: '#04101D',
        }
      }
    },
  },
  plugins: [],
}
