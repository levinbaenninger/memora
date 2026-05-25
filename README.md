# Memora

Memora is a personal notes and tasks workspace. Write rich-text notes, organize them with folders and tags, and navigate via a single-sidebar shell with path-based filter views and a global Command Menu.

## Tech Stack

- **Runtime / package manager:** Bun
- **Monorepo:** Turborepo + Bun workspaces
- **Web app:** TanStack React Start (SSR), TanStack Router, TanStack Query, React 19, Vite
- **API:** oRPC (typed contracts, TanStack Query integration)
- **Editor:** BlockNote
- **Auth:** Better Auth
- **Database:** PostgreSQL (Neon serverless) via Drizzle ORM
- **UI:** Tailwind CSS v4, shadcn/ui, Base UI
- **Email:** React Email + Resend
- **Observability:** Sentry
- **Tooling:** Biome (via Ultracite), Commitlint, Husky, lint-staged

## Repository Layout

```text
apps/
  web/               TanStack Start web application
packages/
  api/               oRPC contracts, routers, server handler
  auth/              Better Auth setup, sessions, plugins
  config/            Shared tsconfig and tooling presets
  db/                Drizzle schema, migrations, client
  email/             React Email templates and senders
  env/               Typed environment loading (@t3-oss/env-core + zod)
  ui/                Shared UI primitives and shadcn components
docs/                ADRs and agent guides
CONTEXT.md           Domain language and relationships
```

## Prerequisites

- Bun `1.3.13` (pinned via `packageManager`)
- Node.js `>= 24.3.0`
- A PostgreSQL database (Neon recommended)
- An Upstash Redis database (free tier) for rate limiting — required in all environments. Create one at <https://console.upstash.com> and grab the REST URL + token from the database's REST API panel.

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment**

   Copy `.env.example` to `apps/web/.env` and fill in the values. Variables are validated at boot by `@memora/env`.

   ```bash
   cp .env.example apps/web/.env
   ```

3. **Apply database migrations**

   ```bash
   bun run db:generate   # generate SQL from schema changes
   bun run db:migrate    # apply migrations
   bun run db:studio     # open Drizzle Studio
   ```

4. **Run the dev server**

   ```bash
   bun run dev
   ```

   The web app starts via Turborepo with hot reload.

## Scripts

Root-level Turborepo tasks:

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun run dev`         | Run all `dev` tasks (web app on Vite)         |
| `bun run build`       | Build all apps and packages                   |
| `bun run check-types` | Type-check the entire workspace               |
| `bun run check`       | Lint + format check via Ultracite (Biome)     |
| `bun run fix`         | Auto-fix lint/format issues                   |
| `bun run db:generate` | Generate Drizzle migrations from schema       |
| `bun run db:migrate`  | Apply Drizzle migrations                      |
| `bun run db:studio`   | Open Drizzle Studio against the configured DB |
| `bun run commit`      | Commitizen-driven Conventional Commits prompt |

## Conventions

- **Package manager:** always use `bun` / `bunx`. Never `npm`, `npx`, or `pnpm`.
- **Commits:** Conventional Commits, enforced by Commitlint via a Husky hook. Use `bun run commit` for guided prompts.
- **Linting / formatting:** Ultracite (Biome preset). Pre-commit hook runs `lint-staged`.
- **Domain language:** see `CONTEXT.md` for the canonical vocabulary (Note, Folder, Tag, View, Grid, Detail, Command Menu).
- **Architecture decisions:** see `docs/adr/`.
- **Issues:** tracked on GitHub Issues; see `docs/agents/issue-tracker.md`.

## License

[MIT](./LICENSE)
