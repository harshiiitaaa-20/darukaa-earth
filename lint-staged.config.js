module.exports = {
  'frontend/src/**/*.{js,jsx}': [
    'prettier --write',
    'eslint --fix',
  ],
  'frontend/src/**/*.{css,html}': [
    'prettier --write',
  ],
  'backend/**/*.py': [
    'ruff check --fix',
  ],
};
