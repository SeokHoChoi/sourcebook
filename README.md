# Sourcebook

Local-first learning repository for official technical documentation and short-form field notes.

This workspace stores official source text verbatim, then layers Korean direct-reading notes, selective vocabulary glosses, dev notes, recall questions, speaking prompts, and learner memory on top as separate Git-tracked files.

The app is read-only for learning flow. Codex updates repository files for intake, overlays, glossary entries, learner events, and review queue changes.

## Current Scope

- Multi-category catalog:
  - `frontend/react-hook-form` (active)
  - `frontend/react` (planned)
  - `frontend/next` (planned)
  - `career/resume` (planned)
  - `career/interview` (planned)
  - `notes/question-log` (active)
- React Hook Form curriculum is tracked in:
  - `library/frontend/react-hook-form/references/curriculum.md`
- RHF roadmap now includes onboarding sections + core API + support API + reference pages
- Sample pages currently completed:
  - `Get Started - Installation + Example`
  - `Get Started - Register fields`
  - `Get Started - Apply validation`
  - `useForm`
  - `register`

## Content Layout

```text
library/
  catalog.json                           # category -> track map
  <category>/<track>/
    track.json                           # track metadata + page list
    pages/<page-slug>/
      source.md                          # official raw source (verbatim only)
      structure.json                     # section/paragraph/sentence segment metadata
      overlay.ko.json                    # Korean overlays by segment
    glossary/terms.json                  # track-level terminology
    learner/events.ndjson                # append-only learner events
    learner/patterns.json                # repeated confusion patterns
    review/queue.json                    # spaced review queue
```

## Formatting Contract

- `source.md` keeps the copied official source verbatim, including menu, ads, footer, and surrounding chrome.
- The reading UI must format preserved raw source into readable blocks instead of dumping it as one raw `pre`.
- `structure.json` should select only learning-worthy segments. Full-page docs should follow official top-level menu boundaries when available.
- Prose cards should keep the English sentence visible first, then place Korean direct-reading support immediately below it.
- Slash chunking is a support layer, not the primary text. Avoid over-segmented card stacks that break sentence and paragraph coherence.
- Code should default to an editor-like block with readable highlighting and line-adjacent annotations tied to the relevant identifier or flow.
- Avoid duplicating the same code explanation in a separate `코드 읽기` panel if it can be shown directly on or near the code.
- `devNote`, `trickySentenceExplanation`, and glossary items should stay selective and low-noise.

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

Manual intake for a queued page:

```bash
pnpm intake:scaffold -- frontend react-hook-form formstate
```

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
- `pnpm verify:push` - local push gate: `validate` + production build
- `pnpm verify` - full local gate: `validate` + coverage + build + E2E

Run `pnpm build` before `pnpm test:e2e` when you are not reusing a CI build artifact.

## Development Workflow

- Work on a feature branch, not directly on `main`.
- `.husky/pre-commit` formats and lints staged files.
- `.husky/commit-msg` enforces the Conventional Commits + Korean subject rule.
- `.husky/pre-push` runs `pnpm verify:push`, so a push is blocked if lint, format, type-check, unit/integration tests, or build fail.
- For UI, route, metadata, environment-contract, or runtime-behavior changes, run `pnpm verify` before merging.
- CI remains the final gate for `lint`, `type-check`, `test:coverage`, `build`, and `test:e2e`.

## Commit Convention

- Husky runs `commitlint` on every commit via `.husky/commit-msg`.
- Commit messages follow Conventional Commits.
- The commit `type` stays in the standard enum: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `ci`.
- The commit `subject` must include Korean.
- Recommended format: `<type>: <한국어 요약>`
- Valid example: `fix: E2E 아티팩트 복원 경로 안정화`
- Invalid example: `fix: harden e2e artifact restore`

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
