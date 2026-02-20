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
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			surface: 'hsl(var(--card))',
  			'text-primary': 'hsl(var(--foreground))',
  			'text-secondary': 'hsl(var(--muted-foreground))',
  			border: 'hsl(var(--border))',
  			success: '#6FAF91',
  			warning: '#E6B566',
  			error: '#E08A8A',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			small: '10px',
  			medium: '14px',
  			large: '18px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			subtle: '0 1px 2px rgba(0,0,0,0.04)',
  			medium: '0 4px 16px rgba(0,0,0,0.10)',
  			strong: '0 8px 28px rgba(0,0,0,0.15)'
  		},
  		spacing: {
  			'4': '4px',
  			'8': '8px',
  			'12': '12px',
  			'16': '16px',
  			'24': '24px',
  			'32': '32px',
  			'48': '48px',
  			'64': '64px'
  		},
  		fontSize: {
  			'12': '12px',
  			'14': '14px',
  			'16': '16px',
  			'20': '20px',
  			'24': '24px',
  			'32': '32px',
  			'40': '40px',
  			'48': '48px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
