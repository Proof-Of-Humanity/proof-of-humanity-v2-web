const path = require("path");

const lintableExtensions = /\.(js|jsx|ts|tsx)$/;

const buildNextLintCommand = (files) => {
  const lintableFiles = files
    .map((file) => path.relative(process.cwd(), file))
    .filter(
      (file) =>
        lintableExtensions.test(file) &&
        !file.startsWith("src/generated/") &&
        file !== "next-env.d.ts",
    )
    .map((file) => `--file ${JSON.stringify(file)}`)
    .join(" ");

  return lintableFiles
    ? `next lint ${lintableFiles}`
    : "echo No lintable files";
};

module.exports = {
  "*.{js,jsx,ts,tsx,json,css,md,mdx,yml,yaml}": "prettier --write",
  "*.{js,jsx,ts,tsx}": buildNextLintCommand,
};
