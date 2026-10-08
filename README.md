# HAMZA Store

Next.js storefront and admin dashboard backed by PostgreSQL and Prisma.

## Local setup

Requirements: Node 24, Bun 1.4.2, and PostgreSQL 17.

1. Copy `.env.example` to `.env` and fill every required value.
2. Install dependencies with `bun install --frozen-lockfile`.
3. Apply migrations with `bun run prisma:migrate:deploy`.
4. Start development with `bun run dev`.

New users have the `USER` role. Promote the first trusted administrator directly
in PostgreSQL after that account verifies its email:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'owner@example.com';
```

## Production checklist

- Set `DATABASE_URL` to a TLS-enabled production PostgreSQL connection.
- Set `APP_URL` to the canonical public HTTPS origin.
- Generate `RATE_LIMIT_HASH_SECRET` from at least 32 random characters.
- Configure SMTP credentials, a verified `SMTP_FROM` sender, and optional
  `ORDER_NOTIFICATION_EMAIL`. Verified users with the `ADMIN` role receive new
  order notifications automatically.
- Configure Cloudinary cloud name plus an unsigned upload preset restricted by
  file type, file size, and target folder.
- Configure a domain-restricted TinyMCE API key.
- Run `bun install --frozen-lockfile`, `bun run prisma:migrate:deploy`, and
  `bun run build` during deployment.
- Run one application instance only while migrations execute; then roll out the
  new application version.
- Probe `GET /api/health`; HTTP 200 means app and database are ready. HTTP 503
  means traffic should not be routed to that instance.
- Terminate TLS at a trusted reverse proxy that replaces forwarding headers.
- Back up PostgreSQL and test restoration before accepting real orders.

## Verification

```bash
bun run check
bun run test:unit
bun run build
bun run audit
```

`bun audit` currently reports one upstream `braces` advisory in build tooling.
No patched `braces` release exists in the registry yet; it is not used on a
request path. Keep CI inputs trusted and update when a patched version ships.
