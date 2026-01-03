import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#005aa3",
                secondary: "#e6f0fa",
                danger: "#b91c1c",
                success: "#15803d",
                muted: "#6b7280",
            },
        },
    },
    plugins: [],
};

export default config;
