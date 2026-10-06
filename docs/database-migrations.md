# Database migrations

This repository now uses Prisma Migrate for schema history.

## Existing databases

The first migration is a **baseline** named `0_init`. It represents the schema that already existed before migration history was introduced.

For any existing database that already contains the current application schema, do **not** run `migrate deploy` first. Mark the baseline as already applied once:

```bash
bun run prisma:migrate:baseline:resolve
```

Then verify migration state:

```bash
bun run prisma:migrate:status
```

After the baseline is recorded, future deployments use:

```bash
bun run prisma:migrate:deploy
```

## New databases

For a brand-new empty database, do not mark the baseline as applied. Run:

```bash
bun run prisma:migrate:deploy
```

Prisma will create the complete schema from `0_init` and then apply all later migrations.

## Development workflow

After changing `prisma/schema.prisma`, create a new migration in a disposable/development database with Prisma Migrate. Review the generated SQL before committing it.

Never:

- run `prisma migrate reset` against production;
- edit an already-applied migration;
- use `db push` as a production deployment mechanism;
- mark future migrations as applied unless reconciling a deliberately pre-applied change.

## Deployment order

For schema-changing releases:

1. Back up the production database.
2. Confirm `bun run prisma:migrate:status`.
3. Run `bun run prisma:migrate:deploy`.
4. Deploy the application version that expects the new schema.
5. Verify application health and migration state.

The baseline procedure follows Prisma ORM's existing-database baselining workflow.
