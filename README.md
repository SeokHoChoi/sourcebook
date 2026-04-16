# Sourcebook

Production-grade Next.js 16 starter with TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, Playwright, ESLint, Prettier, Husky, lint-staged, and Commitlint.

## Requirements

- Node.js 24.x recommended
- Node.js 22.x or 24.x supported by this project
- Node.js 20.9.0+ required by Next.js 16
- pnpm 10.x

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Strategy

- `.env.example` is the generic template for all environments.
- `.env.development.example` is the starting point for local development. Copy it into `.env.local`.
- `.env.test` is committed on purpose and loaded by Vitest through `@next/env`.
- `.env.staging.example` and `.env.production.example` are documentation templates only. Next.js does not auto-load a `.env.staging` file, so staging and production values should be supplied by your hosting platform or secret manager.
- `APP_ENV` and `NEXT_PUBLIC_APP_ENV` define the app stage: `development`, `test`, `staging`, or `production`. On Vercel, `VERCEL_ENV=preview|production` is also respected.
- `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL` may fall back in `development` and `test`, but they are required in `staging` and `production`.
- `NODE_ENV` alone is not treated as a deploy-stage signal. Use `APP_ENV`, `NEXT_PUBLIC_APP_ENV`, or your platform-provided environment.
- `NEXT_PUBLIC_APP_URL` is the canonical public URL, not the internal Playwright server binding.

## Security Baseline

- Runtime responses include a baseline Content Security Policy and security headers.
- GitHub Actions are pinned to immutable SHAs.
- Dependency Review, Dependabot, and CodeQL workflows are included for supply-chain checks.
- `SECURITY.md` documents the remaining repository settings that must be enabled in GitHub itself.
- For private repositories, set `ENABLE_GITHUB_CODE_SECURITY=true` and `ENABLE_ATTESTATIONS=true` only when your GitHub plan supports those features.

## Scripts

- `pnpm dev` - start development server
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm lint:strict` - ESLint with 0 warnings allowed
- `pnpm format:check` - Prettier check
- `pnpm type-check` - `next typegen` + TypeScript type check
- `pnpm test` - Vitest run
- `pnpm test:coverage` - Vitest with coverage
- `pnpm test:e2e` - Playwright E2E against production server
- `pnpm validate` - lint + format + type-check + unit/integration tests

Run `pnpm build` before `pnpm test:e2e` when you are not reusing a CI build artifact.

## Testing Strategy

- Sync components, hooks, and utilities: Vitest + React Testing Library
- `async` Server Components: Playwright E2E
- Playwright binds the app to an isolated loopback URL during tests so it does not collide with other local servers.

## Agent Notes

- Read `AGENTS.md` before modifying project code
- `CLAUDE.md` imports `AGENTS.md` for Claude Code compatibility
- Next.js docs bundled in `node_modules/next/dist/docs/` are the source of truth
- Cursor uses the workspace `.vscode` settings in this repository
- Read `SECURITY.md` before changing workflows, environment contracts, or response headers
