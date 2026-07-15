/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        muted: 'var(--muted)',
        action: 'var(--action)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        desk: 'var(--desk)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '20px',
        xl: '24px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
      },
      borderRadius: {
        card: '8px',
        input: '6px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}
