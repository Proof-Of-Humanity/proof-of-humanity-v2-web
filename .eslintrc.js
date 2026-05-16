module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  ignorePatterns: [
    ".next/",
    "next-env.d.ts",
    "src/generated/graphql.ts",
    "src/contracts/deployments/**/abi.ts",
  ],
  rules: {
    "react/no-unescaped-entities": 0,
    "react/display-name": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-var": "warn",
    "prefer-const": "warn",
    eqeqeq: ["warn", "always", { null: "ignore" }],
    curly: ["warn", "all"],
    "object-shorthand": ["warn", "always"],
    complexity: ["warn", { max: 12 }],
    "max-depth": ["warn", 4],
    "max-lines": [
      "warn",
      {
        max: 350,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    "max-lines-per-function": [
      "warn",
      {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      },
    ],
    "max-params": ["warn", 5],
  },
};
