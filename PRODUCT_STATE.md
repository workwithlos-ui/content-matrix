# Product State

## Canonical

- Product: Content Matrix
- Repo: https://github.com/workwithlos-ui/content-matrix
- Branch: `main`
- Current baseline: `42daf04`
- Intended deploy target: Vercel

## Purpose

Content Matrix is now positioned as a client-ready content operating system, not just a one-shot generator.

Current core capabilities:

- brand-kit presets
- client/workspace memory
- campaign goal and offer context
- proof bank and competitor context
- swipe-file memory
- strategy brief output
- piece scorecards
- review workflow
- client pack exports

## Recovery order

1. GitHub `main`
2. GitHub backup branch
3. GitHub release tag
4. local git bundle
5. local mirror clone
6. local source tarball

## Verification

- local build: `npm run build`
- clean worktree required before making new release artifacts

