import next from 'eslint-config-next';

// Flat config for ESLint 9. Replaces the old .eslintrc.json and the broken
// `next lint` wrapper (Next 14's wrapper calls the ESLint 8 CLI API that
// ESLint 9+ removed). eslint-config-next's default export already bundles
// core-web-vitals + the TypeScript rules.
const config = [
  { ignores: ['.next/**', 'build/**', 'next-env.d.ts'] },
  ...next,
  {
    rules: {
      // Apostrophes / quotes in plain JSX copy — noise, not a real problem.
      'react/no-unescaped-entities': 'off',
      // Deriving state in an effect is worth knowing about but not a build
      // blocker; the quote calculator does this deliberately.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
