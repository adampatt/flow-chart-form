import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			"success": 'green',
			"warning": 'orange',
			"error": 'red',
			"primary": 'blue',
			"secondary": 'purple',
			"threshold": "#f97316",
			"long": "#1e3a8a",
			"steady": "#22c55e",
			"hills": "#7f1d1d",
			"tempo": "#facc15"
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
};
export default config;
