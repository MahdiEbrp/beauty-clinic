# beauty-clinic

![license](https://img.shields.io/github/license/MahdiEbrp/beauty-clinic)

A Next.js application for managing a beauty clinic website and its administration workflows.

## Prerequisites

- Node.js 20.9 or newer (required by the Next.js 16 toolchain).
- [Bun](https://bun.sh/) (the repository includes `bun.lock`).

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/MahdiEbrp/beauty-clinic.git
cd beauty-clinic
bun install
```

Create a local environment file based on `.env.example` and fill in the values required by your environment. Never commit secrets.

Start the development server:

```bash
bun dev
```

Open http://localhost:3000 in your browser.

## Available scripts

The following commands match the scripts currently defined in `package.json`:

| Command | Description |
| --- | --- |
| `bun dev` | Start the Next.js development server. |
| `bun build` | Build the application with the Webpack builder. |
| `bun start` | Start the production server after a build. |
| `bun lint` | Run ESLint with warnings treated as errors. |
| `bun lint:size` | Check source-file length limits. |
| `bun typecheck` | Typecheck all source, tests, and tooling. |
| `bun typecheck:build` | Typecheck the production build scope. |
| `bun run test` | Run the Vitest suite once. |
| `bun test:watch` | Run Vitest in watch mode. |
| `bun tailwind:upgrade` | Run the Tailwind CSS upgrade tool. |
| `bun db:generate` | Generate database migrations. |
| `bun db:migrate` | Apply database migrations. |
| `bun db:studio` | Open Drizzle Studio. |
| `bun db:seed` | Run the database seed script using `.env.local`. |
| `bun db:migrate-working-hours` | Run the working-hours migration script. |

## Environment variables

Copy `.env.example` to `.env.local` and configure the values needed for your setup. Keep credentials and other secrets out of source control. In production, configure secrets through your hosting provider.

## Project structure

- `app/` — Next.js App Router pages and API routes.
- `components/` — shared UI and feature components.
- `lib/` — application services and utilities.
- `src/` — database, internationalization, and supporting application code.
- `public/` — static assets.
- `scripts/` — maintenance and database scripts.
- `messages/` — localization messages.

## Tests and quality checks

```bash
bun run test
bun typecheck
bun lint
bun lint:size
```

Next.js uses `tsconfig.build.json`, inheriting strict compiler settings from
`tsconfig.json` but excluding unit tests, test helpers, and Vitest/Drizzle tooling
configs. Production type checking stays enabled without requiring test-only
packages in deployment. The full `bun typecheck` still includes tests and must
run with development dependencies installed. A passing build does not replace
the full typecheck, lint, or test suite.

## Deployment

Build and start the application with:

```bash
bun build
bun start
```

The application can be deployed to a Node.js hosting environment that supports the Next.js production server. Configure the required environment variables in the hosting provider before deployment.

## Contributing

- Open an issue to discuss substantial changes.
- Keep pull requests focused.
- Run the relevant checks before submitting changes.

## License

This repository is released under the MIT License. See [LICENSE](./LICENSE).
