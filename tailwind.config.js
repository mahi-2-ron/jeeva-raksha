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
                // Enterprise Medical Palette
                primary: '#0f766e', // Teal-700 (Primary Action)
                secondary: '#334155', // Slate-700 (Secondary Text/UI)
                accent: '#0ea5e9', // Sky-500 (Highlights)
                danger: '#ef4444', // Red-500 (Alerts)
                success: '#10b981', // Emerald-500 (Success)
                warning: '#f59e0b', // Amber-500 (Warning)

                // Backgrounds
                hospital: {
                    bg: '#f1f5f9', // Slate-100 (App Background)
                    card: '#ffffff', // White (Card Background)
                    input: '#f8fafc', // Slate-50 (Input Background)
                    border: '#e2e8f0', // Slate-200 (Borders)
                },

                // Text
                text: {
                    main: '#0f172a', // Slate-900 (Headings)
                    body: '#475569', // Slate-600 (Body)
                    muted: '#94a3b8', // Slate-400 (Muted)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }
        },
    },
    plugins: [],
}
