import nextPlugin from 'eslint-config-next';

export default [
  {
    ignores: ['node_modules', '.next', 'build'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      next: nextPlugin,
    },
    rules: {
      // You can add custom rules here
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    }
  }
];
