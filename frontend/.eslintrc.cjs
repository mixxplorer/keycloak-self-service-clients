module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  env: {
    es2021: true,
    browser: true,
  },

  // Rules order is important, please avoid shuffling them
  // Base ESLint recommended rules
  extends: [
    'eslint:recommended',

    'standard',

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    // ESLint typescript rules
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    // consider disabling this class of rules if linting takes too long
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    'plugin:import/typescript',
  ],

  // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
    // Needed to make the parser take into account 'vue' files
    extraFileExtensions: ['.vue', '.ts'],
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    include: ['**/*.js', '**/*.ts', '**/*.vue', '*.js'],
  },

  plugins: [
    // required to apply rules which need type information
    '@typescript-eslint',

    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // required to lint *.vue files
    'vue',

    // All the stylistic rules are now in this plugin:
    // https://github.com/eslint/eslint/issues/17522 (see also https://eslint.style)
    '@stylistic',
  ],

  globals: {
    ga: true, // Google Analytics
    cordova: true,
    __statics: true,
    process: true,
    Capacitor: true,
    chrome: true,
  },

  // add your custom rules here
  rules: {
    // use vue indentation linter
    indent: 'off',

    'generator-star-spacing': 'off',
    'one-var': 'off',

    'prefer-promise-reject-errors': 'off',

    'no-warning-comments': 'warn',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never', // Only remove spaces for something like function abc() {}
        asyncArrow: 'always',
      },
    ],

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // rules imported from vue-bootstrap
    'no-console': 'error',
    'vue/this-in-template': 'error',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'error',
    'vue/attribute-hyphenation': 'off',
    'vue/max-len': [
      'error',
      {
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
      },
    ],
    'vue/no-irregular-whitespace': 'error',
    'vue/no-static-inline-styles': 'error', // solves an error on quasar elements
    'vue/valid-v-bind-sync': 'error',
    'vue/v-bind-style': 'error',
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'longform',
        default: 'longform',
        named: 'longform',
      },
    ],
    // TypeScript (partially from backend and other frontend eslintrc)
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'error',

    '@stylistic/indent': [
      'error',
      2,
      {
        ignoredNodes: [
          // Somehow, eslint is not capable of correctly indenting decorators.
          // It would indent the decorated functions as follows (which is wrong!):
          // ```ts
          // class ABC {
          //   @SomeDecorator()
          //     somefunction() {}
          // }
          // ```
          // The following option tells eslint to not indent the decorated functions / classes.
          // More info:
          //  - https://github.com/typescript-eslint/typescript-eslint/issues/1232
          //  - https://github.com/typescript-eslint/typescript-eslint/issues/1824
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
        ],
        FunctionExpression: {
          parameters: 1,
          body: 1,
        },
        CallExpression: {
          // Doesn't catch some cases with generics: https://github.com/eslint-stylistic/eslint-stylistic/issues/270.
          arguments: 1,
        },
        SwitchCase: 1,
      },
    ],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/quotes': ['error', 'single'],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/no-extra-semi': 'error',
    // Enforce curly brackets. Just to prevent something like 'goto fail'.
    // So... if you want a good read: https://www.imperialviolet.org/2014/02/22/applebug.html
    curly: ['error', 'all'],
    'import/first': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    // Make sure all dependencies are specified in package.json.
    'import/no-extraneous-dependencies': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'index',
          ['sibling', 'parent'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
        },
      },
    ],
    'no-console': 'error',
    'no-warning-comments': 'warn',

    'comma-dangle': ['error', 'always-multiline'],

    'arrow-parens': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'space-in-parens': ['error', 'never'],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@stylistic/type-annotation-spacing': [
      'error',
      {
        before: false,
        after: true,
        overrides: {
          arrow: {
            before: true,
            after: true,
          },
        },
      },
    ],

    '@stylistic/no-mixed-spaces-and-tabs': 'error',

    // Unification of how to place parameters in functions.
    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
    '@stylistic/newline-per-chained-call': ['error'],
    '@stylistic/function-call-spacing': ['error', 'never'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never', // Only remove spaces for something like function abc() {}
        asyncArrow: 'always',
      },
    ],

    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',

    // we need this due to our injections in services and controllers
    'no-useless-constructor': 'off',
  },
  settings: {
    // This uses the eslint-import-resolver-typescript npm module to properly
    // resolve the imports. Without it, the linter thinks 'utils/error' is an
    // external package, whereas it is just an absolute import.
    'import/resolver': 'typescript',
  },
  overrides: [
    {
      files: ['**/*.vue'],
      rules: {
        'vue/script-indent': ['error', 2, { baseIndent: 0, switchCase: 1 }],
      },
    },
  ],
};
