module.exports = {
  root: true,
  extends: ['next'],
  rules: {
    'import/order': 'off',
    'quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'curly': ['error', 'multi-line'],
  },
};
