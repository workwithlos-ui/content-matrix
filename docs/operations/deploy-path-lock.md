# Deploy Path Lock

## Canonical path

- Source of truth: GitHub `workwithlos-ui/content-matrix`
- Canonical branch: `main`
- Build command: `npm run build`
- Platform target: Vercel

## Requirements before deploy

- build passes locally
- no uncommitted worktree changes
- current release state documented

## Smoke checks

- app loads
- presets load
- saved history loads
- generation form accepts advanced context
- export buttons work

## Known blocker

- direct Vercel relink/handoff remains dependent on valid Vercel auth in this environment

