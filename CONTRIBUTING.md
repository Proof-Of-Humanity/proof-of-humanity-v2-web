# Contributing

## Developers

### Getting started

1. Clone/fork this repo:

   ```bash
   git clone https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-web/
   ```

2. Install the dependencies:

    ```bash
    yarn
    ```

3. Copy the `.env.example` file into `.env.local` and set the appropriate values:

   ```bash
   cp .env.example .env.local
   ```

   ```bash
   DEPLOYED_APP= 'https://v2.proofofhumanity.id/' # deployed frontend application URL
   REACT_APP_IPFS_GATEWAY='https://cdn.kleros.link' # ipfs gateway endpoint
   ```
   for `SUBGRAPH_URL` refer to [Proof of Humanity v2 subgraph repository](https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-subgraph)

4. Start the development server:

   ```bash
   yarn run dev
   ```

### Pull Requests

Refer to : https://github.com/kleros/kleros-v2/blob/dev/CONTRIBUTING.md