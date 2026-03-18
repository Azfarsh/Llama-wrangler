/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0d9488',
                'primary-light': '#14b8a6',
                'primary-dark': '#0f766e',
                secondary: '#111827',
                background: '#ffffff',
                surface: '#f8fffe',
                accent: '#5eead4',
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'fade-in-left': 'fadeInLeft 0.7s ease-out forwards',
                'fade-in-right': 'fadeInRight 0.7s ease-out forwards',
                'scale-in': 'scaleIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'floatSlow 8s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'gradient-shift': 'gradientShift 8s ease infinite',
                'typing': 'typing 2s steps(20) forwards',
                'counter': 'counter 1.5s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'orbit': 'orbit 20s linear infinite',
                'marquee': 'marquee-slide 28s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                fadeInRight: {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(3deg)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(20, 184, 166, 0.6)' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
                },
            },
        },
    },
    plugins: [],
}
