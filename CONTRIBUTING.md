# Contributing

## Developers

### Getting started

1. Clone/fork this repo:

   ```bash
   git clone https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-web/
   ```

2. Use the repo Node/Yarn versions:

   ```bash
   node --version
   yarn --version
   ```

   This repo is pinned to Node `22.22.1` and Yarn `1.22.22` in `package.json`. The same Node version is also recorded in `.nvmrc` and `.node-version`, so tools like `nvm`, `asdf`, `mise`, or Volta can pick it up.

   If a Git hook or GUI client reports an older Node version, fix the active shell/GUI environment and open a fresh terminal. The Husky hooks expect Node `22.22.1` to already be active.

3. Install the dependencies:

   ```bash
   yarn
   ```

4. Copy the `.env.example` file into `.env.local` and set the appropriate values:

   ```bash
   cp .env.example .env.local
   ```

   ```bash
   DEPLOYED_APP= 'https://v2.proofofhumanity.id/' # deployed frontend application URL
   REACT_APP_IPFS_GATEWAY='https://cdn.kleros.link' # ipfs gateway endpoint
   ```

   for `SUBGRAPH_URL` refer to [Proof of Humanity v2 subgraph repository](https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-subgraph)

5. Start the development server:

   ```bash
   yarn dev
   ```

### Checks

Run the focused checks before opening a PR:

```bash
yarn run typecheck
yarn run lint
yarn run check
yarn run build
```

`yarn run check` runs the TypeScript and lint checks together. `yarn run build` catches route and production build errors that may not appear during development.

GitHub Actions remains the source of truth for CI. Locally, `yarn run check && yarn run build` is the matching pre-merge verification flow.

### Formatting

Use Prettier for formatting:

```bash
yarn run format
yarn run format:check
```

`yarn run format` formats the whole repository, which can create a large diff. Prefer running it on small branches or when a formatting-only diff is intentional.

### Pre-commit Hooks

Husky runs `yarn lint-staged` before commits.

`lint-staged` only checks files staged for commit:

- Prettier formats staged JavaScript, TypeScript, JSON, CSS, Markdown, MDX, and YAML files.
- Next lint runs only on staged JavaScript and TypeScript files using `next lint --file`.
- Generated files such as `src/generated/graphql.ts` are skipped by the lint command.

### Pull Requests

Refer to : https://github.com/kleros/kleros-v2/blob/dev/CONTRIBUTING.md
