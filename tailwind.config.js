import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        },
            colors: {
                primary: {
                    DEFAULT: '#43552c', 
                    hover: '#364423',   
                    light: '#5e7244',  
                },
                secondary: {
                    DEFAULT: '#f7f9f7',
                    dark: '#e2e8f0',    
                },
                accent: {
                    DEFAULT: '#d4a373',
                }
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(67, 85, 44, 0.1)', 
            },
         animation: {
            marquee: 'marquee 25s linear infinite',
        },
        keyframes: {
            marquee: {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-100%)' },
            }
        },   
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};