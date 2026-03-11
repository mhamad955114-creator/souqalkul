import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "dating-pop": {
          "0%": { opacity: "0", transform: "scale(0.6) translateY(30px) rotate(-3deg)" },
          "50%": { opacity: "1", transform: "scale(1.05) translateY(-5px) rotate(1deg)" },
          "70%": { transform: "scale(0.97) translateY(2px) rotate(0deg)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0) rotate(0deg)" },
        },
        "dating-glow": {
          "0%, 100%": { boxShadow: "0 0 15px 0 rgba(236,72,153,0.15)" },
          "50%": { boxShadow: "0 0 25px 5px rgba(236,72,153,0.25)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "balance-pulse": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 hsl(168 76% 42% / 0.4)" },
          "25%": { transform: "scale(1.03)", boxShadow: "0 0 20px 4px hsl(168 76% 42% / 0.3)" },
          "50%": { transform: "scale(0.98)" },
          "75%": { transform: "scale(1.01)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 hsl(168 76% 42% / 0)" },
        },
        "shrink-width": {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
        "diamond-spin": {
          "0%": { transform: "rotateY(0deg) scale(1)", filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" },
          "25%": { transform: "rotateY(90deg) scale(1.15)", filter: "drop-shadow(0 0 16px rgba(59,130,246,1))" },
          "50%": { transform: "rotateY(180deg) scale(1)", filter: "drop-shadow(0 0 10px rgba(139,92,246,0.8))" },
          "75%": { transform: "rotateY(270deg) scale(1.15)", filter: "drop-shadow(0 0 16px rgba(59,130,246,1))" },
          "100%": { transform: "rotateY(360deg) scale(1)", filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" },
        },
        "diamond-glow-ring": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(59,130,246,0.3), 0 0 16px 4px rgba(139,92,246,0.15)" },
          "50%": { boxShadow: "0 0 16px 6px rgba(59,130,246,0.5), 0 0 32px 8px rgba(139,92,246,0.3)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "dating-pop": "dating-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "dating-glow": "dating-glow 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "balance-pulse": "balance-pulse 0.8s ease-in-out",
        "shrink-width": "shrink-width linear forwards",
        "diamond-spin": "diamond-spin 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "diamond-glow-ring": "diamond-glow-ring 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
