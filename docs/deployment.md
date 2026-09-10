# GitHub Pages deployment

1. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
2. Configure backend CORS for the exact origin `https://emanueldemarao18.github.io`. Origins have no path: do not include `/github-battle-web/` or a trailing slash. Allow `GET`; handle `OPTIONS` if the backend's CORS mechanism needs it. Browser credentials are not used.
3. For local development, separately allow `http://localhost:5173` (and `http://localhost:4173` for preview) in the backend development configuration as appropriate.
4. Submit changes through a PR. The maintainer performs merges. After a merge to `main`, the Pages workflow runs tests, builds and publishes `dist`.
5. Open https://emanueldemarao18.github.io/github-battle-web/ and compare two accounts. Reload a shared URL to verify query parameters work. Check browser network responses for `Access-Control-Allow-Origin` if a request fails.

Vite's base is `/github-battle-web/`. Query-based navigation avoids GitHub Pages route fallback requirements. No custom domain, `CNAME` or Netlify configuration is needed.

The public backend URL is set in the Pages build workflow. `VITE_API_BASE_URL` is a build-time setting, so changing it requires a rebuild. Never add `GITHUB_TOKEN` or any secret to Vite environment variables or the browser bundle.

CORS must be configured on the backend; it cannot be fixed by a frontend request header or `no-cors`. A successful terminal request alone does not prove browser access works. This repository does not modify or deploy the backend.

Official references: [Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Current Azure CORS configuration

Verified on 2026-09-10: App Service `github-battle-emanuel` in `github-battle-rg` allows `http://localhost:5173`, `http://localhost:5174`, `http://localhost:4173` and `https://emanueldemarao18.github.io`. Credential support is disabled. CORS is managed by Azure App Service. Keep this allowlist synchronized if development ports change.
