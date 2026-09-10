# Contributing

Create a feature branch and keep changes focused. Use English for source code, interface text, documentation and pull requests.

Run `npm ci`, `npm test` and `npm run build` before opening a PR. Include the problem, resulting behavior and validation in the description. For UI changes, check narrow screens and keyboard navigation. Do not commit secrets, dependency folders or build output.

Preserve the API contract: scoring and winner selection belong to the backend. Discuss contract changes across both repositories before changing the client.

The repository maintainer reviews and merges PRs. Deployment follows merges to `main` through GitHub Pages.
