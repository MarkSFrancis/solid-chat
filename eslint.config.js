import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import solid from 'eslint-plugin-solid/configs/typescript';

export default defineConfig(
  {
    ignores: ['dist', 'node_modules'],
  },
  eslint.configs.recommended,
  prettier,
  ...ts.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
        },
      ],
      // Enables throwing `redirect` errors for Tanstack Router
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...solid,
  },
  {
    files: ['**/*.js'],
    extends: [ts.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    files: ['**/*.cjs'],
    extends: [ts.configs.disableTypeChecked],
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        project: false,
      },
    },
  },
  {
    rules: {
      'no-debugger': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-restricted-imports': [
        'error',
        {
          name: 'node:test',
          message: 'Use vitest instead',
        },
      ],
    },
  }
);
