# Mind‑Blown Diagnostic (GitHub Pages Ready)

Vite + React + TypeScript + Tailwind app that determines whether (and how hard) your mind is blown.
Includes a GitHub Actions workflow that builds and deploys on pushes to `main`.

## Local Dev
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages Deployment
1. Create a new GitHub repo and push this project.
2. The included workflow `.github/workflows/deploy.yml` will build and deploy on pushes to `main`.
3. Pages URL will appear in the workflow summary after successful deploy.

(Notes: `vite.config.ts` auto-sets the correct `base` for GitHub Pages in CI.)

## License
MIT
