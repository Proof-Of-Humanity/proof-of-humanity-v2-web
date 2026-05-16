module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  ignorePatterns: [".next/", "next-env.d.ts", "src/generated/graphql.ts"],
  rules: {
    "react/no-unescaped-entities": 0,
    "react/display-name": "off",
  },
};
