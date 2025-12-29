//  @ts-check
import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { tanstackConfig } from '@tanstack/eslint-config'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tanstackConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
)
