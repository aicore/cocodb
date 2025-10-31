// eslint.config.js
export default {
    files: ['src/**', 'test/**'],
    ignores: [
        '**/node_modules/**',
        'src/thirdparty/**',
        'src/**/*-min.js',
        'src/**/*.min.js'
    ],
    languageOptions: {
        ecmaVersion: 2022, // Automatically sets up appropriate ECMAScript features
        sourceType: 'module',
        globals: {
            process: true,    // Assume process is a global variable (specific to Node.js)
            setTimeout: true,  // Assume setTimeout is a global variable
            setInterval: true,
            clearInterval: true,
            console: true
        }
    },
    rules: {
        'no-caller': 'error',
        'no-control-regex': 'error',
        'no-empty': 'warn',
        'no-invalid-regexp': 'error',
        'no-regex-spaces': 'error',
        'no-unsafe-negation': 'warn',
        'valid-jsdoc': 'off',
        'valid-typeof': 'error',
        'curly': 'error',
        'eqeqeq': ['error', 'smart'],
        'guard-for-in': 'off',
        'no-else-return': 'warn',
        'no-fallthrough': 'error',
        'no-invalid-this': 'warn',
        'no-iterator': 'error',
        'no-loop-func': 'error',
        'no-multi-str': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-new': 'error',
        'no-proto': 'error',
        'no-redeclare': 'warn',
        'no-script-url': 'error',
        'wrap-iife': ['error', 'outside'],
        'strict': 'error',
        'no-shadow-restricted-names': 'error',
        'no-shadow': 'warn',
        'no-undef': 'error',
        'no-unused-vars': ['warn', {'vars': 'all', 'args': 'none'}],
        'no-use-before-define': 'off',
        'no-new-require': 'error',
        'block-spacing': 'warn',
        'brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
        'camelcase': 'warn',
        'comma-dangle': 'error',
        'comma-spacing': 'warn',
        'comma-style': ['warn', 'last'],
        'computed-property-spacing': 'warn',
        'eol-last': 'warn',
        'func-call-spacing': 'warn',
        'indent': ['warn', 4],
        'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true }],
        'max-len': ['warn', 120],
        'new-cap': ['off', {
            'capIsNewExceptions': [
                '$.Deferred',
                '$.Event',
                'CodeMirror.Pos',
                'Immutable.Map',
                'Immutable.List',
                'JSLINT'
            ]
        }],
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-new-object': 'error',
        'no-trailing-spaces': 'warn',
        'semi-spacing': 'warn',
        'semi': 'error'
    }
};
