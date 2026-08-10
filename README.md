# beauty-clinic

![license](https://img.shields.io/github/license/MahdiEbrp/beauty-clinic)

A modern Next.js + TypeScript starter app for a beauty clinic website. This repository contains a frontend built with Next.js (App Router) and TypeScript, with styles and assets for a responsive clinic site.

## Features

- Next.js (App Router) with TypeScript
- Server and client components where appropriate
- Optimized fonts and images using Next.js built-in features
- Responsive layout and basic styling

> NOTE: This README is a project overview. Adjust the sections below to match any backend services, environment variables, or third-party integrations you add.

## Table of contents

- [Getting started](#getting-started)
- [Prerequisites](#prerequisites)
- [Available scripts](#available-scripts)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Dependencies (high level)](#dependencies-high-level)
- [Database commands](#database-commands)
- [Tests & Linting](#tests--linting)
- [Deploy](#deploy)
- [Contributing](#contributing)
- [License](#license)

## Getting started

Clone the repo and install dependencies:

```bash
# clone
git clone https://github.com/MahdiEbrp/beauty-clinic.git
cd beauty-clinic

# install (choose one)
npm install
# or
yarn
# or
pnpm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 in your browser. Edit `app/page.tsx` (or other files under `app/`) — changes will auto-refresh.

## Prerequisites

- Node.js 18.x or newer is recommended (verify against the Next.js version used).
- A package manager: npm, yarn, or pnpm.

## Available scripts

These scripts are taken directly from this repo's package.json — use them as-is.

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint --max-warnings=300",
  "lint:size": "node scripts/check-file-lengths.mjs",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "node --env-file=.env.local --import tsx ./src/db/seed.ts"
}
```

- `dev` — Runs the app in development mode on localhost:3000.
- `build` — Builds the application for production.
- `start` — Starts the production server (run after `build`).
- `lint` / `lint:size` — Runs ESLint checks (and a custom file-length check).
- `typecheck` — Runs TypeScript type checking.
- `test` / `test:watch` — Runs tests with Vitest.
- `db:*` — Drizzle Kit helper scripts for generating, migrating, and opening the DB studio; `db:seed` runs a local seed script.

## Environment variables

If your project requires environment variables, create a `.env.local` file in the repository root and add variables there. Example:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

Do NOT commit secrets to the repository. For production, use your hosting provider's secrets management.

## Project structure

A typical layout for this repo:

```
/app                  # Next.js App Router pages and components
/public               # Static assets (images, favicon)
/styles               # Global and component styles (CSS/SCSS)
/scripts              # repository scripts (lint:size)
/src                  # source code (components, hooks, services)
/src/db               # database seeds and schema helpers
/next.config.js       # Next.js configuration
/tsconfig.json        # TypeScript configuration
/package.json
/README.md
/LICENSE
```

Adjust the structure section to reflect any additional folders you add.

## Dependencies (high level)

This project uses React + Next.js with TypeScript and several useful libraries (partial list):

- next
- react / react-dom
- tailwindcss
- drizzle-orm / drizzle-kit (database tooling)
- zod (validation)
- react-hook-form (forms)
- vitest (tests)

See package.json for the full dependency list and exact versions.

## Database commands

This project includes Drizzle Kit scripts. Common DB tasks:

- Generate types/migrations: `npm run db:generate`
- Run migrations: `npm run db:migrate`
- Open DB studio: `npm run db:studio`
- Seed local DB (reads `.env.local`): `npm run db:seed`

## Tests & Linting

- Run tests once: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## Deploy

The easiest way to deploy is using Vercel. Connect this GitHub repository and deploy the default branch. For manual deployment on a server:

```bash
npm run build
npm run start
```

Check Next.js docs for other hosts and advanced configuration: https://nextjs.org/docs/app/building-your-application/deploying

## Contributing

Contributions are welcome.

- Open an issue to discuss major changes.
- Create a focused pull request with one change per PR.
- Run linters and formatters before submitting.

## License

This repository is released under the MIT License — see [LICENSE](./LICENSE) for details.

---

If you'd like, I can also:
- Add screenshots and a demo link to the README.
- Add CI badges (GitHub Actions) once you enable workflows.
- Add a CODE_OF_CONDUCT or CONTRIBUTING.md file and an explicit PR template.
