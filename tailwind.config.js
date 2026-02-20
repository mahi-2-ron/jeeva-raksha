/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Catch root files like App.tsx if they are in root
    ],
    theme: {
        extend: {
            colors: {
                // Enterprise Medical Palette (Refined Healthcare Blue)
                primary: '#2563eb', // Hospital Blue (Primary Action)
                secondary: '#475569', // Slate-600 (Secondary Text/UI)
                accent: '#0ea5e9', // Sky-500 (Highlights)
                danger: '#dc2626', // Red-600 (Alerts)
                success: '#16a34a', // Green-600 (Success)
                warning: '#ea580c', // Orange-600 (Warning)

                // Backgrounds
                hospital: {
                    bg: '#f8fafc', // Soft Slate-50 (App Background)
                    card: '#ffffff', // White (Card Background)
                    sidebar: '#ffffff', // Professional White Sidebar
                    input: '#ffffff', // Clean White Input
                    border: '#e2e8f0', // Slate-200 (Borders)
                },

                // Text
                text: {
                    main: '#0f172a', // Slate-900 (Headings)
                    body: '#334155', // Slate-700 (Body)
                    muted: '#64748b', // Slate-500 (Muted)
                }
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            backgroundImage: {
                'medical-gradient': 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                'vibrant-mesh': 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.1) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(14, 165, 233, 0.1) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(22, 163, 74, 0.1) 0, transparent 50%)',
                'vibrant-blue': 'linear-gradient(to right, #2563eb, #3b82f6)',
                'vibrant-green': 'linear-gradient(to right, #16a34a, #22c55e)',
                'vibrant-orange': 'linear-gradient(to right, #ea580c, #f97316)',
                'soft-blue': 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
                'glass-white': 'linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
            }
        },
    },
    plugins: [],
}
