const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: "./",
      sources: [
        {
          pattern: "./app/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./components/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./lib/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./registry/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./content/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./scripts/**/*.{js,ts,jsx,tsx,mdx}",
          negated: false,
        },
        {
          pattern: "./mdx-components.tsx",
          negated: false,
        },
      ],
    },
  },
}
export default config
