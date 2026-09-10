# GitHub Battle

A friendly arena for comparing two personal GitHub profiles. Built with React, strict TypeScript, Vite and Tailwind CSS. Tests use Vitest and React Testing Library. Open source under the [MIT license](LICENSE).

## Related backend

This repository contains the frontend. The Java / Spring Boot backend lives in [GitHub-Battle](https://github.com/emanueldemarao18/GitHub-Battle), where you can find its source code, setup instructions and tests. It fetches GitHub data and calculates the scores and winner; this React app displays the API results.

- [Backend source code and documentation](https://github.com/emanueldemarao18/GitHub-Battle)
- [OpenAPI contract](https://github.com/emanueldemarao18/GitHub-Battle/blob/main/docs/openapi.yaml)
- [Try the deployed API: octocat vs torvalds](https://github-battle-emanuel.azurewebsites.net/api/battles?left=octocat&right=torvalds)

## Development

Use Node.js 22.12+ (CI uses Node 22).

```sh
npm ci
npm run dev
```

Open http://localhost:5173/github-battle-web/. Copy `.env.example` to `.env.local` to override the public API URL. Restart Vite after changing environment variables.

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

## Structure

```text
src/
  app/                 Application shell and comparison lifecycle
  features/battle/     API client, runtime contract, results and unit tests
  test/                Shared test setup and fixtures
  styles.css           Tailwind entry point and visual styles
.github/workflows/     Pull request checks and GitHub Pages deployment
docs/                 Deployment and contribution guidance
```

## API and behavior

The backend is https://github-battle-emanuel.azurewebsites.net. The client requests `GET /api/battles?left=USERNAME1&right=USERNAME2` and validates successful responses against the [OpenAPI contract](https://github.com/emanueldemarao18/GitHub-Battle/blob/main/docs/openapi.yaml).

Scores, category points, winner and tie status come directly from the API. The frontend does not calculate scores or infer a winner. Unavailable metrics remain unavailable; the UI displays API notes. Commit counts and longest streak cover the past year. Organizations and duplicate usernames are rejected by the API; basic username and duplicate validation also runs before requests.

Shared links use the frontend path and `left`/`right` query parameters. Opening a link reruns the comparison with live data; it does not preserve a snapshot. Requests time out after 45 seconds and are cancelled when the component unmounts. Network, invalid-response and HTTP errors have retryable messages. A clipboard fallback exposes a selectable share link.

Never put `GITHUB_TOKEN`, credentials or secrets in this project or any `VITE_` variable: those values are public browser code. Only the backend may hold a GitHub token. No authentication credentials are sent by this client.

## Deployment

Deploy only to GitHub Pages at https://emanueldemarao18.github.io/github-battle-web/. See [deployment setup and CORS](docs/deployment.md). Deployment is configured and Azure App Service CORS allows the frontend origins listed in the deployment guide. GitHub Pages is configured to use GitHub Actions; merging to main triggers publication.

## Quality targets

The interface targets public mobile/4G usage, with no authentication or SEO-dependent navigation. Target WCAG 2.2 AA; the frontend implementer owns initial accessibility checks and maintainers own ongoing review. Targets, not measured results: p75 LCP ≤ 2,500 ms, INP ≤ 200 ms, CLS ≤ 0.1; initial JavaScript ≤ 200 KB gzip; Lighthouse accessibility and performance ≥ 90. Field performance requires real traffic and measurement after deployment.

Tests cover input validation, API errors and malformed data, API-owned scoring, unavailable metrics, shared URLs, ties, retries, cancellation and clipboard fallback. Manual keyboard, narrow-screen and screen-reader checks should accompany changes to the interface.

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
