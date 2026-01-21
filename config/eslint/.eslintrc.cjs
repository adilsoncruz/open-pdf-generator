module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
      "@typescript-eslint",
      "unused-imports"
    ],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    rules: {
      // imports não usados
      "unused-imports/no-unused-imports": "error",
  
      // variáveis não usadas
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_" }
      ],
  
      // comentários inúteis
      "no-warning-comments": [
        "error",
        { "terms": ["todo", "fixme"], "location": "anywhere" }
      ]
    }
  };