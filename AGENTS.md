<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Agent Notes

- Primary coding agent: Codex app
- Secondary coding agent: Claude Code
- Editor: Cursor
- Package manager: pnpm
- App Router only (`src/app`)
- Use `@/*` -> `src/*`
- For Next.js work, prefer version-matched docs in `node_modules/next/dist/docs/`
- Read `SECURITY.md` before changing CI workflows, deploy environment contracts, or response headers
- Keep GitHub Actions pinned to immutable SHAs; do not switch workflow actions back to mutable tags
- `APP_ENV` / `NEXT_PUBLIC_APP_ENV` are the environment contract: `development`, `test`, `staging`, `production`
- Treat `VERCEL_ENV=preview|production` as a valid deployment-stage signal when present
- Do not use `NODE_ENV` alone as the deployment-stage signal for env validation
- `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL` may use defaults in `development` and `test`, but must fail fast in `staging` and `production`
- `.env.staging.example` and `.env.production.example` are templates only; real staging and production values belong in the deployment environment
- Runtime responses should keep the CSP and security header baseline unless there is a documented reason to change it
- `async` Server Components should be covered with Playwright E2E, not Vitest unit tests
- Sync components, hooks, and utilities should be tested with Vitest + React Testing Library
- Before reporting completion, run `pnpm lint:strict`, `pnpm format:check`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`, `pnpm build`, and `pnpm test:e2e`
