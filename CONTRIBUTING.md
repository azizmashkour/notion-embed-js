# Contributing to notion-embed-js

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

### Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/your-username/notion-embed-js.git
   cd notion-embed-js
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the project:

   ```bash
   pnpm build
   ```

4. Run tests:

   ```bash
   pnpm test
   ```

## Development Workflow

- Make changes in the `src/` directory
- Add or update tests in the `tests/` directory
- Ensure all tests pass: `pnpm test`
- Ensure the build succeeds: `pnpm build`

## Submitting Changes

1. Create a new branch for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Commit your changes with clear, descriptive messages:

   ```bash
   git commit -m "feat: add support for dark mode option"
   git commit -m "fix: handle edge case in URL validation"
   ```

3. Push to your fork and open a Pull Request

4. Fill out the PR template and link any related issues

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Keep functions small and focused
- Add JSDoc comments for public API functions

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` – New feature
- `fix:` – Bug fix
- `docs:` – Documentation changes
- `test:` – Test additions or updates
- `chore:` – Maintenance (deps, config, etc.)

## Questions?

Open an issue for questions or discussions. We're happy to help!
