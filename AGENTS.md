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
- Commit messages use Conventional Commits with Korean subjects
- Preferred format: `<type>: <한국어 요약>` (example: `fix: E2E 아티팩트 복원 경로 안정화`)
- Before reporting completion, run `pnpm lint:strict`, `pnpm format:check`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`, `pnpm build`, and `pnpm test:e2e`

## Sourcebook Formatting Contract

- `source.md` is a verbatim archive. Keep pasted source intact, including menu text, ads, footer, and surrounding chrome.
- Raw source must not be dumped as a giant unformatted `pre`. Preserve content, but reorganize the view into readable blocks.
- `structure.json` selects learning-worthy segments only. Do not turn every copied line into a study card.
- Full-page docs should use official menu/top-level section boundaries for the primary outline whenever those labels exist.
- Prose segments should keep the English sentence visible first, with Korean direct-reading support immediately below it. Avoid over-fragmented card stacks that break discourse coherence.
- Slash chunking is allowed only as reading support. Do not replace the original sentence with chunks only.
- Code segments should default to an editor-style presentation with readable highlighting and inline or line-adjacent annotations tied to the relevant code line.
- Avoid a separate low-signal `코드 읽기` panel under code when the same explanation can be attached directly to the code block.
- `devNote` should stay short and explain the programming meaning or worked-example role of the snippet, not restate every line.
- `trickySentenceExplanation` should only be used for genuinely confusing phrasing, syntax, or reasoning jumps.
- `selectiveVocabGlosses` should stay selective. Only annotate terms that materially improve comprehension.
