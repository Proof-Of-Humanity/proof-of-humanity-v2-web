const { defineConfig, globalIgnores } = require("eslint/config");
const nextVitals = require("eslint-config-next/core-web-vitals");
const prettier = require("eslint-config-prettier/flat");

module.exports = defineConfig([
  ...nextVitals,
  prettier,
  {
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".netlify/**",
    ".yarn/**",
    "build/**",
    "coverage/**",
    "output/**",
    "public/ffmpeg/**",
    "src/generated/**",
  ]),
]);
