module.exports = {
    extends: ['prettier'],
    ignorePatterns: ['**/node_modules/*', '**/build/*', '**/dist/*'],
    parserOptions: {
        ecmaVersion: 2018,
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
};
