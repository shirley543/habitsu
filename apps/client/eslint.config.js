//  @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  // General JS/TS configuration
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tanstackConfig,
  // Override for TypeScript files specifically
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  // Exclude config files
  {
    files: ['vite.config.js', 'eslint.config.js', 'prettier.config.js', '*.config.js'],
    ...js.configs.recommended,
  }
];
