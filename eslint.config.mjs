import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintComments from 'eslint-plugin-eslint-comments'
import functionalPlugin from 'eslint-plugin-functional'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const functionalPatched = {
  ...functionalPlugin,
  rules: {
    ...functionalPlugin.rules,
    'no-mixed-type': { meta: { schema: [] }, create: () => ({}) }
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  { ignores: ['node_modules/**', 'build/**', 'coverage/**'] },

  ...compat.extends(
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier'
  ),

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        BigInt: 'readonly',
        console: 'readonly',
        WebAssembly: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'eslint-comments': eslintComments,
      functional: functionalPatched
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'comma-dangle': 0,
      'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      'eslint-comments/no-unused-disable': 'error',
      'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'max-len': [
        'error',
        { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }
      ],
      semi: 0,
'sort-imports': ['error', { ignoreDeclarationSort: true, ignoreCase: true }],
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]

