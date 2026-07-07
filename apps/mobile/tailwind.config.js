// @ts-check
const { withNativeWind } = require('nativewind/tailwind');
module.exports = withNativeWind({
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f7cff',
        background: '#0f0f0f',
        'background-secondary': '#1a1a1a',
        foreground: '#ffffff',
        muted: '#6b7280',
        border: '#2a2a2a',
        destructive: '#ef4444',
        success: '#22c55e',
      },
    },
  },
  plugins: [],
});
