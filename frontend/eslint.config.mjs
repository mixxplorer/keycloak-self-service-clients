import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [{
  ignores: [
    'dist',
    'src-capacitor',
    'src-cordova',
    '.quasar',
    'node_modules',
    '**/.eslintrc.cjs',
    'quasar.config.*.temporary.compiled*',
  ],
}, ...fixupConfigRules(compat.extends(
  'eslint:recommended',
  'standard',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
  'plugin:vue/essential',
  'plugin:vue/strongly-recommended',
  'plugin:vue/recommended',
  'plugin:import/typescript',
)), {
  plugins: {
    '@typescript-eslint': fixupPluginRules(typescriptEslint),
    '@stylistic': stylistic,
    vue: fixupPluginRules(vue),
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ga: true,
      cordova: true,
      __statics: true,
      process: true,
      Capacitor: true,
      chrome: true,
    },

    ecmaVersion: 2022,
    sourceType: 'module',

    parserOptions: {
      extraFileExtensions: ['.vue', '.ts'],
      parser: '@typescript-eslint/parser',
      project: path.join(__dirname, 'tsconfig.json'),
      tsconfigRootDir: './',
      include: ['**/*.js', '**/*.ts', '**/*.vue', '*.js'],
    },
  },

  settings: {
    'import/resolver': 'typescript',
  },

  rules: {
    indent: 'off',
    'generator-star-spacing': 'off',
    'one-var': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-warning-comments': 'warn',

    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    }],

    'no-debugger': 'off',
    'no-console': 'error',
    'vue/valid-v-for': 'warn',
    'vue/this-in-template': 'error',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'error',
    'vue/attribute-hyphenation': 'off',

    'vue/max-len': ['error', {
      code: 140,
      template: 160,
      tabWidth: 2,
      comments: 140,
      ignorePattern: '',
      ignoreComments: false,
      ignoreTrailingComments: false,
      ignoreUrls: false,
      ignoreStrings: false,
      ignoreTemplateLiterals: false,
      ignoreRegExpLiterals: false,
      ignoreHTMLAttributeValues: false,
      ignoreHTMLTextContents: false,
    }],

    'vue/no-irregular-whitespace': 'error',
    'vue/no-static-inline-styles': 'error',
    'vue/valid-v-bind-sync': 'error',
    'vue/v-bind-style': 'error',

    'vue/v-slot-style': ['error', {
      atComponent: 'longform',
      default: 'longform',
      named: 'longform',
    }],

    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],

    '@stylistic/indent': ['error', 2, {
      ignoredNodes: [
        'FunctionExpression > .params[decorators.length > 0]',
        'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
      ],

      FunctionExpression: {
        parameters: 1,
        body: 1,
      },

      CallExpression: {
        arguments: 1,
      },

      SwitchCase: 1,
    }],

    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/quotes': ['error', 'single'],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/no-extra-semi': 'error',
    curly: ['error', 'all'],
    'import/first': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-extraneous-dependencies': 'error',

    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'index', ['sibling', 'parent']],
      'newlines-between': 'always',

      alphabetize: {
        order: 'asc',
      },
    }],

    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'space-in-parens': ['error', 'never'],
    '@stylistic/object-curly-spacing': ['error', 'always'],

    '@stylistic/type-annotation-spacing': ['error', {
      before: false,
      after: true,

      overrides: {
        arrow: {
          before: true,
          after: true,
        },
      },
    }],

    '@stylistic/no-mixed-spaces-and-tabs': 'error',
    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
    '@stylistic/newline-per-chained-call': ['error'],
    '@stylistic/function-call-spacing': ['error', 'never'],
    'no-useless-constructor': 'off',
  },
}, {
  files: ['**/*.vue'],

  rules: {
    'vue/script-indent': ['error', 2, {
      baseIndent: 0,
      switchCase: 1,
    }],
  },
}]
