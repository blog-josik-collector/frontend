import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
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
  // JavaScript 파일용 설정
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
  // TypeScript 및 TSX 파일용 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        node: {
          project: true,
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: true,
        },
      },
      react: {
        version: 'detect',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 기본 설정들 spread
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      ...prettierConfig.rules,

      // 일반적인 ESLint 규칙
      camelcase: 'off',
      'class-methods-use-this': 'off',
      'function-paren-newline': 'off',
      'implicit-arrow-linebreak': 'off',
      indent: 'off',
      'linebreak-style': 'off',
      'no-bitwise': 'off',
      'no-console': 'off',
      'no-nested-ternary': 'off',
      'no-param-reassign': ['error', { props: false }],
      'no-plusplus': 'off',
      'no-tabs': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'object-curly-newline': 'off',
      'prefer-destructuring': 'off',
      radix: 'off',

      // TypeScript ESLint 규칙
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React 규칙
      'react/function-component-definition': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-wrap-multilines': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',

      // React Hooks 규칙
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      // JSX Accessibility 규칙
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',

      // Import 관련 규칙
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
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
            ['^(src|app|components|utils|lib|services|config)(/.*|$)'], // 내부 모듈
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
