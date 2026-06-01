# Lexon & Associates Law Firm

A full-stack legal services platform where clients submit legal queries and admins manage everything — built with role-based access (client vs admin), Clerk authentication, and a PostgreSQL backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/legal-web run dev` — run the frontend (port 20602)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + shadcn/ui
- Auth: Clerk (Replit-managed) with cookie-based session, client/admin roles
- API: Express 5 with Clerk middleware, Zod validation
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (users, legal_queries, documents)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/legal-web/src/` — React frontend (pages, components)

## Architecture decisions

- Role stored in DB (`users.role`), not Clerk metadata — role is always fetched via `/api/users/me`
- Users auto-provisioned on first API call (JIT provisioning from Clerk userId + email from sessionClaims)
- Admin sees all queries; clients only see their own — enforced server-side
- Cookie-based auth (no Bearer tokens) — Clerk's Express middleware handles session cookies
- File uploads stored as URLs (no binary upload) — admin provides file URL

## Product

- **Landing page** — public, shows practice areas and CTAs to sign in/register
- **Dashboard** — stats cards and query breakdown chart (admin sees all stats; clients see own)
- **Queries** — submit and track legal queries by category; admin can update status and add notes
- **Documents** — admin uploads documents by URL; clients can view and download
- **Contact** — firm address, phone, email, business hours
- **Admin Users** — admin can view all users and change their roles
- **Profile** — edit first name, last name, phone

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after adding new schema files so downstream packages pick up the new exports
- Clerk: `proxyUrl` is empty in dev (intentional) — auto-set in production
- Do NOT add Authorization headers to browser API calls — auth is cookie-based
- Re-run codegen after every OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk setup details and troubleshooting
