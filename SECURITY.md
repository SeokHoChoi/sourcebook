# Security Policy

## Supported Versions

This repository follows the `main` branch for active hardening updates. Security fixes should be applied on `main` first and then backported only if you maintain long-lived release branches.

## Reporting a Vulnerability

- Do not open a public issue for a suspected vulnerability.
- Prefer GitHub private vulnerability reporting or a private maintainer channel.
- Include reproduction steps, impact, affected routes/files, and any proof-of-concept data.

## Security Controls In This Repository

- Immutable SHA-pinned GitHub Actions in workflow files
- `Dependency Review` on pull requests for dependency risk changes
- `Dependabot` for npm and GitHub Actions updates
- `CodeQL` workflow for JavaScript/TypeScript and GitHub Actions queries when GitHub Code Security is available
- Build provenance attestation on supported repositories
- Strict security headers and CSP baseline from `next.config.ts`
- Fail-fast environment validation for staging and production-like stages

## Required Repository Settings

These items cannot be fully enforced from source files alone and should be enabled in the GitHub repository settings:

1. Enable secret scanning and push protection.
2. Enable Dependabot alerts and security updates.
3. Require pull request review and required status checks for `main`.
4. Require approval for workflow file changes through CODEOWNERS or branch protection rules.
5. If this is a private repository with GitHub Code Security available, set:
   - `ENABLE_GITHUB_CODE_SECURITY=true`
   - `ENABLE_ATTESTATIONS=true`

## Environment Security Contract

- `APP_ENV` and `NEXT_PUBLIC_APP_ENV` define the deploy stage.
- `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL` may fall back only in `development` and `test`.
- `staging` and `production` must provide explicit values through the deployment environment.
- `NEXT_PUBLIC_APP_URL` must be an absolute `http` or `https` URL.

## CSP Maintenance Notes

The current Content Security Policy is intentionally strict for a first-party application:

- No third-party script origins are allowed.
- Inline styles are allowed because of the current styling stack.
- Development mode allows `unsafe-eval` only to keep the local toolchain working.

If you introduce analytics, OAuth popups, embedded content, or remote APIs, update the CSP and add tests for the new directives.
