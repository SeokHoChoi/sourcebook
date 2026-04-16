import path from 'node:path';

const buildEslintCommand = (files) =>
  `eslint --fix --max-warnings=0 ${files
    .map((file) => `"${path.relative(process.cwd(), file)}"`)
    .join(' ')}`;

const config = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --write'],
  '*.{json,md,css,mjs,cjs,yml,yaml}': ['prettier --write'],
};

export default config;
