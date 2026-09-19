import next from 'eslint-config-next';
import reactHooks from 'eslint-plugin-react-hooks';

// Flat config for ESLint 9. Replaces the old .eslintrc.json and the broken
// `next lint` wrapper (Next 14's wrapper calls the ESLint 8 CLI API that
// ESLint 9+ removed). eslint-config-next's default export already bundles
// core-web-vitals + the TypeScript rules.
const config = [
  {
    // .agents/.claude/.codeartsdoer and brag-output* are local-only AI
    // agent skills + their generated output (see .gitignore) — not part
    // of this app's source.
    ignores: [
      '.next/**',
      'build/**',
      'next-env.d.ts',
      '.agents/**',
      '.claude/**',
      '.codeartsdoer/**',
      'brag-output/**',
      'brag-output-*/**',
    ],
  },
  ...next,
  {
    // eslint-config-next registers `react-hooks` only inside its own named
    // config object — this override object doesn't inherit it, so without
    // redeclaring the plugin here ESLint can't resolve
    // 'react-hooks/set-state-in-effect' below.
    plugins: { 'react-hooks': reactHooks },
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
