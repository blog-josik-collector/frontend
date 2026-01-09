import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    plugins: {
      prettier,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      ...prettierConfig.rules,

      // 일반적인 규칙
      'no-undef': 'off',

      // react-refresh 관련 규칙
      'react-refresh/only-export-components': 'off',

      // Import 관련 규칙
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/no-relative-packages': 'off',
      'import/no-unresolved': 'off',

      // Simple Import Sort 규칙
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:'], // Node.js 내장 모듈
            ['^react'], // React 관련 패키지
            ['^\\w'], // 일반 패키지
            ['^@\\w'], // @로 시작하는 패키지
            ['^\\u0000'], // 사이드 이펙트 import
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // 부모 디렉토리 import
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // 현재 디렉토리 import
            ['^.+\\.s?css$'], // 스타일 관련 import
          ],
        },
      ],

      // Prettier 규칙
      'prettier/prettier': 'error',
    },
  },
]);
