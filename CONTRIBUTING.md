# Contributing to react-honeypot-field

Thank you for taking the time to contribute. This document covers everything you need to get started.

## Code of Conduct

Be kind and constructive. Harassment of any kind is not tolerated.

## How to Contribute

### Reporting bugs

Open an issue using the **Bug report** template. Include a minimal reproduction — the faster we can reproduce it, the faster we can fix it.

### Suggesting features

Open an issue using the **Feature request** template. Explain the problem you're solving, not just the solution you want.

### Submitting a pull request

1. **Fork** the repository and create a branch from `main`.
2. **Install** dependencies: `npm install`
3. **Make your changes** in `src/`.
4. **Add or update tests** in `tests/`. Coverage should not decrease.
5. **Run the full CI suite locally**: `npm run ci`
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add X` — new feature (triggers minor release)
   - `fix: correct Y` — bug fix (triggers patch release)
   - `feat!: change Z` — breaking change (triggers major release)
   - `docs:`, `chore:`, `test:`, `refactor:` — no release

7. **Open a PR** against `main`. Fill in the PR template.

### What makes a good PR

- One focused change per PR
- Tests that prove the change works (and catch regressions)
- Updated types and JSDoc if the public API changed
- Updated README if usage changed

## Development Setup

```bash
git clone https://github.com/oleg-koval/react-honeypot-field.git
cd react-honeypot-field
npm install

# Run tests in watch mode
npm run test:watch

# Full CI check (what GitHub runs)
npm run ci

# Build the package
npm run build
```

## Project Structure

```
src/
  index.ts          — public exports
  HoneypotField.tsx — React component
  useHoneypot.ts    — React hook
  validate.ts       — server-side validation
  types.ts          — shared TypeScript types
tests/
  *.test.{ts,tsx}   — Vitest test suites
examples/
  nextjs/           — Next.js App Router example
docs/
  README.md         — Documentation index (managed by docs-index-keeper)
```

## Release Process

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/). Every merge to `main`:

1. Analyses commit messages since the last release
2. Determines the next version (patch / minor / major)
3. Generates `CHANGELOG.md`
4. Publishes to npm
5. Creates a GitHub Release with release notes
6. Commits the updated `package.json` and `CHANGELOG.md` back to `main`

**You never bump versions manually.** Write good commit messages and the tooling does the rest.

## Questions?

Open a [Discussion](https://github.com/oleg-koval/react-honeypot-field/discussions) for anything that doesn't fit a bug report or feature request.
