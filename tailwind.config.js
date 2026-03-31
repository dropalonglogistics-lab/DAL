/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand-black": "#0D0D0D",
                "brand-gold": "#C9A227",
                "brand-gold-light": "#E8C84A",
                "brand-gold-muted": "#F5E6A3",
                "brand-surface": "#FFFFFF",
                "brand-off-white": "#FAFAF7",
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'sans-serif'],
                body: ['var(--font-body)', 'sans-serif'],
            },
            borderRadius: {
                sm: "6px",
                md: "10px",
                lg: "16px",
                xl: "24px",
            },
            keyframes: {
                'bounce-short': {
                    '0%, 100%': { transform: 'translateY(-4px)' },
                    '50%': { transform: 'translateY(0)' },
                }
            },
            animation: {
                'bounce-short': 'bounce-short 1s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
