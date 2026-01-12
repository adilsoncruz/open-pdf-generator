/**
 * Commitlint configuration
 * 
 * Enforces Conventional Commits specification:
 * https://www.conventionalcommits.org/
 * 
 * Format: type(scope?): subject
 * 
 * Examples:
 *   feat: add new PDF export option
 *   fix(core): resolve memory leak in renderer
 *   docs: update API documentation
 *   chore(deps): update dependencies
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these values
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style (formatting, semicolons, etc.)
        'refactor', // Code refactoring (no feature or fix)
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD configuration
        'chore',    // Other changes (deps, configs, etc.)
        'revert',   // Revert a previous commit
      ],
    ],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject max length
    'subject-max-length': [2, 'always', 100],
    // Header max length
    'header-max-length': [2, 'always', 100],
    // Body max line length (0 = disabled)
    'body-max-line-length': [0, 'always', Infinity],
  },
};


