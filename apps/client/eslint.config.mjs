//  @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  // Base configs
  eslint.configs.recommended,
  // JS files (configs)
  {
    files: [
      '**/*.config.js',
      'vite.config.js',
      'eslint.config.mjs',
      'prettier.config.js',
    ],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },


  ...tseslint.configs.recommended,
  ...tanstackConfig,
  // TS files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },


]
